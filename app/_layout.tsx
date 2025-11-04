// app/_layout.tsx
import { Stack } from "expo-router";
import "nativewind";
import { View } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/authContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import { ActiveSectionProvider } from "../contexts/ActiveSectionContext";
import "./global.css";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
    
          <UserProfileProvider>
            <ActiveSectionProvider>
              <AppStack />
            </ActiveSectionProvider>
          </UserProfileProvider>
      
      </AuthProvider>
    </>
  );
}

function AppStack() {
  const { currentUser } = useAuth();
  const router = useRouter();

    useEffect(() => {
    if (!currentUser) {
      router.replace("/signIn/SignInOptions")
    } 
  }, [currentUser]);

  return (
    <Stack screenOptions={{ 
      headerShown: true, 
      headerTitle: 'Dinner Tonight?',
      headerTitleStyle: {
        fontSize: 30,
        fontWeight: 'bold'
      },
      headerStyle: {
        backgroundColor: 'olivedrab'
      },
      
      }}
        
      >
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