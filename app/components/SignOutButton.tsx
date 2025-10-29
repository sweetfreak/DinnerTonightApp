// SignOutButton.tsx
import { Button } from "react-native";
import { useAuth } from "../../contexts/authContext";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return <Button title="Sign Out" onPress={signOut} />;
}