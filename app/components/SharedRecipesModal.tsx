import { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import ChatRecipeCard from "./ChatRecipeCard";
import RecipeCard from "./RecipeCard";
import type Recipe from "../../types/Recipe";

interface SharedRecipesModalProps {
  visible: boolean;
  onClose: () => void;
  sharedRecipeIds: string[];
}

export default function SharedRecipesModal({ visible, onClose, sharedRecipeIds }: SharedRecipesModalProps) {
  const [sharedRecipes, setSharedRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!visible || !sharedRecipeIds?.length) {
      setSharedRecipes([]);
      return;
    }

    async function fetchSharedRecipes() {
      try {
        const fetched: Recipe[] = [];
        for (const id of sharedRecipeIds) {
          const ref = doc(db, "recipes", id);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            fetched.push({ id: snap.id, ...snap.data() } as Recipe);
          }
        }
        setSharedRecipes(fetched);
      } catch (err) {
        console.error("Error fetching shared recipes:", err);
      }
    }

    fetchSharedRecipes();
  }, [visible, sharedRecipeIds]);

  const filtered = sharedRecipes.filter((r) =>
    r.dishName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-lime-100 rounded-2xl w-full max-h-[80%] p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-2xl font-bold text-lime-800">Shared Recipes</Text>
            <Pressable onPress={onClose}>
              <Text className="text-red-600 text-lg font-semibold">Close</Text>
            </Pressable>
          </View>

          {/* Search */}
          <TextInput
            placeholder="Search recipes..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-white rounded-xl p-3 mb-3 text-base"
          />

          {/* Recipe list */}
          <ScrollView className="flex"
          style={{ flexGrow: 1 }}       // ensures ScrollView fills available space
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            {filtered.length > 0 ? (
              filtered.map((recipe) => (
                <View key={recipe.id} className="mb-2">
                  <ChatRecipeCard recipe={recipe} 
                    onPress={onClose}
                  />
                </View>
              ))
            ) : (
              <Text className="text-center text-gray-600 mt-10">
                No recipes found
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}