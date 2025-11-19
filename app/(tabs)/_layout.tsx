// // app/(tabs)/_layout.tsx
// import { Tabs } from "expo-router";
// import {View, Platform} from 'react-native'
// import { Ionicons } from "@expo/vector-icons";
// import { useUserProfile } from "../../contexts/UserProfileContext";
// import { useScrollToTop } from '@react-navigation/native';
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { SafeAreaView } from 'react-native-safe-area-context';

// import React, { useRef } from 'react';



// export default function TabsLayout() {
//       const { currentUserProfile } = useUserProfile();


//       function CustomTabs() {

//         return (

//         )
//       }

//   return (
// <View className='flex-1 bg-lime-200'>
//     <Tabs
    
//       safeAreaInsets={{bottom: 0}}
//       screenOptions={{
//         headerShown: false,

//         tabBarHideOnKeyboard: true,
//         tabBarVisibilityAnimationConfig: {
//           show: {
//             animation: 'timing',
//             config: { duration: 300 }, 
//           },
//           hide: {
//             animation: 'spring',
//             config: { damping: 20, stiffness: 90 },
//           },
//         },
//         //tabBarPosition: "bottom",
//         tabBarActiveTintColor: "white",
//         tabBarActiveBackgroundColor: 'olivedrab',
//         tabBarInactiveBackgroundColor: 'yellowgreen',
//         tabBarInactiveTintColor: 'green',
//         tabBarLabelStyle: {
//           fontSize: 14,
//            paddingBottom: Platform.OS === 'ios' ? 20 : 4,
          
//         },
       

//         tabBarStyle: Platform.select({
//           ios: {
//             position: 'absolute',
//             height: 75,
//             //paddingTop: 10,
//           },
//           default: {
//             borderTopWidth: 0,
//             elevation: 0,
//             height: 75,
           
//           }
//         }),
        
//         animation: 'shift',
//       }}
      
//     >
//       <Tabs.Screen
//         name="recipes/index"
//         options={{
//           title: "Recipes",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="book-sharp" size={size} color={color} />
//           ),
//         }}
        
//       />
//       <Tabs.Screen
//         name="chat/index"
//         options={{
//           title: "Friends",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="chatbubble-sharp" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile/index"
//         initialParams={{id: currentUserProfile?.uid}}
//         options={{
//           title: "Profile", 
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person-sharp" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//     </View>
//   );
// }

import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "../../contexts/UserProfileContext";
import "nativewind";

export default function TabsLayout() {
  const { currentUserProfile } = useUserProfile();

  // Custom Tab Bar
  function CustomTabBar({ state, descriptors, navigation }: any) {
    return (
      <View className="flex-row h-20 bg-lime-800 border-t border-lime-700">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const colorClass = isFocused ? "text-white" : "text-lime-300";
          const bgClass = isFocused ? "bg-lime-700" : "bg-lime-800";
          const ioniconClass = isFocused ? "white" : "#D9F99D"

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              className={`flex-1 items-center justify-center ${bgClass}`}
            >
              <Ionicons
                name={
                  route.name === "recipes/index"
                    ? "book-sharp"
                    : route.name === "chat/index"
                    ? "chatbubble-sharp"
                    : "person-sharp"
                }
                size={24}
                color={ioniconClass}
              />
              <Text className={`text-xs mt-1 ${colorClass}`}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="recipes/index" options={{ title: "Recipes" }} />
      <Tabs.Screen name="chat/index" options={{ title: "Friends" }} />
      <Tabs.Screen
        name="profile/index"
        initialParams={{ id: currentUserProfile?.uid }}
        options={{ title: "Profile" }}
      />
    </Tabs>
  );
}