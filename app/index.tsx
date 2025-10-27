import { Redirect } from "expo-router";
import { useAuth } from "../contexts/authContext";
import SignInOptions from "./signIn/SignInOptions";

export default function Index() {
  const { currentUser } = useAuth();

  if (currentUser) {
    // Send authenticated users straight into the tab layout
    return <Redirect href="/(tabs)/profiles" />;
  }

  return <SignInOptions />;
}
