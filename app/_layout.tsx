// app/_layout.tsx
import { Stack } from "expo-router";
import "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/authContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import { ActiveSectionProvider } from "../contexts/ActiveSectionContext";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <UserProfileProvider>
          <ActiveSectionProvider>
            <AppStack />
          </ActiveSectionProvider>
        </UserProfileProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function AppStack() {
  const { currentUser } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {currentUser ? (
        // Authenticated users go to your tabs layout
        <Stack.Screen name="(tabs)" />
      ) : (
        // Unauthenticated users go to sign-in
        <Stack.Screen name="signIn/SignInOptions" />
      )}
    </Stack>
  );
}