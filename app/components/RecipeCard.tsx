
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
        <Pressable className="flex w-120 h-auto bg-lime-100 rounded-lg p-4 border-8 border-lime-700 active:opacity-50">
            <View className="flex p-5">
                <Image 
                    source={recipe.imageURL ? {uri: recipe.imageURL} : require("../../assets/placeholder.jpg") } 
                    className="w-full h-48 object-cover rounded-t-lg"
                    resizeMode="cover"
                />  
           
            </View>
            
            <View>
                <View className="flex-row items-center">
                {/* <Link href={{ pathname:"../components/FullRecipe", params: {recipeId: recipe.id }}}  > */}
                    <Text className="text-4xl font-bold text-blue-800 font-underline">{recipe.dishName}</Text>
                {/* </Link> */}

                     <Text>  {isFavorite ? "♥️" : "" }</Text>
              
                </View>

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