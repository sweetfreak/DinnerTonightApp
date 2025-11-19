// app/_layout.tsx
import { Stack } from "expo-router";
import "nativewind";
import { View, Text } from "react-native";
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
  const { currentUser, loading } = useAuth();
  const router = useRouter();

    useEffect(() => {
  if (loading) return;

  if (!currentUser) {
    router.replace("/signIn/SignInOptions");
  } else {
    router.replace("/(tabs)/profile");
  }
}, [currentUser, loading]);

function CustomHeader() {
  return (
    <View className="bg-lime-700 h-32 flex-row items-end p-4">
      <Text className="text-white text-lime-200 text-3xl font-bold">
        Dinner Tonight?
      </Text>
    </View>
  );
}

  return (
    <Stack screenOptions={{ 
      headerShown: true, 
      header: () => <CustomHeader />
      // headerTitle: 'Dinner Tonight?',
      // headerTitleStyle: {
      //   fontSize: 30,
      //   fontWeight: 'bold'
      // },
      // headerStyle: {
      //   backgroundColor: 'olivedrab'
      // },
      
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