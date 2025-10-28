import { Button } from "react-native";
import { useAuth } from "../../contexts/authContext";
import { doSignOut } from "@/firebase/auth";

export default function SignOutButton() {
  const { signOut } = useAuth();

  return <Button title="Sign Out" onPress={() => doSignOut} />;
}