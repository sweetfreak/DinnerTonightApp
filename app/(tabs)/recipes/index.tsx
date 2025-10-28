import { Stack, Link} from "expo-router"
import { Text, View} from 'react-native'


import RecipeSearch from "../../components/RecipeSearch"

import { useState, useEffect, useMemo } from "react";
import { getAuth} from "firebase/auth";

export default function RecipesLayout() {
  return (
    <View className = "flex-1 bg-lime-200">
      <RecipeSearch/>
    </View>
  );
}