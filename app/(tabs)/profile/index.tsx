import { View, Text, Button } from "react-native";
import { useUserProfile } from "../../../contexts/UserProfileContext";
import UserProfilePage from "@/app/components/UserProfilePage";



export default function ProfileScreen() {
  const {currentUserProfile} = useUserProfile()

  return (
    <View className="flex-1 items-center justify-center bg-lime-100">
      <UserProfilePage 
      //  myId={currentUserProfile?.uid} 
      />

    </View>

    
  );
}