import { onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { normalizeRecipe } from "./normalizeRecipe";

admin.initializeApp();
const db = admin.firestore();
console.log("Test")
export const scrapeRecipe = onRequest(
  { region: "us-central1", cors: true },
  async (req, res) => {
    try {
      const { url } = req.body;
      console.log("🔗 Scraping URL:", url);
      if (!url) {
        res.status(400).json({ error: "Missing URL" });
        return;
      }

      const cacheId = encodeURIComponent(url);
      const cached = await db.collection("scrapedRecipes").doc(cacheId).get();
      if (cached.exists) {
        console.log("📦 Cache hit for:", url);
        res.json(cached.data());
        return;
      }

      const html = await fetch(url, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
        },
      }).then(r => r.text());
      console.log("📄 HTML length:", html.length);

      const $ = cheerio.load(html);
      
      // Look for JSON-LD scripts
      const scripts = $('script[type="application/ld+json"]')
        .map((_, el) => $(el).html())
        .get();
      console.log("📦 JSON-LD scripts found:", scripts.length);

      let recipeData: any = null;
      
      // Try to find Recipe in JSON-LD
      for (const s of scripts) {
        try {
          const parsed = JSON.parse(s || "{}");
          const graph = parsed["@graph"] || [parsed];
          const found = graph.find((n: any) => n["@type"] === "Recipe");
          if (found) {
            console.log("✅ Recipe schema found in JSON-LD:", found.name);
            recipeData = found;
            break;
          }
        } catch (e) {
          console.log("⚠️ JSON parse failed for script");
        }
      }

      // If no JSON-LD recipe found, try microdata and other methods
      if (!recipeData) {
        console.log("⚠️ No JSON-LD recipe found, trying alternative methods...");
        
        // Try to extract recipe name from common selectors
        const recipeName = 
          $('h1[class*="recipe"]').first().text() ||
          $('h1').first().text() ||
          $('[class*="recipe-title"]').first().text() ||
          $('[class*="dish-name"]').first().text();
        
        if (recipeName && recipeName.trim().length > 0) {
          console.log("✅ Found recipe name from DOM:", recipeName);
          
          // Extract author more carefully - just get direct text content
          let authorText = "";
          const authorElement = $('[class*="author"]').first();
          if (authorElement.length > 0) {
            // Get only the immediate text, not nested elements
            authorText = authorElement.contents().filter(function() {
              return this.type === 'text';
            }).text().trim();
            // If that didn't work, try to get just the first few words
            if (!authorText) {
              authorText = authorElement.text().split('\n')[0].split(',')[0].trim();
            }
            // Limit to first 50 chars to avoid pulling in dates/metadata
            authorText = authorText.substring(0, 50);
          }
          
          recipeData = {
            name: recipeName.trim(),
            description: $('[class*="description"]').first().text().substring(0, 200) || "",
            image: $('img[src*="recipe"], img[class*="recipe"], img').first().attr('src') || "",
            author: { name: authorText }
          };
        }
      }

      if (!recipeData) {
        console.log("❌ No recipe data found in page");
        res.status(404).json({ 
          error: "Recipe schema not found", 
          hint: "This website doesn't appear to have recipe structured data. Try another recipe website or enter manually." 
        });
        return;
      }

      const normalized = normalizeRecipe(recipeData, url);
      console.log("🍳 Normalized recipe:", {
        dishName: normalized.dishName,
        ingredientsCount: normalized.ingredients.length,
        instructionsCount: normalized.instructions.length,
      });

      // Attempt to find a better image candidate if none or if remote image should be processed
      let finalImageUrl = normalized.imageURL || null;

      // Validate that finalImageUrl is an https URL; if not, clear it and search for alternatives
      if (finalImageUrl && typeof finalImageUrl === "string" && !finalImageUrl.startsWith("https://")) {
        console.log("⚠️ Image URL is not https, searching for alternatives:", finalImageUrl);
        finalImageUrl = null;
      }

      // Check common meta tags
      if (!finalImageUrl) {
        const og = $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content') || $('link[rel="image_src"]').attr('href');
        if (og) {
          try { finalImageUrl = new URL(og, url).href; } catch { finalImageUrl = og; }
          // Validate it's https
          if (finalImageUrl && !finalImageUrl.startsWith("https://")) {
            finalImageUrl = null;
          }
        }
      }

      // If still not found, pick a probable article image (avoid author avatars/logos)
      if (!finalImageUrl) {
        const imgCandidates: Array<any> = $('img')
          .map((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('data-original');
            const cls = $(el).attr('class') || '';
            const width = parseInt($(el).attr('width') || '0') || 0;
            const height = parseInt($(el).attr('height') || '0') || 0;
            return { src, cls, width, height };
          })
          .get()
          .filter((c: any) => c.src)
          .filter((c: any) => !/author|avatar|profile|logo|thumbnail/i.test((c.src + ' ' + c.cls)));

        // Resolve absolute URLs and sort by area (largest first), only keeping https
        imgCandidates.forEach((c: any) => {
          try { c.resolved = new URL(c.src, url).href; } catch { c.resolved = c.src; }
          c.area = (c.width || 0) * (c.height || 0);
        });

        // Filter to only https URLs
        const httpsOnly = imgCandidates.filter((c: any) => c.resolved && c.resolved.startsWith("https://"));
        httpsOnly.sort((a: any, b: any) => (b.area || 0) - (a.area || 0));
        if (httpsOnly.length > 0) finalImageUrl = httpsOnly[0].resolved;
      }

      // If still no image, try the contentUrlBackup from normalizeRecipe
      if (!finalImageUrl && (normalized as any).contentUrlBackup && typeof (normalized as any).contentUrlBackup === "string") {
        const backupUrl = (normalized as any).contentUrlBackup;
        if (backupUrl.startsWith("https://")) {
          console.log("🔄 Using contentUrlBackup as fallback:", backupUrl);
          finalImageUrl = backupUrl;
        }
      }

      // If we have a final image URL, attempt to download and upload to Cloud Storage and return a signed URL
      if (finalImageUrl) {
        try {
          const resp = await fetch(finalImageUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          if (resp.ok) {
            const arrayBuffer = await resp.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = resp.headers.get('content-type') || 'image/jpeg';

            // choose extension
            const extMatch = (finalImageUrl.match(/\.([a-zA-Z0-9]{3,4})(?:[?#]|$)/) || [])[1];
            const ext = extMatch ? `.${extMatch}` : (contentType.includes('png') ? '.png' : '.jpg');

            const bucket = admin.storage().bucket();
            // Save image into scraped-images folder
            const destPath = `scraped-images/${cacheId}${ext}`;
            const file = bucket.file(destPath);
            await file.save(buffer, { contentType, resumable: false });

            // Make a signed URL valid for 1 year
            const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 365 * 24 * 60 * 60 * 1000 });
            // attach signed url and storage path (non-enumerable friendly)
            normalized.imageURL = signedUrl;
            // optionally include the storage path for debugging (frontend can ignore)
            (normalized as any)._imageStoragePath = destPath;
          } else {
            console.log('⚠️ Could not fetch image:', resp.status, finalImageUrl);
          }
        } catch (err) {
          console.log('⚠️ Image processing failed:', err);
        }
      }

      // Ensure imageURL is always a string (in case normalizeRecipe returned an object)
      if (typeof normalized.imageURL !== "string") {
        normalized.imageURL = "";
      }

      // Clean up the internal contentUrlBackup before returning to client
      delete (normalized as any).contentUrlBackup;

      // Do NOT persist scraped data to a separate collection here; return it to caller
      // Frontend can decide to save it to the `recipes` collection when user confirms.
      res.json(normalized);
    } catch (err) {
      console.error("❌ Error:", err);
      res.status(500).json({ 
        error: "Scraping failed", 
        details: (err as Error).message,
        hint: "Make sure the URL is valid and accessible. Some websites may block scrapers."
      });
    }
  }
);

export const sendChatNotification =
  functions.firestore.onDocumentCreated(
    "chats/{chatId}/messages/{messageId}",
    async (event) => {
      // unchanged
    }
  );

// import * as functions from "firebase-functions/v2";
// import * as admin from "firebase-admin";
// import fetch from "node-fetch";
// import { onRequest } from "firebase-functions/v2/https";
// import * as cheerio from "cheerio";


// admin.initializeApp();

// export const scrapeRecipe = onRequest(
//   { region: "us-central1" },
//   async (req, res) => {
//     try {
//       const { url } = req.body;

//       if (!url) {
//         res.status(400).json({ error: "Missing URL" });
//         return;
//       }

//       const response = await fetch(url, {
//         headers: { "User-Agent": "Mozilla/5.0" },
//       });

//       const html = await response.text();
//       const $ = cheerio.load(html);

//       const jsonLd = $('script[type="application/ld+json"]').first().html();
//       if (!jsonLd) {
//         res.status(404).json({ error: "No recipe data found" });
//         return;
//       }

//       const data = JSON.parse(jsonLd);
//       const recipe =
//         data["@type"] === "Recipe"
//           ? data
//           : data["@graph"]?.find((x: any) => x["@type"] === "Recipe");

//       res.json({
//         name: recipe?.name ?? "",
//         image: recipe?.image ?? "",
//         ingredients: recipe?.recipeIngredient ?? [],
//         instructions: recipe?.recipeInstructions ?? [],
//         description: recipe?.description ?? "",
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Scrape failed" });
//     }
//   }
// );

// export const sendChatNotification = functions.firestore
//   .onDocumentCreated("chats/{chatId}/messages/{messageId}", async (event) => {
//     const messageData = event.data?.data();
//     const chatId = event.params.chatId;

  

//     if (!messageData?.senderId) return;

//     const chatSnap = await admin.firestore().doc(`chats/${chatId}`).get();
//     const chat = chatSnap.data();
//     if (!chat?.participants) return;

//     const otherUserId = chat.participants.find((id: string) => id !== messageData.senderId);
//     if (!otherUserId) return;

//     const userSnap = await admin.firestore().doc(`users/${otherUserId}`).get();
//     const userData = userSnap.data();
//     if (!userData?.pushToken) return;

//     const senderSnap = await admin.firestore().doc(`users/${messageData.senderId}`).get();
//     const senderData = senderSnap.data();
//     const displayName = senderData?.displayName || "User";

//     await fetch("https://exp.host/--/api/v2/push/send", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         to: userData.pushToken,
//         sound: "default",
//         title: `New message from ${displayName ?? "user"}`,
//         body: messageData.text || "New message",
//         data: { screen: "/(tabs)/chat", params: { chatId } },
//       }),
//     });
//   });
// /**

//  * Import function triggers from their respective submodules:
//  *
//  * import {onCall} from "firebase-functions/v2/https";
//  * import {onDocumentWritten} from "firebase-functions/v2/firestore";
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// import {setGlobalOptions} from "firebase-functions";
// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// // For cost control, you can set the maximum number of containers that can be
// // running at the same time. This helps mitigate the impact of unexpected
// // traffic spikes by instead downgrading performance. This limit is a
// // per-function limit. You can override the limit for each function using the
// // `maxInstances` option in the function's options, e.g.
// // `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// // NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// // functions should each use functions.runWith({ maxInstances: 10 }) instead.
// // In the v1 API, each function can only serve one request per container, so
// // this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });


// // export const helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });
