import { Text, View, TextInput, Button } from "react-native"
import { useState } from "react"
import { useAuth } from "../../contexts/authContext"
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { doPasswordChange } from "../../firebase/auth"
import {useRouter} from 'expo-router'


export default function ChangePassword() {
    const router = useRouter();
    const {currentUser} = useAuth()

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")



  async function handlePasswordChange() {
      
    setError("");
    setSuccess("");
    if (!currentUser) return;

    if (!currentPassword || !newPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword !== confirmPassword) {
      console.log("Passwords don't match");
      return;
    }

    try {
        //firebase requires reauthentication to change password
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      //actually updating the user's password
      await doPasswordChange(currentUser, newPassword);

      setSuccess("Password successfully changed!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.replace("/(tabs)/profile")
    } 
    catch (err: any) {
      console.log(err);
      switch (err.code) {
        case "auth/wrong-password":
          setError("Your current password is incorrect.");
          break;
        case "auth/weak-password":
          setError("Your new password is too weak.");
          break;
        case "auth/requires-recent-login":
          setError("Please log in again before changing password.");
          break;
        default:
          setError("Something went wrong. Try again.");
      }
    }
  }

    return (
<View className="mt-8 mb-4">
    <Text className="text-xl font-bold">Change Password</Text>
    
    <Text className="font-bold mt-2">Current Password</Text>
    <TextInput
        secureTextEntry
        className="border p-2 rounded bg-white"
        value={currentPassword}
        onChangeText={setCurrentPassword}
    />

    <Text className="font-bold mt-2">New Password</Text>
    <TextInput 
        secureTextEntry
        className="border p-2 rounded bg-white"
        value={newPassword}
        onChangeText={setNewPassword}
    />

    <Text className="font-bold mt-2">Confirm New Password</Text>
    <TextInput 
        secureTextEntry
        className="border p-2 rounded bg-white"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
    />

        <Button
        title="Change Password"
        onPress={handlePasswordChange}
        
        />

    {error ? <Text className="text-red-600 mt-2">{error}</Text> : null}
      {success ? <Text className="text-green-600 mt-2">{success}</Text> : null}

</View>

    )
}