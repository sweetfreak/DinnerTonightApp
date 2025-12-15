// import * as functions from 'firebase-functions'
// import * as admin from 'firebase-admin'
// import fetch from 'node-fetch'
// import * as cheerio from "cheerio"
// import { normalizeRecipe } from "./normalizeRecipe";


// admin.initializeApp()
// const db = admin.firestore()

// export const scrapeRecipe = functions.https.onRequest(async (req, res) => {
//     try {
//         const { url } = req.body
//         if (!url) {
//             res.status(400).json({ error: "missing URL"})
//             return
//         }

//         const cachedSnap = await db
//             .collection('scrapedRecipes')
//             .doc(encodeURIComponent(url))
//             .get()

//         if (cachedSnap.exists) {
//             res.json(cachedSnap.data())
//             return
//         }

//         const html = await fetch(url, {
//             headers: {"User-Agent": "Mozilla/5.0"},
//         }).then(r => r.text())

//         const $ = cheerio.load(html)

//         const scripts = $('script[type="application/ld+json"]')
//             .map((_, el) => $(el).html())
//             .get()
//         let recipeData: any = null;

//     for (const script of scripts) {
//       const parsed = JSON.parse(script || "{}");
//       const graph = parsed["@graph"] || [parsed];
//       recipeData = graph.find((n: any) => n["@type"] === "Recipe");
//       if (recipeData) break;
//     }

//     if (!recipeData) {
//       throw new Error("No recipe schema found");
//     }

//     // 🧠 Normalization
//     const normalized = normalizeRecipe(recipeData, url);

//     // 💾 CACHE SAVE
//     await db
//       .collection("scrapedRecipes")
//       .doc(encodeURIComponent(url))
//       .set({
//         ...normalized,
//         scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
//       });

//     res.json(normalized);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Scraping failed" });
//     }
// })