import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Text, View, TouchableOpacity, Button, Image, ScrollView } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useUserProfile } from "../../contexts/UserProfileContext";
import useFavorites from "../../hooks/useFavorites";
import SignOutButton from "./SignOutButton";
import RecipeCardMini from "./RecipeCard";
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest } from "../../services/friendRequests";
import type Recipe from "../../types/Recipe";
import type UserProfile from "../../types/User";

export default function UserProfilePage() {
  const params = useLocalSearchParams<{ id: string }>();
  const { currentUserProfile } = useUserProfile();

  const isViewingOwnProfile = !params?.id;

  const id = params?.id || currentUserProfile?.uid;

  
  //   console.log('🔍 Debug:', {
  //   paramsId: params.id,
  //   currentUserUid: currentUserProfile?.uid,
  //   finalId: id,
  // });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites(currentUserProfile?.savedRecipes);


  // 🔹 Single stable profile fetch
  useEffect(() => {
    if (!id ) return;

    const loadProfile = async () => {
      if (id === currentUserProfile?.uid) {
        setProfile(currentUserProfile);
        return;
      }

      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.warn("No user found for ID:", id);
        setProfile(null);
        return;
      }

      const data = docSnap.data();
      setProfile({
        uid: docSnap.id, // ✅ attach uid manually
        ...data,
      } as UserProfile);
    };

    loadProfile();
  }, [id, currentUserProfile, isViewingOwnProfile]);

  // 🔹 Load saved recipes when profile changes
  useEffect(() => {
    if (!profile?.savedRecipes?.length) {
      setRecipes([]);
      return;
    }

    const loadRecipes = async () => {
      const recipeDocs = await Promise.all(
        profile.savedRecipes.map(async (rid) => {
          const snap = await getDoc(doc(db, "recipes", rid));
          return snap.exists() ? ({ id: snap.id, ...snap.data() } as Recipe) : null;
        })
      );
      setRecipes(recipeDocs.filter(Boolean) as Recipe[]);
    };

    loadRecipes();
  }, [profile?.savedRecipes]);

  // 🔹 Loading states
   if (!id) {
    return <Text className="text-center mt-8">No user found.</Text>;
  }
  if (!profile) return <Text className="text-center mt-8">Loading profile...</Text>;
  if (favoritesLoading) return <Text className="text-center mt-8">Loading favorites...</Text>;

  // 🔹 Friend logic
  async function handleSendRequest() {
    if (!currentUserProfile || !id) return;
    await sendFriendRequest(currentUserProfile.uid, id);
    alert("Friend Request Sent!");
  }

  async function handleAcceptRequest() {
    if (!currentUserProfile || !id) return;
    await acceptFriendRequest(currentUserProfile.uid, id);
    alert("Friend Request Accepted!");
  }

  async function handleDeclineRequest() {
    if (!currentUserProfile || !id) return;
    await declineFriendRequest(currentUserProfile.uid, id);
    alert("Friend Request Declined!");
  }

  if (!params?.id && !currentUserProfile) {
    return <Text className="text-center mt-8">Loading...</Text>;
  }

  if (!profile) return <Text className="text-center mt-8">Loading profile...</Text>;
  if (favoritesLoading) return <Text className="text-center mt-8">Loading favorites...</Text>;



  const userId = id!;
  const isCurrentUsersProfile = profile?.uid === currentUserProfile?.uid;
  const hasSentFriendRequest = currentUserProfile?.friendRequestsSent?.includes(userId);
  const hasReceivedFriendRequest = currentUserProfile?.friendRequestsReceived?.includes(userId);
  const isFriend = currentUserProfile?.friends?.includes(userId);



  return (
    <ScrollView className="bg-lime-100">
      <View className="self-center">
        <Image
          source={{ uri: profile?.photoURL || "" }}
          className="flex self-center w-48 h-48 mt-4 object-cover rounded-full"
          resizeMode="cover"
        />

        {isCurrentUsersProfile ? (
          <View>
            <Link href="../../components/EditProfile" className="p-1 m-4 rounded text-white bg-blue-500 self-center">
              Edit Profile
            </Link>
            <SignOutButton />
          </View>
        ) : (
          <>
            {isFriend ? (
              <Button title="Friends ✓" disabled />
            ) : hasSentFriendRequest ? (
              <Button title="Request Sent" disabled />
            ) : hasReceivedFriendRequest ? (
              <View className="flex gap-4 m-8">
                <Text>Add {profile.displayName} as a friend?</Text>
                <View className="flex-row self-center gap-4">
                  <TouchableOpacity onPress={handleAcceptRequest} className="p-2 rounded bg-green-500">
                    <Text className="text-white">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeclineRequest} className="p-2 rounded bg-red-500">
                    <Text className="text-white">Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Button title="Add Friend" onPress={handleSendRequest} />
            )}
          </>
        )}
      </View>

      <View className="m-2 items-center">
        <Text className="text-3xl m-2">
          {isCurrentUsersProfile ? `Welcome, ${profile.displayName}!` : `Chef ${profile.displayName}`}
        </Text>
      </View>

      <Text className="text-xl ml-8 text-start">
        <Text className="font-bold">Bio: </Text>
        {profile.bio}
      </Text>

      <View className="m-4" />

      <Text className="text-xl ml-8">
        <Text className="font-bold">Favorite Cuisine: </Text>
        {profile.favoriteCuisine}
      </Text>

      <View className="m-4" />

      <View>
        <Text className="text-2xl font-semibold text-center mb-6">
          {isCurrentUsersProfile ? "My Favorite Recipes" : `${profile.displayName}'s Favorite Recipes`}
        </Text>
        <View className="m-4">
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
  );
}


// import {  useState, useEffect } from "react"
// import { useAuth } from "../../contexts/authContext"
// import { doc, getDoc} from "firebase/firestore"
// import { db } from "../../firebase/firebaseConfig"
// // import { doSignOut } from '../../firebase/auth'
// import SignOutButton from "./SignOutButton"

// import useFavorites from "../../hooks/useFavorites"
// import { sendFriendRequest, acceptFriendRequest, declineFriendRequest } from "../../services/friendRequests"

// import RecipeCardMini from "./RecipeCard"
// import type  Recipe  from "../../types/Recipe"
// import type  UserProfile from "../../types/User"

// import {Text, View, TouchableOpacity, Button, Image, ScrollView} from 'react-native'
// import { Link, useLocalSearchParams } from "expo-router";

// import { useUserProfile } from "../../contexts/UserProfileContext";

// interface UserProfileProps {
//  myId?: string

//  // openEditProfile: () => void
// }

// export default function UserProfilePage({ myId }: UserProfileProps) {
//   const params = useLocalSearchParams<{ id: string }>();
// const id = myId && myId !== "" ? myId : params.id;
//   const { currentUserProfile } = useUserProfile();
  

//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [recipes, setRecipes] = useState<Recipe[]>([])
//   const {favorites, toggleFavorite, loading: favoritesLoading } = useFavorites(currentUserProfile?.savedRecipes)
  
//   //const [isCurrentUsersProfile, setIsCurrentUsersProfile] = useState(true)
//   const isCurrentUsersProfile = profile?.uid === currentUserProfile?.uid;
//   const hasSentFriendRequest = currentUserProfile?.friendRequestsSent?.includes(id)
//   const hasReceivedFriendRequest = currentUserProfile?.friendRequestsReceived?.includes(id)
//   const isFriend = currentUserProfile?.friends?.includes(id)

//   useEffect(() => {
//   if (!id || !currentUserProfile) return;

//   async function getUserProfile() {
//     if (id === currentUserProfile?.uid) {
//       setProfile(currentUserProfile);
//       return;
//     }

//     const userDoc = await getDoc(doc(db, "users", id));
//     if (userDoc.exists()) {
//       setProfile(userDoc.data() as UserProfile);
//     } else {
//       console.warn("No such user:", id);
//       setProfile(null);
//     }
//   }

//   getUserProfile();
// }, [id, currentUserProfile]);


// useEffect(() => {
//   async function fetchProfile() {

//     // console.log("profile?.uid: ", profile?.uid)
//     // console.log("id (param): ", id)
//     // console.log("currentUserProfile?.uid: ",currentUserProfile?.uid)

//     try {
//       if (!id) {
//         console.warn("fetchProfile called with undefined id");
//         return;
//       }

//       if (id === currentUserProfile?.uid) {
//         setProfile(currentUserProfile);
//         console.log("set new profile")
//         return;
//       }

//       const docRef = doc(db, "users", id);
//       const docSnap = await getDoc(docRef);

//       if (!docSnap.exists()) {
//         console.log("No user found for ID:", id);
//         setProfile(null);
//         return;
//       }

//       const data = docSnap.data();
//       setProfile({
//         uid: docSnap.id,
//         email: data.email,
//         displayName: data.displayName,
//         photoURL: data.photoURL,
//         bio: data.bio,
//         favoriteCuisine: data.favoriteCuisine,
//         savedRecipes: data.savedRecipes ?? [],
//         myRecipes: data.myRecipes ?? [],
//         friends: data.friends ?? [],
//         friendRequestsReceived: data.friendRequestsReceived ?? [],
//         friendRequestsSent: data.friendRequestsSent ?? [],
//         chatGroupIds: data.chatGroupIds ?? [],
//       });

//       //setIsCurrentUsersProfile(profile?.uid == currentUserProfile?.uid)
//       console.log("isCurrentUsersProfile is ", isCurrentUsersProfile)

//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//     }
//   }

//   if (id) fetchProfile(); // <-- only run if id is truthy
// }, [id, currentUserProfile]);

// useEffect(() => {
//   async function fetchRecipes() {
//     if (!profile?.savedRecipes?.length) {
//       setRecipes([]);
//       return;
//     }

//     try {
//       const recipePromises = profile.savedRecipes.map(async (recipeId: string) => {
//         const recipeRef = doc(db, "recipes", recipeId);
//         const recipeSnap = await getDoc(recipeRef);
//         if (!recipeSnap.exists()) return null;
//         return { id: recipeSnap.id, ...recipeSnap.data() } as Recipe;
//       });

//       const fetched = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[];
//       setRecipes(fetched);
//     } catch (error) {
//       console.error("Error loading recipes:", error);
//     }
//   }

//   fetchRecipes();
// }, [profile?.savedRecipes]);

//   if (!profile) return <Text className="text-center mt-8">Loading profile...</Text>
//   if (favoritesLoading) return <Text className="text-center mt-8">Loading favorites...</Text>

//   async function handleSendRequest() {
//     if (!currentUserProfile) return
//     await sendFriendRequest(currentUserProfile.uid, id)
//     alert("Friend Request Sent!")
//   }

//     async function handleAcceptRequest() {
//     if (!currentUserProfile) return
//     await acceptFriendRequest(currentUserProfile.uid, id)
//     alert("Friend Request Accepted!")
//   }

//     async function handleDeclineRequest() {
//     if (!currentUserProfile) return
//     await declineFriendRequest(currentUserProfile.uid, id)
//     alert("Friend Request Declined!")
//   }

//   async function handleRemoveFriend() {
//     if (!currentUserProfile) return
//     // await declineFriendRequest(currentUserProfile.uid, id)
//     alert("Friend Removal Note working yet")
//   }



//   return (
//     <ScrollView className='bg-lime-100 '>
//       <View className="self-center" > 
       
//           {/* IMAGE + BUTTON */}
//           <Image 
//             source={isCurrentUsersProfile ? {uri: currentUserProfile?.photoURL ?? ''} : {uri: profile?.photoURL ?? '' } }
//             className="flex self-center w-48 h-48 object-cover rounded-full "
//             resizeMode="cover"
//           />  
//           {isCurrentUsersProfile && 
//           <View>
//             <Link 
//               href= '../../components/EditProfile'
//               className="p-1 m-4 rounded text-white bg-blue-500 self-center">
//                 Edit Profile
//             </Link>
//             <SignOutButton/>
//             </View>
//             }
          
//           {!isCurrentUsersProfile && (
//             <>
//               {isFriend ? (
//                 <Button title="Friends ✓" 
//                 disabled>
//                 </Button>
//               ) : hasSentFriendRequest ? (
//                 <Button 
//                 title='Request Sent' 
//                 disabled>
//                 </Button>
//               ) : hasReceivedFriendRequest ? (
//                 <View className="flex gap-4 m-8 ">
//                   <Text>Add {profile?.displayName} as a friend?</Text>
//                   <View className="flex-row self-center gap-4">
//                     <TouchableOpacity onPress={handleAcceptRequest} 
//                     className="p-2 rounded self-center bg-green-500 " 
//                     >
//                       <Text className='text-white'>Accept</Text>
//                     </TouchableOpacity>  
              
                  
//                     <TouchableOpacity onPress={handleDeclineRequest} 
//                     className="p-2 rounded self-center bg-red-500 " 
//                     >
//                       <Text className='text-white'>Decline</Text>
//                     </TouchableOpacity> 
//                   </View>
//                 </View>
//               ) : (
//                 <Button
//                 title='Add friend'  
//                 onPress={handleSendRequest} 
//                 // className="m-8 p-1 rounded text-white bg-blue-500"
//                 >
//                 </Button>
//               )}
//             </>
//           )}
        
//         </View>
//         {/* WELCOME */}
//         <View className="m-2 items-center">
//           <Text className='text-3xl m-2' > {isCurrentUsersProfile ? `Welcome, ${profile?.displayName ?? "..."}!` : `Chef ${profile?.displayName}`}</Text>
//           </View>
//           {/* USER BIO */}
          
//           <Text className="text-xl ml-8 text-start"><Text className='font-bold'>Bio: </Text>
//             {profile?.bio} 
//           </Text>       

//            <View className='m-4'></View>

//             {/* USER Favorites */}
//           <Text className='text-xl ml-8 '>
//             <Text className='font-bold'>Favorite Cuisine: </Text> 
//             {profile?.favoriteCuisine}     
//           </Text>

//           <View className='m-4'></View>

//       {/* SAVED RECIPES */}
//       <View >
//         <Text className="text-2xl font-semibold text-center mb-6">
//           {isCurrentUsersProfile ? "My Favorite Recipes" : `${profile.displayName}'s Favorite Recipes`}
//         </Text>
//         <View className="m-4">
//           {recipes.length > 0 ? (
//             recipes.map((dish) => (
//               <RecipeCardMini
//                 key={dish.id}
//                 recipe={dish}
//                 isFavorite={favorites.includes(dish.id)}
//                 toggleFavorite={() => toggleFavorite(dish.id)}
//               />
//             ))
//           ) : (
//             <Text>No recipes yet.</Text>
//           )}
//         </View>
//       </View>

//     </ScrollView>
//   )
// }