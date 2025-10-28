import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Switch, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useUserProfile } from "../../contexts/UserProfileContext";
import type Recipe from "../../types/Recipe";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function EditRecipe() {
  const router = useRouter();
  const { currentUserProfile } = useUserProfile();
  const { uid, recipeId } = useLocalSearchParams<{ uid: string; recipeId: string }>();

  const [loading, setLoading] = useState(true);
  const [recipeData, setRecipeData] = useState<Partial<Recipe>>({
    dishName: "",
    source: "",
    chef: "",
    cuisine: "",
    description: "",
    prepTime: "",
    cookTime: "",
    additionalTime: "",
    totalTime: "",
    servings: "",
    imageURL: "",
    ingredients: [""],
    instructions: [""],
    notes: "",
    dietaryRestrictions: {
      vegetarian: false,
      vegan: false,
      dairyFree: false,
      containsNuts: false,
      glutenFree: false,
      kosher: false,
      halal: false,
    },
  });

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);

  const isCurrentUser = uid === currentUserProfile?.uid;

  // Fetch recipe from Firestore
  useEffect(() => {
    if (!recipeId) return;

    const fetchRecipe = async () => {
      try {
        const recipeRef = doc(db, "recipes", recipeId);
        const snapshot = await getDoc(recipeRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as Recipe;
          setRecipeData({
            ...data,
            dietaryRestrictions: { ...data.dietaryRestrictions },
          });
          setIngredients(data.ingredients || [""]);
          setInstructions(data.instructions || [""]);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleUpdateField = (key: keyof Recipe, value: any) => {
    setRecipeData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDiet = (key: keyof Recipe["dietaryRestrictions"]) => {
    setRecipeData((prev) => ({
      ...prev,
      dietaryRestrictions: {
        ...prev.dietaryRestrictions!,
        [key]: !prev.dietaryRestrictions![key],
      },
    }));
  };

  const addIngredient = () => setIngredients((prev) => [...prev, ""]);
  const removeIngredient = (index: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  const updateIngredient = (index: number, value: string) =>
    setIngredients((prev) => prev.map((ing, i) => (i === index ? value : ing)));

  const addInstruction = () => setInstructions((prev) => [...prev, ""]);
  const removeInstruction = (index: number) =>
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  const updateInstruction = (index: number, value: string) =>
    setInstructions((prev) => prev.map((ins, i) => (i === index ? value : ins)));

  const handleSave = async () => {
    if (!isCurrentUser || !recipeId) return;

    try {
      const updatedData: Record<string, any> = {
        ...recipeData,
        ingredients,
        instructions,
        dietaryRestrictions: { ...recipeData.dietaryRestrictions },
        updatedAt: Date.now(),
      };

      const recipeRef = doc(db, "recipes", recipeId);
      await updateDoc(recipeRef, updatedData);

      router.back(); // go back to previous screen
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white text-xl">Loading recipe...</Text>
      </View>
    );
  }

  if (!isCurrentUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white text-xl">You cannot edit this recipe.</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView className="p-4 bg-lime-800">
      <Text className="text-2xl font-bold mb-4 text-white">Edit Recipe</Text>

      {/* Dish Name */}
      <Text className="text-white">Dish Name:</Text>
      <TextInput
        value={recipeData.dishName}
        onChangeText={(text) => handleUpdateField("dishName", text)}
        placeholder="Dish Name"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* Source */}
      <Text className="text-white">Source:</Text>
      <TextInput
        value={recipeData.source}
        onChangeText={(text) => handleUpdateField("source", text)}
        placeholder="Source"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* Ingredients */}
      <Text className="text-white mt-2">Ingredients:</Text>
      {ingredients.map((ing, i) => (
        <View key={i} className="flex-row items-center mb-2">
          <TextInput
            value={ing}
            onChangeText={(text) => updateIngredient(i, text)}
            placeholder={`Ingredient ${i + 1}`}
            placeholderTextColor="#888"
            className="flex-1 border p-2 bg-white rounded"
          />
          <TouchableOpacity
            onPress={() => removeIngredient(i)}
            className="ml-2 bg-red-500 rounded p-2"
          >
            <Text className="text-white font-bold">✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Button title="+ Add Ingredient" onPress={addIngredient} />

      {/* Instructions */}
      <Text className="text-white mt-2">Instructions:</Text>
      {instructions.map((ins, i) => (
        <View key={i} className="flex-row items-center mb-2">
          <TextInput
            value={ins}
            onChangeText={(text) => updateInstruction(i, text)}
            placeholder={`Step ${i + 1}`}
            placeholderTextColor="#888"
            className="flex-1 border p-2 bg-white rounded"
          />
          <TouchableOpacity
            onPress={() => removeInstruction(i)}
            className="ml-2 bg-red-500 rounded p-2"
          >
            <Text className="text-white font-bold">✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Button title="+ Add Step" onPress={addInstruction} />

      {/* Dietary Restrictions */}
      <Text className="text-white mt-4">Dietary Restrictions:</Text>
      {Object.keys(recipeData.dietaryRestrictions!).map((key) => (
        <View key={key} className="flex-row items-center mb-2">
          <Text className="mr-2 text-white capitalize">{key}</Text>
          <Switch
            value={recipeData.dietaryRestrictions![key as keyof Recipe["dietaryRestrictions"]]}
            onValueChange={() => toggleDiet(key as keyof Recipe["dietaryRestrictions"])}
          />
        </View>
      ))}

      {/* Submit */}
      <View className="p-6 pb-12">
        <TouchableOpacity
          onPress={handleSave}
          className="mt-6 bg-blue-500 p-3 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}