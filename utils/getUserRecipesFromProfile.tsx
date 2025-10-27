import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import type Recipe from "../types/Recipe"

export default async function getUserRecipesFromProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return [];

  const recipeIds = userSnap.data().myRecipes || [];
  if (!recipeIds.length) return [];

  const recipesRef = collection(db, "recipes");
  const q = query(recipesRef, where("__name__", "in", recipeIds.slice(0, 10))); // Firestore limit = 10 per 'in' query
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data() as Recipe,
     id: doc.id,
  }));
}