import { Stack, Link} from "expo-router"
import { Text, View} from 'react-native'


import RecipeSearch from "../../components/RecipeSearch"
import MyRecipes from "../../components/MyRecipes";
import FullRecipe from "../../components/FullRecipe";
import UserProfilePage from "../../components/UserProfilePage";
import EditProfile from "../../components/EditProfile";
import EditRecipe from "../../components/EditRecipe";

import { useState, useEffect, useMemo } from "react";
import { getAuth} from "firebase/auth";

export default function RecipesLayout() {
  return (
    <View className = "flex-1 bg-lime-200">
    
    <Link href="../../components/NewRecipe" className="p-5 font-bold">
        <Text>Add a New Recipe</Text>
      </Link>

      <Link href={{ pathname: '../../components/SavedRecipes' }}  className='p-5 font-bold'>
          <Text>Saved Recipes</Text>
      </Link>

      <Link href={{ pathname: '../../components/MyRecipes'}}  className='p-5 font-bold'>
          <Text>My Recipes</Text>
      </Link>

      <Link href={{ pathname: '../../components/RecipeSearch' }}  className='p-5 font-bold'>
          <Text>All Recipes/Recipe Search</Text>
      </Link>
    
    </View>
  );
}