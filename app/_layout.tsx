import { Stack } from "expo-router";
import "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/authContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import { ActiveSectionProvider } from "../contexts/ActiveSectionContext";
import './global.css' 

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <UserProfileProvider>
          <ActiveSectionProvider>
            <AuthGate />
          </ActiveSectionProvider>
        </UserProfileProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function AuthGate() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Only load sign-in screens
    return (
      <Stack>
        <Stack.Screen name="signIn/SignInOptions" options={{ title: "Sign In" }} />
      </Stack>
    );
  }

  // Once logged in, show tab layout
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
    </Stack>
  );
}
