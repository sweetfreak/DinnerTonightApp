// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import {View, Platform} from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { useScrollToTop } from '@react-navigation/native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from 'react-native-safe-area-context';

import React, { useRef } from 'react';



export default function TabsLayout() {
      const { currentUserProfile } = useUserProfile();
      

  return (
<View className='flex-1 bg-lime-200'>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarVisibilityAnimationConfig: {
          show: {
            animation: 'timing',
            config: { duration: 300 }, 
          },
          hide: {
            animation: 'spring',
            config: { damping: 20, stiffness: 90 },
          },
        },
        tabBarPosition: "bottom",
        tabBarActiveTintColor: "white",
        tabBarActiveBackgroundColor: 'olivedrab',
        tabBarInactiveBackgroundColor: 'yellowgreen',
        tabBarInactiveTintColor: 'green',
        tabBarLabelStyle: {
          fontSize: 14,
           paddingBottom: Platform.OS === 'ios' ? 20 : 4, // ✅ CHANGED: Added platform-specific padding
          
        },
       

        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            
          },
          default: {
            borderTopWidth: 0, // ✅ ADDED: Remove top border
            elevation: 0, // ✅ ADDED: Remove shadow on Android

          }
        }),
        animation: 'shift',
      }}
      
    >
      <Tabs.Screen
        name="recipes/index"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-sharp" size={size} color={color} />
          ),
        }}
        
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        initialParams={{id: currentUserProfile?.uid}}
        options={{
          title: "Profile", 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}