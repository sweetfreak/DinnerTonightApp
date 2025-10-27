import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../firebase/firebaseConfig"

import useFavorites from "../../hooks/useFavorites"
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest } from "../../services/friendRequests"

import RecipeCardMini from "./RecipeCard"
import type  Recipe  from "../../types/Recipe"
import type  UserProfile from "../../types/User"

import {Text, View, TouchableOpacity, Button, Image, ScrollView} from 'react-native'
import { Link, useLocalSearchParams } from "expo-router";

import { useUserProfile } from "../../contexts/UserProfileContext";

interface UserProfileProps {
 myId?: string

 // openEditProfile: () => void
}

export default function UserProfilePage({ myId }: UserProfileProps) {
  const params = useLocalSearchParams<{ id: string }>();
const id = myId && myId !== "" ? myId : params.id;
  const { currentUserProfile } = useUserProfile();
  
  const isCurrentUser = currentUserProfile?.uid === id
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites(currentUserProfile?.savedRecipes)

  const hasSentFriendRequest = currentUserProfile?.friendRequestsSent?.includes(id)
  const hasReceivedFriendRequest = currentUserProfile?.friendRequestsReceived?.includes(id)
  const isFriend = currentUserProfile?.friends?.includes(id)



  // useEffect(() => {
  //   async function fetchProfile() {
  //     try {
  //       if (id === currentUserProfile?.uid && currentUserProfile) {
  //         setProfile(currentUserProfile)
  //       } 

  //       const docRef = doc(db, "users", id)
  //       const docSnap = await getDoc(docRef)

  //       if (!docSnap.exists()) {
  //         console.log("No user found for ID:", id)
  //         setProfile(null)
  //         // setIsCurrentUser(false)
  //         return
  //       }

  //       setProfile({
  //         uid: docSnap.id,
  //         email: docSnap.data().email,
  //         displayName: docSnap.data().displayName,
  //         photoURL: docSnap.data().photoURL,
  //         bio: docSnap.data().bio,
  //         favoriteCuisine: docSnap.data().favoriteCuisine,
  //         savedRecipes: docSnap.data().savedRecipes,
  //         myRecipes: docSnap.data().myRecipes,
  //         friends: docSnap.data().friends,
  //         friendRequestsReceived: docSnap.data().friendRequestsReceived,
  //         friendRequestsSent: docSnap.data().friendRequestsSent,
  //         chatGroupIds: docSnap.data().chatGroupIds
  //       })

  //     } catch (error) {
  //       console.error("Error fetching user profile:", error)
  //     }
  //   }
  //   fetchProfile()
      
  //   }, [id, currentUserProfile, currentUserProfile, isCurrentUser])

// useEffect(() => {
//     async function fetchRecipes() {
//       if (!id) {
//         console.warn("fetchProfile called with undefined id");
//         return;
//       }
//       if (!profile?.myRecipes?.length) {
//         setRecipes([])
//         return
//       }

//       try {
//         const recipePromises = profile.savedRecipes.map(async (recipeId: string) => {
//           const recipeRef = doc(db, "recipes", recipeId)
//           const recipeSnap = await getDoc(recipeRef)
//           if (!recipeSnap.exists()) return null
//           return { id: recipeSnap.id, ...recipeSnap.data() } as Recipe
//         })

//         const fetched = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[]
//         setRecipes(fetched)
//       } catch (error) {
//         console.error("Error loading recipes:", error)
//       }
//     }

//     fetchRecipes()
//   }, [profile?.savedRecipes])
useEffect(() => {
  async function fetchProfile() {
    try {
      if (!id) {
        console.warn("fetchProfile called with undefined id");
        return;
      }

      if (id === currentUserProfile?.uid && currentUserProfile) {
        setProfile(currentUserProfile);
        return;
      }

      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log("No user found for ID:", id);
        setProfile(null);
        return;
      }

      const data = docSnap.data();
      setProfile({
        uid: docSnap.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        bio: data.bio,
        favoriteCuisine: data.favoriteCuisine,
        savedRecipes: data.savedRecipes ?? [],
        myRecipes: data.myRecipes ?? [],
        friends: data.friends ?? [],
        friendRequestsReceived: data.friendRequestsReceived ?? [],
        friendRequestsSent: data.friendRequestsSent ?? [],
        chatGroupIds: data.chatGroupIds ?? [],
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  if (id) fetchProfile(); // <-- only run if id is truthy
}, [id, currentUserProfile]);

useEffect(() => {
  async function fetchRecipes() {
    if (!profile?.savedRecipes?.length) {
      setRecipes([]);
      return;
    }

    try {
      const recipePromises = profile.savedRecipes.map(async (recipeId: string) => {
        const recipeRef = doc(db, "recipes", recipeId);
        const recipeSnap = await getDoc(recipeRef);
        if (!recipeSnap.exists()) return null;
        return { id: recipeSnap.id, ...recipeSnap.data() } as Recipe;
      });

      const fetched = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[];
      setRecipes(fetched);
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  }

  fetchRecipes();
}, [profile?.savedRecipes]);

  if (!profile) return <Text className="text-center mt-8">Loading profile...</Text>
  if (favoritesLoading) return <Text className="text-center mt-8">Loading favorites...</Text>

  async function handleSendRequest() {
    if (!currentUserProfile) return
    await sendFriendRequest(currentUserProfile.uid, id)
    alert("Friend Request Sent!")
  }

    async function handleAcceptRequest() {
    if (!currentUserProfile) return
    await acceptFriendRequest(currentUserProfile.uid, id)
    alert("Friend Request Accepted!")
  }

    async function handleDeclineRequest() {
    if (!currentUserProfile) return
    await declineFriendRequest(currentUserProfile.uid, id)
    alert("Friend Request Declined!")
  }

  async function handleRemoveFriend() {
    if (!currentUserProfile) return
    // await declineFriendRequest(currentUserProfile.uid, id)
    alert("Friend Removal Note working yet")
  }

// function openEditProfile(){
//     setActiveSection("editProfile")
//   }

  return (
    <ScrollView className='flex-col bg-lime-100 '>
      <View className="flex place-content-center" > 
        <View className="flex flex-col m-8">
        {/* IMAGE + BUTTON */}
        <Image 
            source={require("../../assets/tempPic.jpg") } 
            className="flex w-48 h-48 object-cover rounded-full "
            resizeMode="cover"
        />  
        {isCurrentUser && 
          <Link 
            href= './EditProfile'
            className="p-1 m-4 place-content-center rounded text-white bg-blue-500 hover:font-bold">
              Edit Profile
          </Link>}
        {!isCurrentUser && (
            <>
              {isFriend ? (
                <Button title="Friends ✓" 
                disabled>
                </Button>
              ) : hasSentFriendRequest ? (
                <Button 
                title='Request Sent' 
                disabled>
                </Button>
              ) : hasReceivedFriendRequest ? (
                <View className="flex gap-4 m-8">
                  <Button title="Accept" onPress={handleAcceptRequest} 
                  //className="p-1 rounded text-white bg-blue-500 hover:font-bold" 
                  >
                  </Button>  
             
                  <Button 
                  title="Decline" 
                  onPress={handleDeclineRequest} 
                  // className="p-1 rounded text-white bg-red-500 hover:font-bold"
                  >
                  </Button>
                </View>
              ) : (
                <Button
                title='Add friend'  
                onPress={handleSendRequest} 
                // className="m-8 p-1 rounded text-white bg-blue-500"
                >
                </Button>
              )}
            </>
          )}
        </View>

        {/* WELCOME */}
        <View className='place-content-center font-bold text-4xl'>
          {isCurrentUser ? (
          <Text>Welcome, {profile?.displayName ?? "..."}!</Text>
            ) : (
          <Text>Chef {profile?.displayName ?? "..."}</Text>
            )}
        </View>
      </View>

      
      <View className="flex place-content-center items-center">
        {/* USER BIO */}
        <Text className='m-4 text-xl'>
          <Text className='font-bold'>Bio:</Text> 
          <Text>{profile?.bio} </Text>       
        </Text>

    
        {/* USER Favorites */}
        <Text className='m-8 text-xl'>
          <Text className='font-bold'>Favorite Cuisine:</Text> 
   
          <Text>{profile?.favoriteCuisine} </Text>       
        </Text>
      </View>

      {/* SAVED RECIPES */}
      <View>
        <Text className="text-2xl font-semibold text-center mb-6">
          {isCurrentUser ? "My Favorite Recipes" : `${profile.displayName}'s Favorite Recipes`}
        </Text>
        <View>
          {recipes.length > 0 ? (
            recipes.map((dish) => (
              <RecipeCardMini
                key={dish.id}
                recipe={dish}
                isFavorite={favorites.includes(dish.id)}
                toggleFavorite={() => toggleFavorite(dish.id)}
              />
            ))
          ) : (
            <Text>No recipes yet.</Text>
          )}
        </View>
      </View>

    </ScrollView>
  )
}