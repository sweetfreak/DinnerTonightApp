import { useState, useEffect, useMemo } from "react";
import { getAuth} from "firebase/auth";
import { doSignOut } from './firebase/auth'


//Components
import SavedRecipes from "./app/components/SavedRecipes";
import NewRecipe from "./app/components/NewRecipe";
import ChatPage from "./app/(tabs)/chat/components/ChatPage";
// import Header from "./components/Header";
import RecipeSearch from "./app/components/RecipeSearch";
import MyRecipes from "./app/components/MyRecipes";
import FullRecipe from "./app/components/FullRecipe";
import UserProfilePage from "./app/(tabs)/profiles/components/UserProfilePage";
import EditProfile from "./app/(tabs)/profiles/components/EditProfile";
import EditRecipe from "./app/components/EditRecipe";


//data/types
import useActiveSection from "./contexts/ActiveSectionContext";
import type Recipe from "./types/Recipe"
import type UserProfile from "./types/User";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";

import {View, Text, useWindowDimensions, Button} from 'react-native'
import { Link } from "expo-router";

import { TabView, SceneMap } from 'react-native-tab-view';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

const renderScene = SceneMap({
  first: SavedRecipes,
  second: ChatPage
})

const routes = [
  { key: 'first', title: 'Recipes'},
  { key: 'second', title: 'Chats'},
]



export default function MainContent() {
  const auth = getAuth();
  const currentUser = auth.currentUser!;
   
  //const {activeSection, setActiveSection} = useActiveSection()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)


  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)

   const[myRecipes, setMyRecipes] = useState<Recipe[]>([])


  
  const memoizedProfile = useMemo(() => currentUserProfile, [currentUserProfile?.uid]);


  const [latestRecipe, setLatestRecipe] = useState<Recipe | null>(null);



  useEffect(() => {
    if (!currentUser) return;

    async function fetchCurrentUserProfile() {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.log("No profile found for current user");
          return;
        }

        // TypeScript now knows data exists
        const data = docSnap.data() as UserProfile;

        setCurrentUserProfile({
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          bio: data.bio,
          savedRecipes: data.savedRecipes,
          myRecipes: data.myRecipes,
          friends: data.friends,
          friendRequestsSent: data.friendRequestsSent,
          friendRequestsReceived: data.friendRequestsReceived,
          chatGroupIds: data.chatGroupIds
        });

      } catch (error) {
          console.error("Error fetching current user profile:", error);
      }
    }
    fetchCurrentUserProfile();
  }, [currentUser]);

  
  if (!currentUser) return null;



  // function openProfile(id: string, profile?: UserProfile) {
  //   setSelectedProfile(id);
  //   if (profile) {
  //     setCurrentUserProfile(profile); // pass the preloaded data
  //   }
  //   setActiveSection("profile");
  // }



  // function openEditRecipe() {
  //   setActiveSection("editRecipe")
  // }

  // const layout = useWindowDimensions()
  // const [index, setIndex] = useState(0)
  const Tab = createBottomTabNavigator();


  return (
    <>
 

     <View className='flex'>
      <Text>Welcome {currentUserProfile?.displayName}!</Text>

      <Link href={{ pathname:"./components/UserProfileComponents/UserProfilePage", params: {id: currentUserProfile?.uid}}} className="p-5 font-bold">
        <Text>My Profile</Text>
      </Link>

      {/* <Link href="./components/RecipeComponents/NewRecipe" className="p-5 font-bold">
        <Text>Add a New Recipe</Text>
      </Link>

      <Link href={{ pathname: './components/RecipeComponents/SavedRecipes' }}  className='p-5 font-bold'>
          <Text>Saved Recipes</Text>
      </Link>

      <Link href={{ pathname: './components/RecipeComponents/MyRecipes'}}  className='p-5 font-bold'>
          <Text>My Recipes</Text>
      </Link>

      <Link href={{ pathname: './components/RecipeComponents/RecipeSearch' }}  className='p-5 font-bold'>
          <Text>All Recipes/Recipe Search</Text>
      </Link> */}

      <Link href={{ pathname: './components/ChatComponents/ChatPage' }}  className='p-5 font-bold'>
          <Text>Chats</Text>
      </Link>

    <Button
    title="Sign Out"
    onPress={doSignOut}
    />
 
    </View>

      
        {/*}  <Tab.Navigator
            screenOptions={{ headerShown: false }}
          >
            <Tab.Screen name="Recipes" component={NewRecipe} />
            <Tab.Screen name="Chats" component={ChatPage} />
          </Tab.Navigator> */}
       
    </>
  )
}
