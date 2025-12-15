import { onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { normalizeRecipe } from "./normalizeRecipe";

admin.initializeApp();
const db = admin.firestore();

export const scrapeRecipe = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: "Missing URL" });
        return;
      }

      const cacheId = encodeURIComponent(url);
      const cached = await db.collection("scrapedRecipes").doc(cacheId).get();
      if (cached.exists) {
        res.json(cached.data());
        return;
      }

      const html = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      }).then(r => r.text());

      const $ = cheerio.load(html);
      const scripts = $('script[type="application/ld+json"]')
        .map((_, el) => $(el).html())
        .get();

      let recipeData: any = null;
      for (const s of scripts) {
        const parsed = JSON.parse(s || "{}");
        const graph = parsed["@graph"] || [parsed];
        recipeData = graph.find((n: any) => n["@type"] === "Recipe");
        if (recipeData) break;
      }

      if (!recipeData) {
        res.status(404).json({ error: "No recipe schema found" });
        return;
      }

      const normalized = normalizeRecipe(recipeData, url);

      await db.collection("scrapedRecipes").doc(cacheId).set({
        ...normalized,
        scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json(normalized);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Scraping failed" });
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
