import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import RecipeCard from "./RecipeCard";
import type Recipe  from "../../types/Recipe";
import type UserProfile  from "../../types/User";
import useFavorites from "../../hooks/useFavorites";
import { useAuth } from "../../contexts/authContext";

import {Text, View, ScrollView} from 'react-native'
import { Link } from "expo-router";

import { useUserProfile } from "../../contexts/UserProfileContext";


// interface SavedRecipeProps {
//   //openRecipe: (recipe: Recipe) => void
//   currentUserProfile: UserProfile 
// }

export default function SavedRecipes() {
  //const { currentUser } = useAuth();
  const { currentUserProfile } = useUserProfile();

  const { favorites, toggleFavorite, loading } = useFavorites(currentUserProfile?.savedRecipes);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!currentUserProfile?.savedRecipes?.length) {
      console.log(currentUserProfile?.displayName)
      setSavedRecipes([]);
      return;
    }
    if (savedRecipes.length > 0) return;

    async function fetchMyRecipes() {
       try {
        const recipePromises: Promise<Recipe | null>[] = (currentUserProfile?.savedRecipes ?? []).map(async (id: string) => {
        const recipeRef = doc(db, 'recipes', id)
        const recipeSnap = await getDoc(recipeRef)
        if (!recipeSnap.exists()) return null;
        return { id: recipeSnap.id, ...recipeSnap.data()} as Recipe
      })
        const recipes = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[]
        setSavedRecipes(recipes)
      } catch (error) {
        console.error("error loading my recipes:", error)
      }
    }
    fetchMyRecipes()
  }, [currentUserProfile])


  if (loading) return <Text>...Loading</Text>;

  return (
    <ScrollView className="flex-1 bg-lime-200  ">
      <Text className="font-bold text-2xl self-center p-10">
        Saved Recipes
      </Text>
      {savedRecipes.length > 0 ? (
        savedRecipes.map((dish) => (
          <RecipeCard
            key={dish.id}
            recipe={dish}
            isFavorite={favorites.includes(dish.id)}
            toggleFavorite={() => toggleFavorite(dish.id)}
            //openRecipe={openRecipe}
          />
        ))
      ) : (
        <Text>No saved recipes yet</Text>
      )}
    </ScrollView>
  );
}