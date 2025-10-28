// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "../../contexts/UserProfileContext";


export default function TabsLayout() {
      const { currentUserProfile } = useUserProfile();
      
  return (

    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "limegreen",
      }}
    >
      <Tabs.Screen
        name="recipes/index"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        initialParams={{id: currentUserProfile?.uid}}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}