
import type Recipe from "../../types/Recipe"
import {View, Text, TouchableOpacity, Image, Pressable} from 'react-native'
import { Link } from "expo-router"; 
import { useUserProfile } from "../../contexts/UserProfileContext";

interface RecipeCardMiniProps {
  recipe: Recipe;
  
}


export default function RecipeCard({ recipe  }: RecipeCardMiniProps) {

    const { currentUserProfile, favorites = [] } = useUserProfile();
    const isFavorite = recipe ? favorites.includes(recipe.id) : false;


    const activeRestrictions = Object.entries(recipe.dietaryRestrictions).filter(([_, value]) => value)

    return (
        <Link href={{ pathname:"../components/FullRecipe", params: {recipeId: recipe.id }}}  
        asChild>
        <Pressable className={`flex w-120 h-auto bg-lime-100 rounded-lg border-8 ${isFavorite ? 'border-red-500' : 'border-lime-700'} active:opacity-50 relative`}>
            

            <View className="relative flex p-5 pt-0">
                <Image 
                    source={recipe.imageURL ? {uri: recipe.imageURL} : require("../../assets/placeholder.jpg") } 
                    className="w-full h-48 object-cover my-4 rounded-lg"
                    resizeMode="cover"
                />
                <View className="absolute">
                    <Text className="text-lg">{isFavorite ? "♥️" : ""}</Text>
                </View>
                <View className="absolute bottom-9 left-5">
                    <Text className="text-3xl font-bold text-white opacity-90 bg-black/25 px-2 py-1 rounded">{recipe.dishName}</Text>
                </View>
           
            </View>
            
            <View>
                
           


                {recipe?.chef && <View className="flex-row"><Text className="font-bold">Chef: </Text><Text>{recipe.chef}</Text></View>}

                <View className="flex">
                    {recipe?.description && <Text className='pt-5 pb-5 italic'>{recipe.description}</Text>}
                    {recipe?.servings && <View className="flex-row"><Text className="font-bold">Serves: </Text><Text>{recipe.servings} </Text></View>}
                    {recipe?.totalTime && <View className="flex-row"><Text className="font-bold">Total Cook Time: </Text><Text>{recipe.totalTime} minutes</Text></View>}
                </View>

                    <View>

                    <Text className="pt-4 font-bold text-lg">Dietary Restrictions</Text>

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

                </View>
            
            </View>
            
        </Pressable>
        </Link>
    )
}