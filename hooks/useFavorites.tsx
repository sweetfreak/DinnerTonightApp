// import { useState, useEffect } from "react";
// import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
// import { db } from "../firebase/firebaseConfig"
// import { useAuth } from "../contexts/authContext/index";


// export default function useFavorites(initialFavorites?: string[]) {
//   const { currentUser } = useAuth();
//   const [favorites, setFavorites] = useState<string[]>(initialFavorites || []);
//   const [loading, setLoading] = useState(!initialFavorites);

//   useEffect(() => {
//     if (!currentUser || initialFavorites) {
//       setLoading(false);
//       return;
//     }

//     const fetchFavorites = async () => {
//       try {
//         const userRef = doc(db, "users", currentUser.uid);
//         const userSnap = await getDoc(userRef);
//         if (userSnap.exists()) {
//           setFavorites(userSnap.data().savedRecipes || []);
//         }
//       } catch (error) {
//         console.error("Failed to load favorites:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFavorites();
//   }, [currentUser, initialFavorites]);

//   // Toggle a recipe as favorite/unfavorite
//   // const toggleFavorite = async (recipeId: string) => {
//   //   if (!currentUser) return;

//   //   const userRef = doc(db, "users", currentUser.uid);
//   //   const isFavorite = favorites.includes(recipeId);

//   //   // Update local state immediately
//   //   setFavorites((prev) =>
//   //     isFavorite ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
//   //   );

//   //   try {
//   //     // Sync to Firestore
//   //     await updateDoc(userRef, {
//   //       savedRecipes: isFavorite ? arrayRemove(recipeId) : arrayUnion(recipeId),
//   //     });
//   //   } catch (error) {
//   //     console.error("Failed to update favorites:", error);
//   //     // Revert local state on error
//   //     setFavorites((prev) =>
//   //       isFavorite ? [...prev, recipeId] : prev.filter((id) => id !== recipeId)
//   //     );
//   //   }
//   // };

//   return { favorites, loading} //toggleFavorite, loading };
// }