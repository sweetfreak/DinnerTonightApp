import { useState, useEffect } from "react";
import { View, Text, TextInput, Image, Button, Switch, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useUserProfile } from "../../contexts/UserProfileContext";
import type Recipe from "../../types/Recipe";
import { useLocalSearchParams, useRouter } from "expo-router";

import * as ImagePicker from 'expo-image-picker'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage} from 'firebase/storage';

export default function EditRecipe() {
  const router = useRouter();
  const { currentUserProfile } = useUserProfile();
  const { uid, recipeId } = useLocalSearchParams<{ uid: string; recipeId: string }>();

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);



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

       let uploadedImageURL = ''

   

      if (localImageUri) {
        uploadedImageURL = await uploadImageToFirebase(localImageUri, `recipeimages/${Date.now()}.jpg`, recipeData.imageURL)
      }

      

      const updatedData: Record<string, any> = {
        ...recipeData,
        imageURL: uploadedImageURL || recipeData.imageURL,
        ingredients,
        instructions,
        dietaryRestrictions: { ...recipeData.dietaryRestrictions },
        updatedAt: Date.now(),
      };

      const recipeRef = doc(db, "recipes", recipeId);
      await updateDoc(recipeRef, updatedData);

      router.back();
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  const handleDelete = async () => {


  try {
    const storage = getStorage();

    if (recipeData?.imageURL && recipeData.imageURL.includes("firebasestorage.googleapis.com")) {
      await deleteOldImage(storage, recipeData.imageURL);
    }

    await deleteDoc(doc(db, "recipes", recipeId));
    router.back();
    setTimeout(() => router.back(), 25);

  } catch (error) {
    console.error("Could not delete recipe:", error);
  }
};


  const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        //aspect: [4, 3],
        quality: 1
      })
  
      if (!result.canceled) {
        return setLocalImageUri(result.assets[0].uri)
      }
      return null
    }
  
    const uriToBlob = async (uri: string) => {
      const response = await fetch(uri)
      const blob = await response.blob()
      return blob
    }

  async function deleteOldImage(storage: FirebaseStorage, oldImageUrl?: string) {
  if (!oldImageUrl || !oldImageUrl.includes("firebasestorage.googleapis.com")) return;

  try {
    // Extract the file path from the download URL
    const decodedPath = decodeURIComponent(
      oldImageUrl.split("/o/")[1].split("?")[0]
    ); // e.g. "images%2FoldFile.jpg" → "images/oldFile.jpg"

    const oldRef = ref(storage, decodedPath);
    console.log("Deleting image at path:", oldImageUrl);
    await deleteObject(oldRef);

    console.log("🗑️ Old image deleted:", decodedPath);
  } catch (deleteError) {
    console.warn("⚠️ Could not delete old image:", deleteError);
  }
}


const uploadImageToFirebase = async (imageUri: string, storagePath: string, oldImageUrl?: string) => {
  const blob = await uriToBlob(imageUri);
  const storage = getStorage();
  const storageRef = ref(storage, storagePath);

  try {
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    console.log("✅ Image uploaded successfully:", downloadURL);

    // Delete old image AFTER upload succeeds
    await deleteOldImage(storage, oldImageUrl);

    return downloadURL;
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    throw error;
  }
};
   
    
 const handleSelectImage = async () => {
    const imageUri = await pickImage()
  }

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
      <Text className="text-white">Source (URL):</Text>
      <TextInput
        value={recipeData.source}
        onChangeText={(text) => handleUpdateField("source", text)}
        placeholder="Source"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* chef */}
      <Text className="text-white">Chef:</Text>
      <TextInput
        value={recipeData.chef}
        onChangeText={(text) => handleUpdateField("chef", text)}
        placeholder="Chef"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* cuisine */}
      <Text className="text-white">Cuisine:</Text>
      <TextInput
        value={recipeData.cuisine}
        onChangeText={(text) => handleUpdateField("cuisine", text)}
        placeholder="Cuisine"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* Description */}
      <Text className="text-white">Description</Text>
      <TextInput
        value={recipeData.description}
        onChangeText={(text) => handleUpdateField("description", text)}
        placeholder="Description"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* prep Time */}
      <Text className="text-white">Prep Time:</Text>
      <TextInput
        value={recipeData.prepTime}
        onChangeText={(text) => handleUpdateField("prepTime", text)}
        placeholder="Prep Time"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* cook Time */}
      <Text className="text-white">Cook Time:</Text>
      <TextInput
        value={recipeData.cookTime}
        onChangeText={(text) => handleUpdateField("cookTime", text)}
        placeholder="Cook Time"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* Additional Time */}
      <Text className="text-white">Additional Time:</Text>
      <TextInput
        value={recipeData.additionalTime}
        onChangeText={(text) => handleUpdateField("additionalTime", text)}
        placeholder="Additional Time"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* Total Time */}
      <Text className="text-white">Total Time:</Text>
      <TextInput
        value={recipeData.totalTime}
        onChangeText={(text) => handleUpdateField("totalTime", text)}
        placeholder="Total Time"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* Servings */}
      <Text className="text-white">servings:</Text>
      <TextInput
        value={recipeData.servings}
        onChangeText={(text) => handleUpdateField("servings", text)}
        placeholder="servings"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

      {/* image url */}
      <Text className="text-white">Image:</Text>

              {!localImageUri && recipeData?.imageURL ? 
                <Image source={{uri: recipeData.imageURL}} 
                  className="w-48 h-48 rounded-lg"
                  resizeMode="cover" 
                /> : null  }
                 

                <Button 
                  title="Upload Image"
                  onPress={handleSelectImage}/>
      
                { localImageUri ? (
                  <Text className="text-white mt-2">✅ Image uploaded!</Text>
                ) : null}
      
             

                {localImageUri && (<View>
                  <Image source={{ uri: localImageUri }} className="w-32 h-32 rounded mt-2"  />
                  <Button
                    title="Clear Image"
                    onPress={() => {
                      setLocalImageUri('')
                    }}
                    />

                </View>)}


      

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

        {/* Notes */}
      <Text className="text-white">Additional Notes:</Text>
      <TextInput
        value={recipeData.notes}
        onChangeText={(text) => handleUpdateField("notes", text)}
        placeholder="Add additional notes about the dish here"
        placeholderTextColor="#888"
        className="border p-2 mb-2 bg-white rounded"
      />

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


        <View className="p-6 pb-12">
            <TouchableOpacity
            onPress={handleDelete}
            className="mt-6 bg-red-500 p-3 rounded-xl items-center"
            >
            <Text className="text-white font-bold text-lg">DELETE RECIPE</Text>
            </TouchableOpacity>
        </View>
      
    </KeyboardAwareScrollView>
  );
}