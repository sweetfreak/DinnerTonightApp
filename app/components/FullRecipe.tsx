import type Recipe from "../../types/Recipe"
import {useEffect, useState} from 'react'

import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import {View, Text, TouchableOpacity, ScrollView, Image, FlatList, Button, Linking} from 'react-native'
import { Link, useLocalSearchParams } from "expo-router"; 
import { useUserProfile } from "../../contexts/UserProfileContext";

// import useFavorites from "../../hooks/useFavorites";


export default function FullRecipe() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
    
    const { currentUserProfile, favorites, toggleFavorite } = useUserProfile();
    const [isCreator, setIsCreator] = useState(false)
    const myRecipeId = recipeId
    const [recipe, setRecipe] = useState<Recipe | null>(null)

        const activeRestrictions = Object.entries(recipe?.dietaryRestrictions ?? {}).filter(([_, value]) => value)
            const activeIngredients = Object.entries(recipe?.ingredients ?? []).filter(([_, value]) => value)

                const activeInstructions = Object.entries(recipe?.instructions ?? []).filter(([_, value]) => value)

    // const { favorites, toggleFavorite, loading } = useFavorites(currentUserProfile?.savedRecipes)
    
    const isFavorite = recipe ? favorites.includes(recipe.id) : false;


const openSource = (url: string) => {
  if (!url) return;
  // ensure it has a scheme
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  Linking.openURL(fullUrl).catch(err => console.error("Failed to open URL:", err));
};


useEffect(() => {
    
    async function fetchRecipe() {
          
            try {
                const recipeRef = doc(db, 'recipes', myRecipeId)
                const recipeSnap = await getDoc(recipeRef)
                if (!recipeSnap.exists()) return null;
                setRecipe({ id: recipeSnap.id, ...recipeSnap.data() } as Recipe)
              
               
              
            } catch (error) {
              console.error("error loading recipe:", error)
            }
        }
        if (myRecipeId) fetchRecipe()
        
    }, [myRecipeId])


    useEffect(() => {
        if (!recipe) return

        if (recipe.createdBy == currentUserProfile?.uid) {
            setIsCreator(true)
        }
    }, [recipe, currentUserProfile])




    return (
        <ScrollView className="flex-1 p-10 bg-lime-100 border-4 border-lime-800">
            <View className="flex p-5">
                <Image 
                    source={
                    recipe?.imageURL 
                        ? { uri: recipe.imageURL } 
                        : require("../../assets/placeholder.jpg")
                    }
                    className="w-full h-48 rounded-lg border-lime-800 border-4"
                    resizeMode="cover"  // ✅ this replaces object-cover
                />  
            </View>
            
            <View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-4xl">{recipe?.dishName}</Text>

                    
                    {recipe &&
                        <TouchableOpacity onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                        }}>
                        <Text className="text-lg" onPress={() => toggleFavorite(recipe.id)}>  {isFavorite ? "♥️" : "♡" }</Text>
                        </TouchableOpacity>
                    }
                </View>
              
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold">Uploaded by:</Text>  
                  <Link
                    href={{pathname: './UserProfilePage', params: {id: recipe?.createdBy }}}
                ><Text className="underline text-blue-600">{recipe?.createdByDisplayName}</Text></Link>
                
                  { isCreator && <Link  href={{pathname: "./EditRecipe", params: {uid: currentUserProfile?.uid, recipeId: recipeId}}}
                    className='p-1 rounded text-white bg-blue-500 self-start' >
                       Edit Recipe
                    </Link> 
                }
                </View>

                {recipe?.chef && <View className="flex-row gap-2"><Text className="font-bold">Chef:</Text><Text>{recipe.chef}</Text></View>}

              



                {recipe?.source && (
                    <View className="flex-row flex-wrap gap-2">
                        <Text className="font-bold" >Source:</Text>
                        <TouchableOpacity onPress={() => openSource(recipe.source)}>
                        <Text className="text-blue-700 underline underline ">{recipe.source}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {recipe?.cuisine && <View className="flex-row gap-2"><Text className="font-bold">Cuisine:</Text><Text>{recipe.chef}</Text></View>}
                {recipe?.servings && <Text><Text className="font-bold gap-2">Servings:</Text> {recipe?.servings}</Text>}


                {recipe?.description && <View className="pt-4 pb-4">
                    <Text className="font-bold text-lg text-center">Description:</Text>
                    <Text className="text-lg text-center">{recipe?.description}</Text>
                </View>}

                {(recipe?.cookTime || recipe?.prepTime || recipe?.additionalTime || recipe?.totalTime) && <View className=" p-4 border">
                    <Text className="font-bold self-center">Timing</Text>
                    {recipe?.prepTime && <Text><Text className="font-bold">Prep Time:</Text> {recipe?.prepTime} minutes</Text>}
                    {recipe?.cookTime && <Text><Text className="font-bold">Cook Time:</Text> {recipe?.cookTime} minutes</Text>}
                    {recipe?.additionalTime && <Text><Text className="font-bold">Additional Time:</Text> {recipe?.additionalTime} minutes</Text>}
                    {recipe?.totalTime && <Text><Text className="font-bold">Total Time:</Text> {recipe?.totalTime} minutes</Text>}

                </View>}

                 
                <View className="border-b-2 border-lime-800 w-full my-4" />
               

                {/* ✅ Ingredients FlatList */}
                {recipe?.ingredients && 
                <View className="pt-4">
                    <Text className="text-2xl font-bold mb-2">Ingredients</Text>
               
                    <View>
                        {activeIngredients.length > 0 ? (
                                recipe.ingredients.map((ingredient, index) => (
                                    <Text className="p-2" key={index}>
                                      - {ingredient}
                                    </Text>
                                ))
                            ) : (
                            <Text>No ingredients listed</Text>
                            )}
                    </View>
                
                </View>}

                <View className="border-b-2 border-lime-800 w-full my-4" />

                {/* ✅ Steps */}
                {recipe?.instructions && 
                    <View className="mt-4">
                        <Text className="text-2xl font-bold mb-2">Instructions</Text>
                
                        <View>
                            {activeInstructions.length > 0 ? (
                                    recipe.instructions.map((instruction, index) => (
                                        <Text className=" p-2" key={index}>
                                        <Text className="font-bold">{index + 1}.</Text> {instruction}
                                        </Text>
                                    ))
                                ) : (
                                <Text>No ingredients listed</Text>
                                )}
                        </View>
                    
                    </View>
                }

                <View className="border-b-2 border-lime-800 w-full my-4" />

                    <Text className="mt-4 font-bold text-2xl">Dietary Restrictions</Text>

                 {recipe?.dietaryRestrictions && 
                        <View className="p-2 text-xs">
                            {activeRestrictions.length > 0 ? (
                                activeRestrictions.map(([key]) => (
                                    <Text key={key}>
                                      ✅ {key.replace(/([A-Z])/g, " $1").trim()}
                                    </Text>
                                ))
                            ) : (
                            <Text>No dietary restrictions listed</Text>
                            )}
                            
                        </View> }
                
                <View className="border-b-2 border-lime-800 w-full my-4" />

                {recipe?.notes && 
                    <View className="m-4">
                        <Text className="text-lg font-bold ">Additional Notes for</Text> 
                        <Text className="text-lg font-bold">{recipe.dishName}</Text>
                        <Text className="italic">"{recipe.notes}"</Text>
                    </View>
                }        

            </View>
                <View className="p-8"></View>
        </ScrollView>
    )
    
}
