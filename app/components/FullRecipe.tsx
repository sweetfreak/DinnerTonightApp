import type Recipe from "../../types/Recipe"
import {useEffect, useState} from 'react'

import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import {View, Text, TouchableOpacity, ScrollView, Image, Switch, FlatList, Button, Linking} from 'react-native'
import { Link, useLocalSearchParams } from "expo-router"; 
import { useUserProfile } from "../../contexts/UserProfileContext";

// import useFavorites from "../../hooks/useFavorites";


export default function FullRecipe() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
    
    const { currentUserProfile, favorites, toggleFavorite } = useUserProfile();
    const [isCreator, setIsCreator] = useState(false)
    const myRecipeId = recipeId
    const [recipe, setRecipe] = useState<Recipe | null>(null)

    const [largerFont, setLargerFont] = useState(false)
    const toggleLargerFont = () => setLargerFont(prev => !prev);


        const activeRestrictions = Object.entries(recipe?.dietaryRestrictions ?? {}).filter(([_, value]) => value)
            const activeIngredients = Object.entries(recipe?.ingredients ?? []).filter(([_, value]) => value)

                const activeInstructions = Object.entries(recipe?.instructions ?? []).filter(([_, value]) => value)

    
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
                    className={`w-full h-72 rounded-lg border-8 ${isFavorite ? 'border-red-500' : 'border-lime-800'}`}
                    resizeMode="cover"  // ✅ this replaces object-cover
                />  
            </View>
            
            <View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-4xl">{recipe?.dishName}</Text>

                    
                    
                </View>
                {recipe && <View className="flex-row items-center">
                        <Text className="text-2xl my-2">{isFavorite? "Remove Favorite:" : "Make Favorite:" }</Text>
                        <TouchableOpacity onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                        }}>
                        <Text className="text-2xl" onPress={() => toggleFavorite(recipe.id)}>  {isFavorite ? "♥️" : "♡" }</Text>
                        </TouchableOpacity>
                        </View>
                    }
                <View className="gap-4 py-4 flex-row items-center self-start">
                    
                        <Text className="italic">Make Font larger:</Text>
                    <Switch 
                        className="border bg-gray-400 rounded-full"
                        onValueChange={toggleLargerFont}
                        value={largerFont}
                    />
                    </View>
              
                <View className="flex-col gap-2">
                    <View className="flex-row">
                  <Text className={`font-bold ${largerFont ? 'text-lg' : 'text-md'}`}>Uploaded by:</Text>  
                  <Link
                    href={{pathname: './UserProfilePage', params: {id: recipe?.createdBy }}}
                ><Text className={`underline text-blue-600 ${largerFont ? 'text-2xl' : 'text-md'}`}> {recipe?.createdByDisplayName}</Text></Link>
                    </View>
                  { isCreator && <Link  href={{pathname: "./EditRecipe", params: {uid: currentUserProfile?.uid, recipeId: recipeId}}}
                    className='p-1 rounded text-white bg-blue-500 self-start' >
                       Edit Recipe
                    </Link> 
                }
                </View>

                {recipe?.chef && <View className="flex-row gap-2"><Text className={`font-bold ${largerFont ? 'text-lg' : 'text-md'}`}>Chef:</Text><Text className={` ${largerFont ? 'text-lg' : 'text-md'}`}>{recipe.chef}</Text></View>}

              



                {recipe?.source && (
                    <View className="flex-row flex-wrap gap-2">
                        <Text className={`font-bold ${largerFont ? 'text-lg' : 'text-md'}`} >Source:</Text>
                        <TouchableOpacity onPress={() => openSource(recipe.source)}>
                        <Text className={` ${largerFont ? 'text-lg' : 'text-md'} text-blue-700 underline`}>{recipe.source}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {recipe?.cuisine && <View className="flex-row gap-2"><Text className={`font-bold ${largerFont ? 'text-lg' : 'text-md'}`}>Cuisine:</Text ><Text className={` ${largerFont ? 'text-lg' : 'text-md'}`} >{recipe.chef}</Text></View>}
                {recipe?.servings && <Text className={`${largerFont ? 'text-lg' : 'text-md'}`} ><Text className="font-bold gap-2">Servings:</Text> {recipe?.servings}</Text>}


                {recipe?.description && <View className="pt-4 pb-4">
                    <Text className={`font-bold ${largerFont ? 'text-lg' : 'text-md'}`}>Description:</Text>
                    <Text className={` ${largerFont ? 'text-lg' : 'text-md'}`}>{recipe?.description}</Text>
                </View>}

                {(recipe?.cookTime || recipe?.prepTime || recipe?.additionalTime || recipe?.totalTime) && <View className=" p-4 border">
                    <Text className="font-bold self-center">Timing</Text>
                    {recipe?.prepTime && <Text className={` ${largerFont ? 'text-lg' : 'text-md'}`}><Text className="font-bold">Prep Time:</Text> {recipe?.prepTime} minutes</Text>}
                    {recipe?.cookTime && <Text className={` ${largerFont ? 'text-lg' : 'text-md'}`}><Text className="font-bold">Cook Time:</Text> {recipe?.cookTime} minutes</Text>}
                    {recipe?.additionalTime && <Text className={` ${largerFont ? 'text-lg' : 'text-md'}`}><Text className="font-bold">Additional Time:</Text> {recipe?.additionalTime} minutes</Text>}
                    {recipe?.totalTime && <Text className={` ${largerFont ? 'text-lg' : 'text-md'}`}><Text className="font-bold">Total Time:</Text> {recipe?.totalTime} minutes</Text>}

                </View>}

                 
                <View className="border-b-2 border-lime-800 w-full my-4" />
               

                {/* ✅ Ingredients FlatList */}
                {recipe?.ingredients && 
                <View className="pt-4 ">
                    

                    <Text className="text-2xl font-bold mb-2 ">Ingredients</Text>
               
                    <View>
                        {activeIngredients.length > 0 ? (
                                recipe.ingredients.map((ingredient, index) => (
                                    <Text className={`p-2 ${largerFont ? 'text-2xl' : 'text-md'}`} key={index}>
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
                                        <Text className={`p-2 ${largerFont ? 'text-2xl' : 'text-md'}`} key={index}>
                                         <Text className="font-bold">{index + 1}.</Text> {typeof instruction === 'string' ? instruction : (instruction.text || instruction.name || 'Invalid instruction')}
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
                                    <Text className={`${largerFont ? 'text-2xl' : 'text-md'}`} key={key}>
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
                        <Text className={`font-bold ${largerFont ? 'text-2xl' : 'text-md'}`}>Additional Notes for</Text> 
                        <Text className={`font-bold ${largerFont ? 'text-2xl' : 'text-md'}`}>{recipe.dishName}</Text>
                        <Text className={`italic ${largerFont ? 'text-2xl' : 'text-md'}`}>"{recipe.notes}"</Text>
                    </View>
                }        

            </View>
                <View className="p-8"></View>
        </ScrollView>
    )
    
}
