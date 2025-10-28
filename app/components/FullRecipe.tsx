import type Recipe from "../../types/Recipe"
import {useEffect, useState} from 'react'

import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import {View, Text, TouchableOpacity, ScrollView, Image, FlatList, Button, Linking} from 'react-native'
import { Link, useLocalSearchParams } from "expo-router"; 
import { useUserProfile } from "../../contexts/UserProfileContext";


export default function FullRecipe() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
    
    const { currentUserProfile } = useUserProfile();
    const [isCreator, setIsCreator] = useState(false)
    const myRecipeId = recipeId
    const [recipe, setRecipe] = useState<Recipe | null>(null)

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
        <ScrollView className="flex-1 p-10 bg-lime-100">
            <View className="flex p-5">
                {/* image */}
                <Image 
                    source={require("../../assets/macncheese.png")}
                    className="w-full h-48 object-cover rounded-lg border-lime-800 border-4"
                    resizeMode="cover"
                />  
            </View>
            
            <View>
                <View className=" flex justify-between">
                    <Text className="text-4xl">{recipe?.dishName}</Text>

                    { isCreator && <Link  href={{pathname: "./EditRecipe", params: {uid: currentUserProfile?.uid, recipeId: recipeId}}}
                    className='p-2 rounded text-white bg-blue-500' >
                        Edit Recipe
                    </Link> }
                </View>

                {recipe?.chef && <Text>Chef: {recipe?.chef}</Text>}

                <Link
                    href={{pathname: './UserProfilePage', params: {id: recipe?.createdBy }}}
                >
                Uploaded by: {recipe?.createdByDisplayName}
                </Link>

                {recipe?.source && (
                    <View>
                        <Text>Source:</Text>
                        <TouchableOpacity onPress={() => openSource(recipe.source)}>
                        <Text className="text-blue-600 underline">{recipe.source}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {recipe?.description && <View className="p-5">
                    <Text className="text-lg">{recipe?.description}</Text>
                </View>}

                <View className="p-5 bold">
                    {recipe?.servings && <Text><Text className="font-bold">Servings:</Text> {recipe?.servings}</Text>}
                    {recipe?.prepTime && <Text><Text className="font-bold">Prep Time:</Text> {recipe?.prepTime} minutes</Text>}
                    {recipe?.cookTime && <Text><Text className="font-bold">Cook Time:</Text> {recipe?.cookTime} minutes</Text>}
                    {recipe?.totalTime && <Text><Text className="font-bold">Total Time:</Text> {recipe?.totalTime} minutes</Text>}
                </View>

                

                {/* ✅ Ingredients FlatList */}
                {recipe?.ingredients && <View><Text className="text-2xl font-bold mb-2">Ingredients</Text>
                <FlatList
                data={recipe?.ingredients ?? []}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                    <Text className="ml-4 mb-1">• {item}</Text>
                )}
                showsVerticalScrollIndicator = {false}
                scrollEnabled = {false}
                />
                </View>}

                {/* ✅ Steps */}
                {recipe?.instructions && 
                    <View>
                        <Text className="text-2xl font-bold mt-6 mb-2">Steps</Text>
                        <FlatList
                        data={recipe?.instructions ?? []}
                        keyExtractor={(_, index) => `step-${index}`}
                        renderItem={({ item, index }) => (
                            <View className="flex-row ml-4 mb-1">
                                <Text className="font-bold">{index + 1}. </Text>
                                <Text>{String(item)}</Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator = {false}
                        scrollEnabled = {false}
                        />
                    </View>
                }
            </View>
        </ScrollView>
    )
    
}
