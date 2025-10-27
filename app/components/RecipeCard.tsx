
import type Recipe from "../../types/Recipe"
import {View, Text, TouchableOpacity, Image} from 'react-native'
import { Link } from "expo-router"; 
import { useUserProfile } from "../../contexts/UserProfileContext";

interface RecipeCardMiniProps {
  recipe: Recipe;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
}


export default function RecipeCard({ recipe, isFavorite, toggleFavorite }: RecipeCardMiniProps) {

//   function openRecipe(recipe: Recipe) {
//     setSelectedRecipe(recipe)
//   }

    const { currentUserProfile } = useUserProfile();
    

    return (
        <View className="flex w-120 h-auto bg-lime-100 rounded-lg p-4 border-8 border-lime-700">
            <View className="flex p-5">
                <Image 
                    source={require("../../assets/macncheese.png") } 
                    className="w-full h-48 object-cover rounded-t-lg"
                    resizeMode="cover"
                />  
           
            </View>
            
            <View>
                <Link href={{ pathname:"./FullRecipe", params: {recipeId: recipe.id }}}  >
                    <Text className="text-4xl font-bold text-blue-800 font-underline">{recipe.dishName}</Text>
                </Link>
                <Text>Chef: {recipe.chef}</Text>
                <Text>Source: {recipe.source} </Text>

                <View className="flex p-5">
                    <Text className='p-5'>{recipe.description}</Text>
                    <Text> Serves: {recipe.servings}</Text>
                    <Text className="font-bold">Total Cook Time:</Text><Text>{recipe.totalTime} minutes</Text>
                    <View className="p-5 text-xs">
                        {recipe.dietaryRestrictions && 
                            Object.entries(recipe.dietaryRestrictions)
                            .filter(([_, value]) => value) // only true restrictions
                            .map(([key]) => (
                                <Text key={key}>{key.replace(/([A-Z])/g, " $1").trim()}</Text>
                            ))
                         }
                    </View>

                </View>
            
            </View>
            <TouchableOpacity onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                    }}
            >
                <Text onPress={() => toggleFavorite(recipe.id)}>{isFavorite ? "[♥️]" : "[♡]" }</Text>
            </TouchableOpacity>
        </View>
    )
}