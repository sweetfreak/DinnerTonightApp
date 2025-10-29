
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import {Link} from 'expo-router'
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useUserProfile } from "../../contexts/UserProfileContext";
import useFavorites from "../../hooks/useFavorites";
import RecipeCard from "./RecipeCard";
import type Recipe  from "../../types/Recipe";

export default function Recipes() {
  const { currentUserProfile } = useUserProfile();
  const { favorites, toggleFavorite, loading } = useFavorites(currentUserProfile?.savedRecipes);

  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filterType, setFilterType] = useState<"all" | "mine" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 Realtime listener for all recipes
  useEffect(() => {
    const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
      setAllRecipes(fetched);
    });

    return unsubscribe;
  }, []);

  if (loading) return <Text>Loading...</Text>;

  // 🧮 Apply filters
  const filtered = allRecipes.filter((recipe) => {
    const matchesSearch = recipe.dishName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === "mine") {
      return currentUserProfile?.myRecipes?.includes(recipe.id);
    }
    if (filterType === "saved") {
      return currentUserProfile?.savedRecipes?.includes(recipe.id);
    }
    return true; // all
  });

  return (
    <ScrollView className="flex-1 bg-lime-200 px-4">
      {/* Header */}
      <View className="pt-10 pb-4">
        <Text className="text-3xl font-bold text-center">Recipes</Text>
      </View>

    <View className="self-center bg-green-600 rounded-full px-4 py-2 mb-4"  >
      <Link href="../../components/NewRecipe" className="p-2 ">
          <Text className="text-white">Add a New Recipe</Text>
      </Link>
    </View>

      {/* Filter buttons */}
      <View className="flex-row justify-center gap-4 mb-4">
        {["all", "mine", "Favs"].map((type) => (
          <Pressable
            key={type}
            onPress={() => setFilterType(type as any)}
            className={`px-4 py-2 rounded-full ${
              filterType === type ? "bg-green-600" : "bg-green-300"
            }`}
          >
            <Text className="text-white capitalize">{type}</Text>
          </Pressable>
        ))}
        
      </View>

      {/* Search bar */}
      <TextInput
        placeholder="Search recipes..."
        placeholderTextColor='gray'
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="bg-white rounded-xl p-3 mb-4 text-lg "
      />

      {/* Recipe list */}
      
      {filtered.length > 0 ? (
        filtered.map((dish, index) => (
          <View key={index} className="mb-2">
          <RecipeCard
            key={dish.id}
            recipe={dish}
            isFavorite={favorites.includes(dish.id)}
            toggleFavorite={() => toggleFavorite(dish.id)}
          />
          </View>
        ))

      ) : (
        <Text className="text-center text-gray-600">No recipes found</Text>
      )}
    

    </ScrollView>
  );
}