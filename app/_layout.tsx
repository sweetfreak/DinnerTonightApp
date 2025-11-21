// app/_layout.tsx
import { Stack } from "expo-router";
import "nativewind";
import { View, Text, Pressable } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/authContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import { ActiveSectionProvider } from "../contexts/ActiveSectionContext";
import "./global.css";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics"


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

// function CustomHeader() {
//   return (
//     <View className="bg-lime-700 h-32 flex-row items-end p-4">
//       <Text className="text-white text-lime-200 text-3xl font-bold">
//         Dinner Tonight?
//       </Text>
//     </View>
//   );
// }

function CustomHeader({ navigation, back }: any) {
  return (
    <View className="bg-lime-700 h-32 justify-end p-2">

      {/* Row for the icons */}
      <View className="flex-row items-center justify-between">

        {/* Left Back Button */}
        {back ? (
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } else {
                navigation.popToTop();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              }
            }}
            className="p-2"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </Pressable>
        ) : (
          // placeholder to keep title centered even without back button
          <View className="p-6 w-7" />
        )}

        {/* Center Title (absolute center) */}
        <View className="absolute left-0 right-0 pb-4 items-center">
          <Text className="text-white text-3xl text-lime-100 font-bold">
            Dinner Tonight?
          </Text>
        </View>

      
        {back ? (
          <Pressable
            onPress={() => navigation.popToTop()}
            className="p-2"
            accessibilityLabel="To Top"
          >
            <Ionicons name="chevron-up" size={28} color="white" />
          </Pressable>
        ) : (
          
          <View className="p-6 w-7" />
        )}

      </View>
    </View>
  );
}

  return (
    <Stack screenOptions={{ 
      headerShown: true, 
      header: (props) => <CustomHeader {...props} />,
      // header: () => <CustomHeader />
      
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