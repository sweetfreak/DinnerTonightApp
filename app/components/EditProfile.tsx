import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Image, TouchableOpacity, ScrollView, Switch } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import type UserProfile from "../../types/User";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { useLocalSearchParams, useRouter } from "expo-router";

interface EditProfileProps {
  // currentUserProfile: UserProfile | null;
  // currentUserUid: string;
  // openProfile: (id: string) => void;
}

export default function EditProfile() {

  const { currentUserProfile, setCurrentUserProfile } = useUserProfile();
  const router = useRouter();
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
    bio: "",
    favoriteCuisine: "",
    settings: { 
      isPublicProfile:true,
      notificationsEnabled: true
    }
  });

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserProfile) {
      setProfileData({
        displayName: currentUserProfile.displayName ?? "",
        photoURL: currentUserProfile.photoURL ?? "",
        bio: currentUserProfile.bio ?? "",
        favoriteCuisine: currentUserProfile.favoriteCuisine ?? "",
        settings: { 
          isPublicProfile:currentUserProfile.settings.isPublicProfile ?? true,
          notificationsEnabled: currentUserProfile.settings.notificationsEnabled ?? true
        }
      });
      setIsPublicProfile(currentUserProfile.settings.isPublicProfile);
      setNotificationsEnabled(currentUserProfile.settings.notificationsEnabled);
    }
  }, [currentUserProfile]);

  const handleChange = (key: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const uriToBlob = async (uri: string) => {
    const response = await fetch(uri);
    return await response.blob();
  };

  const deleteOldImage = async (storage: FirebaseStorage, oldImageUrl?: string) => {
    if (!oldImageUrl || !oldImageUrl.includes("firebasestorage.googleapis.com")) return;

    try {
      const decodedPath = decodeURIComponent(oldImageUrl.split("/o/")[1].split("?")[0]);
      const oldRef = ref(storage, decodedPath);
      await deleteObject(oldRef);
      console.log("🗑️ Old profile picture deleted:", decodedPath);
    } catch (error) {
      console.warn("⚠️ Could not delete old profile picture:", error);
    }
  };

  const uploadImageToFirebase = async (imageUri: string, storagePath: string, oldImageUrl?: string) => {
    const blob = await uriToBlob(imageUri);
    const storage = getStorage();
    const storageRef = ref(storage, storagePath);

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("✅ Profile picture uploaded:", downloadURL);

      if (oldImageUrl) await deleteOldImage(storage, oldImageUrl);

      return downloadURL;
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
      throw error;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUserProfile?.uid) {
      console.error("No UID available for current user");
      return;
    }
    try {
      let uploadedPhotoURL = profileData.photoURL;

      if (localImageUri) {
        uploadedPhotoURL = await uploadImageToFirebase(
          localImageUri,
          `profilePictures/${currentUserProfile?.uid}_${Date.now()}.jpg`,
          profileData.photoURL
        );
      }

      const userRef = doc(db, "users", currentUserProfile.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        photoURL: uploadedPhotoURL,
        bio: profileData.bio,
        favoriteCuisine: profileData.favoriteCuisine,
        settings: {
          isPublicProfile: isPublicProfile,
          notificationsEnabled: notificationsEnabled
        }
      });
      setCurrentUserProfile(prev => prev ? { ...prev, photoURL: uploadedPhotoURL } : null);

      router.back()

    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <ScrollView className="p-4 bg-lime-100 flex-1">
      <Text className="text-2xl font-bold mb-4">Edit Profile</Text>

      {/* Profile Picture */}
      <View className="items-center mb-4">
        <Image
          source={localImageUri ? { uri: localImageUri } : profileData.photoURL ? { uri: profileData.photoURL } : require("../../assets/tempPic.jpg")}
          className="w-32 h-32 rounded-full mb-2"
          resizeMode="cover"
        />
        <Button title="Upload Profile Picture" onPress={pickImage} />
        {localImageUri && <Button title="Clear Image" color="red" onPress={() => setLocalImageUri(null)} />}
      </View>

      {/* Name */}
      <View className="mb-4">
        <Text className="font-bold">Name:</Text>
        <TextInput
          value={profileData.displayName}
          onChangeText={text => handleChange("displayName", text)}
          placeholder="Name"
          className="border p-2 rounded bg-white"
        />
      </View>

      {/* Bio */}
      <View className="mb-4">
        <Text className="font-bold">Bio:</Text>
        <TextInput
          value={profileData.bio}
          onChangeText={text => handleChange("bio", text)}
          placeholder="Bio"
          className="border p-2 rounded bg-white"
        />
      </View>

      {/* Favorite Cuisine */}
      <View className="mb-4">
        <Text className="font-bold">Favorite Cuisine:</Text>
        <TextInput
          value={profileData.favoriteCuisine}
          onChangeText={text => handleChange("favoriteCuisine", text)}
          placeholder="Favorite Cuisine"
          className="border p-2 rounded bg-white"
        />
      </View>

      {/*Toggle profile public/private*/}
      <View className="mb-4">
        <Text className="font-bold">Profile set to Public:</Text>
        <Text>Setting profile to private will prevent it from appearing in searches for all users.</Text>
        <Switch
        onValueChange={(value) =>{
          setIsPublicProfile(value)
          setProfileData(prev => ({
            ...prev,
            settings: {...prev.settings, isPublicProfile: value}
          }))
        }}
        value={isPublicProfile}
          
            
          />
          <Text>{isPublicProfile ? 'Public' : 'Private'}</Text>
          
      </View>

      {/*Toggle notifications */}
      <View>
        <Text className="font-bold">Notifications Enabled:</Text>
        <Text>Setting profile to private will prevent it from appearing in searches for all users.</Text>
        <Switch
            onValueChange={(value) => {
              setNotificationsEnabled(value)
              setProfileData(prev => ({
                ...prev,
                settings: {...prev.settings, notificationsEnabled: value}
              }))
            }}
            value={notificationsEnabled}
          />
          <Text>{notificationsEnabled ? 'On' : 'Off'}</Text>
          
      </View>

      <Button title="Save" onPress={handleUpdateProfile} />
    </ScrollView>
  );
}