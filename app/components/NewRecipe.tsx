import { useState } from "react";
import { View, Text, TextInput, Image, ScrollView, Button, Switch, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../../contexts/authContext/index";
import type UserProfile from "../../types/User";
import type Recipe from "../../types/Recipe";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import * as ImagePicker from 'expo-image-picker'
import { getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';


interface NewRecipeProps {
  
  //setMyRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

export default function NewRecipe({  }: NewRecipeProps) {
  
 const { currentUserProfile } = useUserProfile();
const router = useRouter();

//let newDownloadURL = ''
//const [uploading, setUploading] = useState(false)
const [localImageUri, setLocalImageUri] = useState<string | null>(null);
//const [imageURL, setImageURL] = useState<string | null>()

  const [recipe, setRecipe] = useState<Partial<Recipe>>({
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

  //const [submittedRecipe, setSubmittedRecipe] = useState(false);

  const updateField = (key: keyof Recipe, value: any) => {
    setRecipe(prev => ({ ...prev, [key]: value }));
  };

  const updateIngredient = (index: number, value: string) => {
    setRecipe(prev => {
      const newIngredients = [...(prev.ingredients || [])];
      newIngredients[index] = value;
      return { ...prev, ingredients: newIngredients };
    });
  };

  const addIngredient = () => {
    setRecipe(prev => ({ ...prev, ingredients: [...(prev.ingredients || []), ""] }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe(prev => {
      const newInstructions = [...(prev.instructions || [])];
      newInstructions[index] = value;
      return { ...prev, instructions: newInstructions };
    });
  };

  const addInstruction = () => {
    setRecipe(prev => ({ ...prev, instructions: [...(prev.instructions || []), ""] }));
  };

    const toggleDiet = (key: keyof Recipe["dietaryRestrictions"]) => {
    setRecipe(prev => ({
        ...prev,
        dietaryRestrictions: {
        ...prev.dietaryRestrictions!, // !! ensures TS knows it exists
        [key]: !prev.dietaryRestrictions![key]
        },
    }));
    };

  const removeIngredient = (index: number) => {
    const updated = recipe?.ingredients?.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: updated });
  };  
   const removeInstruction = (index: number) => {
    const updated = recipe?.instructions?.filter((_, i) => i !== index);
    setRecipe({ ...recipe, instructions: updated });
  };  

  const handleSubmit = async () => {
    if (!currentUserProfile) return;
    if (!recipe.dishName) return alert("Please enter a dish name");

    try {

      let uploadedImageURL = ''

      if (localImageUri) {
        uploadedImageURL = await uploadImageToFirebase(localImageUri, `images/${Date.now()}.jpg`)
      }

      const newRecipe: Recipe = {
        ...(recipe as Recipe), // Type assertion since all fields are optional in state
        imageURL: uploadedImageURL,
        createdBy: currentUserProfile?.uid ?? currentUserProfile.uid,
        createdByDisplayName: currentUserProfile?.displayName ?? currentUserProfile.displayName ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        public: true,
        likes: 0,
        likedBy: [],
      };

      const recipeRef = await addDoc(collection(db, "recipes"), newRecipe);
      await updateDoc(recipeRef, { id: recipeRef.id });

      //const newRecipeWithId: Recipe = { ...newRecipe, id: recipeRef.id };
      //setMyRecipes(prev => [...prev, newRecipeWithId]);

      // Optionally update user's recipe list
      const userRef = doc(db, "users", currentUserProfile.uid);
      await updateDoc(userRef, { myRecipes: arrayUnion(recipeRef.id) });

      //setSubmittedRecipe(true);
      router.back();

    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  //const resetNewRecipe = () => setSubmittedRecipe(false);


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

  const uploadImageToFirebase = async (imageUri: string, storagePath: string) => {
      const blob = await uriToBlob(imageUri)
      const storage = getStorage()
      const storageRef = ref(storage, storagePath)

      try {
        await uploadBytes(storageRef, blob)
        const downloadURL = await getDownloadURL(storageRef)
        console.log("image uplaoded successfully! DownloadURL: ", downloadURL)
        return downloadURL
      } catch (error) {
        console.error("error uploading image: ", error)
        throw error
      }
  }

  const handleUploadImage = async () => {
    const imageUri = await pickImage()
  }

  return (
    <KeyboardAwareScrollView className="p-4 bg-lime-800">
      
     
        <View>
          <Text className="text-2xl font-bold mb-4 text-white">Add a New Recipe!</Text>

          {/* Dish Name */}
          <Text className="text-white">Dish Name:</Text>
          <TextInput
            value={recipe.dishName}
            onChangeText={text => updateField("dishName", text)}
            placeholder="Dish Name"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Source */}
          <Text className="text-white">Source (URL):</Text>
          <TextInput
            value={recipe.source}
            onChangeText={text => updateField("source", text)}
            placeholder="Recipe source"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Chef */}
          <Text className="text-white">Chef:</Text>
          <TextInput
            value={recipe.chef}
            onChangeText={text => updateField("chef", text)}
            placeholder="Chef or author"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Cuisine */}
          <Text className="text-white">Cuisine:</Text>
          <TextInput
            value={recipe.cuisine}
            onChangeText={text => updateField("cuisine", text)}
            placeholder="e.g. Italian, Thai, Mexican"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Description */}
          <Text className="text-white">Description:</Text>
          <TextInput
            value={recipe.description}
            onChangeText={text => updateField("description", text)}
            placeholder="Brief description"
            placeholderTextColor="#888"
            multiline
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Prep/Cook Times */}
          <Text className="text-white">Prep Time:</Text>
          <TextInput
            value={recipe.prepTime}
            onChangeText={text => updateField("prepTime", text)}
            placeholder="e.g. 15 minutes"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          <Text className="text-white">Cook Time:</Text>
          <TextInput
            value={recipe.cookTime}
            onChangeText={text => updateField("cookTime", text)}
            placeholder="e.g. 30 minutes"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          <Text className="text-white">Additional Time:</Text>
          <TextInput
            value={recipe.additionalTime}
            onChangeText={text => updateField("additionalTime", text)}
            placeholder="e.g. chill overnight"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          <Text className="text-white">Total Time:</Text>
          <TextInput
            value={recipe.totalTime}
            onChangeText={text => updateField("totalTime", text)}
            placeholder="e.g. 45 minutes total"
            placeholderTextColor="#888"
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Servings */}
          <Text className="text-white">Servings:</Text>
          <TextInput
            value={recipe.servings}
            onChangeText={text => updateField("servings", text)}
            placeholder="e.g. 4"
            placeholderTextColor="#888"
            keyboardType="numeric"
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Image URL */}
          <Text className="text-white">Image:</Text>
          <Button 
            title="Upload Image"
            onPress={handleUploadImage}
          />

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
            {recipe.ingredients?.map((ing, i) => (
              <View key={i} className="flex-row items-center mb-2">
                <TextInput
                  value={ing}
                  onChangeText={text => updateIngredient(i, text)}
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
            {recipe.instructions?.map((ing, i) => (
              <View key={i} className="flex-row items-center mb-2">
                <TextInput
                  value={ing}
                  onChangeText={text => updateInstruction(i, text)}
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
          <Text className="text-white mt-4">Notes:</Text>
          <TextInput
            value={recipe.notes}
            onChangeText={text => updateField("notes", text)}
            placeholder="Additional notes or variations"
            placeholderTextColor="#888"
            multiline
            className="border p-2 mb-2 bg-white rounded"
          />

          {/* Dietary Restrictions */}
          <Text className="text-white mt-4">Dietary Restrictions:</Text>
          {Object.keys(recipe.dietaryRestrictions!).map(key => (
            <View key={key} className="flex-row items-center mb-2">
              <Text className="mr-2 text-white capitalize">{key}</Text>
              <Switch
                value={recipe.dietaryRestrictions![key as keyof Recipe["dietaryRestrictions"]]}
                onValueChange={() => toggleDiet(key as keyof Recipe["dietaryRestrictions"])}
              />
            </View>
          ))}


          {/* Submit */}
          <View className=" p-6 pb-12">
            <TouchableOpacity onPress={() => handleSubmit()} className="mt-6 bg-blue-500 p-3 rounded-xl items-center">
              <Text className="text-white font-bold text-lg">Submit Recipe</Text>
            </TouchableOpacity>
          </View>
        </View>
      
    </KeyboardAwareScrollView>
  );
}