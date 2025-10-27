import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import RecipeCard from "./RecipeCard";
import type  Recipe  from "../../types/Recipe";
import useFavorites from "../../hooks/useFavorites";

import {Text, View, ScrollView} from 'react-native'
import { Link } from "expo-router";
import { useUserProfile } from "../../contexts/UserProfileContext";

export default function RecipeSearch() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const { favorites, toggleFavorite } = useFavorites(); // ✅ Add this
  
  useEffect(() => {
    async function fetchAllRecipes() {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const allFetchedRecipes = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Recipe),
        id: doc.id,
      }));
      setAllRecipes(allFetchedRecipes);
    }
    fetchAllRecipes();
  }, []); // ✅ dependency should be [], not [allRecipes]

  return (
    <ScrollView>
      <Text className="flex text-2xl place-content-center p-10">
        Search All Recipes
      </Text>
      {allRecipes.length > 0 ? (
        allRecipes.map((dish) => (
          <RecipeCard
            key={dish.id}
            recipe={dish}
            isFavorite={favorites.includes(dish.id)}
            toggleFavorite={() => toggleFavorite(dish.id)}
          />
        ))
      ) : (
        <Text>No recipes</Text>
      )}
    </ScrollView>
  );
}