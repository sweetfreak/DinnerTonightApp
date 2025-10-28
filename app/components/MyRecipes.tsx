import {useState, useEffect, useRef} from "react"
import useFavorites from "../../hooks/useFavorites"

import RecipeCard from "./RecipeCard"

import Recipe from "../../types/Recipe"
import type UserProfile from "../../types/User";

import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import { useUserProfile } from "../../contexts/UserProfileContext";
import {Text, View, ScrollView} from 'react-native'
import { Link } from "expo-router";


// interface MyRecipeProps {
//   newRecipe?: Recipe
//   //myRecipes: Recipe[]
//   //setMyRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
// }


export default function MyRecipes() {
    //const {currentUser} = useAuth()
    const { currentUserProfile } = useUserProfile();
    const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
   
    const { favorites, toggleFavorite, loading } = useFavorites(currentUserProfile?.savedRecipes);

    //maybe pull this out and put it in 
    const hasFetched = useRef(false);

    useEffect(() => {
      if (hasFetched.current) return;
      if (!currentUserProfile?.myRecipes?.length) {
        hasFetched.current = true; // Mark as fetched even if empty
        return;
      }

      async function fetchMyRecipes() {
      
        try {
          const recipePromises: Promise<Recipe | null>[] = (currentUserProfile?.myRecipes ?? []).map(async (id: string) => {
            const recipeRef = doc(db, 'recipes', id)
            const recipeSnap = await getDoc(recipeRef)
            if (!recipeSnap.exists()) return null;
            return { id: recipeSnap.id, ...recipeSnap.data()} as Recipe
          })

          const fetchedRecipes = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[]

          setMyRecipes(prev => {
            const existingIds = new Set(prev.map(r => r.id))
            const newRecipes = fetchedRecipes.filter(r => !existingIds.has(r.id))
            return [...prev, ...newRecipes]
          })
          
          hasFetched.current = true
          console.log("fetched")
        } catch (error) {
          console.error("error loading my recipes:", error)
        }
      
      }
      fetchMyRecipes()
      
    }, [currentUserProfile?.uid])

    if (loading) return <Text>Loading...</Text>

    return (
    <ScrollView className='flex-1 bg-lime-200'>
      <Text className='text-2xl font-bold self-center p-10'>My Recipes</Text>
      {myRecipes?.length > 0 ? (
        myRecipes?.map((dish: Recipe) => { //, index: number) => {
          return (
            <RecipeCard
                key={dish.id}
                recipe={dish}
                isFavorite={favorites.includes(dish.id)}
                toggleFavorite={() => toggleFavorite(dish.id)}
            />
          );
        })
      ) : (
        <View></View>
      )}
    </ScrollView>
  );
}
