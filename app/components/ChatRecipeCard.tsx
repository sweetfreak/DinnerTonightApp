
import type Recipe from "../../types/Recipe"
import {View, Text, Pressable, Image} from 'react-native'
import { Link, useRouter } from "expo-router"; 
import { useUserProfile } from "../../contexts/UserProfileContext";

interface RecipeCardMiniProps {
  recipe: Recipe;
  onPress?: () => void
}


export default function ChatRecipeCard({ recipe, onPress}: RecipeCardMiniProps) {

    const router = useRouter()

     const { currentUserProfile } = useUserProfile();

    const activeRestrictions = Object.entries(recipe.dietaryRestrictions).filter(([_, value]) => value)

    const handlePress = () => {
        // navigate to full recipe
        router.push({ pathname: "../components/FullRecipe", params: { recipeId: recipe.id } });
        // call the modal close callback
        if (onPress) onPress();
    };

    return (
        <Pressable
        onPress = {handlePress}
        className="flex w-full h-auto bg-lime-100 rounded-lg p-2 border-8 border-lime-700">
            <View className="flex-row items-center gap-4 ">
                <Image 
                    source={recipe.imageURL ? {uri: recipe.imageURL} : require("../../assets/placeholder.jpg") } 
                    className="w-36 h-24 object-cover rounded-xl"
                    resizeMode="cover"
                />  
                <View className="flex-col">
                
                    <Text className="text-xl font-bold text-blue-800 font-underline">{recipe.dishName}</Text>
               
                {recipe?.chef && <View className="flex-row"><Text className="font-bold">Chef: </Text><Text>{recipe.chef}</Text></View>}

                </View>
            </View>
            
            <View>

                <View className="flex">
                    {recipe?.description && <Text className='p-2 italic'>{recipe.description}</Text>}
                </View>

                    <View>

              

                </View>
            
            </View>
            
        </Pressable>
    )
}