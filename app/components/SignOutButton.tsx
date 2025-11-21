// SignOutButton.tsx
import { TouchableOpacity, Text } from "react-native";
import { useAuth } from "../../contexts/authContext";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return <TouchableOpacity onPress={signOut} className="p-2 rounded bg-red-500">
    <Text className="text-white">Sign out</Text>
  </TouchableOpacity>;
}