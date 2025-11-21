import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../firebase/firebaseConfig"
import { Text, View, TouchableOpacity, Pressable, Button, Image, ScrollView, Modal } from "react-native"
import { Link, useLocalSearchParams } from "expo-router"
import { useUserProfile } from "../../contexts/UserProfileContext"
// import useFavorites from "../../hooks/useFavorites"
import SignOutButton from "./SignOutButton"
import RecipeCard from "./RecipeCard"
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from "../../services/friendRequests"
import type Recipe from "../../types/Recipe"
import type UserProfile from "../../types/User"
import { Ionicons } from "@expo/vector-icons"


export default function UserProfilePage() {
  const params = useLocalSearchParams<{ id: string }>()

  const { currentUserProfile, favorites, toggleFavorite } = useUserProfile()

  const isViewingOwnProfile = !params?.id

  const id = params?.id || currentUserProfile?.uid

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  //  const {loading: favoritesLoading } = useFavorites(currentUserProfile?.savedRecipes)
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // 🔹 Single stable profile fetch
  useEffect(() => {
    if (!id ) return

    const loadProfile = async () => {
      if (id === currentUserProfile?.uid) {
        setProfile(currentUserProfile)
        return;
      }

      const docRef = doc(db, "users", id)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        console.warn("No user found for ID:", id)
        setProfile(null)
        return
      }

      const data = docSnap.data()
      setProfile({
        uid: docSnap.id, 
        ...data,
      } as UserProfile)
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
  // if (favoritesLoading) return <Text className="text-center mt-8">Loading favorites...</Text>;

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

  async function handleRemoveFriend(friendId: string) {
    if (!currentUserProfile || !id) return;
    await removeFriend(currentUserProfile.uid, id);
    alert("Friend removed");
  }

  if (!params?.id && !currentUserProfile) {
    return <Text className="text-center mt-8">Loading...</Text>;
  }

  if (!profile) return <Text className="text-center mt-8">Loading profile...</Text>;
  // if (favoritesLoading) return <Text className="text-center mt-8">Loading favorites...</Text>;



  const userId = id!;
  const isCurrentUsersProfile = profile?.uid === currentUserProfile?.uid;
  const hasSentFriendRequest = currentUserProfile?.friendRequestsSent?.includes(userId);
  const hasReceivedFriendRequest = currentUserProfile?.friendRequestsReceived?.includes(userId);
  const isFriend = currentUserProfile?.friends?.includes(userId);



  return (
    <ScrollView className="bg-lime-100">
      {isCurrentUsersProfile &&
        <Pressable className="self-end absolute p-4 active:opacity-50"
          onPress={()=> setMenuOpen((prev) => !prev)}
        >
          <Ionicons name="settings" size={28} color="#35530e" />
        </Pressable>
      }
      {menuOpen &&
        <View
          className= "absolute top-16 right-4 bg-lime-700 rounded-lg shadow-lg p-3 z-50">
            <Link href="../../components/EditProfile"
            className="p-2 rounded bg-blue-500 text-white mb-2">
            
            Edit Profile
            </Link>

            <View className="p-2 rounded bg-red-500">
              <SignOutButton />
            </View>
        </View>
      }
      <View className="items-center flex-row ">
        <Text className="text-3xl text-center text-lime-800 font-bold m-6">
          {isCurrentUsersProfile ? `Welcome, ${profile.displayName}!` : `${profile.displayName}'s Profile`}
        </Text>
      </View>

      <View className="self-center">
        <Image
          source={{ uri: profile?.photoURL || "" }}
          className="flex self-center w-48 h-48 mt-4 object-cover rounded-full"
          resizeMode="cover"
        />

        {!isCurrentUsersProfile &&
   
          <View>
            {isFriend ? (
              <View className="flex-row items-center p-2">
              <Button title="Friends ✓" disabled />
              <TouchableOpacity onPress={() => setShowModal(true)} className="bg-red-600 p-2 rounded-xl">
                <Text className="text-white">Remove Friend</Text>
              </TouchableOpacity>
              <Modal
                visible={showModal}
              >
                <View className="flex-1 bg-black/50 justify-center items-center px-4">
                  <View className="bg-lime-100 rounded-2xl w-full max-h-[80%] p-4">
                    <View className="flex-col justify-between items-center mb-3">
                      <Text>Are you sure you want to remove {profile.displayName} as a friend?</Text>
                      <View className="flex-row gap-12">
                      <TouchableOpacity
                            onPress={() => handleRemoveFriend(profile.uid)}
                            
                            >
                              <Text className="bg-red-600 text-white p-4 rounded-xl font-semibold">Confirm</Text>
                            </TouchableOpacity>
                            <Pressable onPress={() => setShowModal(false)}>
                              <Text className="bg-blue-600 text-white p-4 rounded-xl font-semibold">Back</Text>
                            </Pressable>
                            </View>
                          </View>
                          </View>
                          </View>
              </Modal>

              </View>
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
            ) : hasSentFriendRequest ? (
              <Button title="Request Sent" disabled />
            ) : (
              <Button title="Add Friend" onPress={handleSendRequest} />
            )}
          </View>
      }
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
              <View key={dish.id} className="mb-2">
                <RecipeCard
                  recipe={dish}
                  //isFavorite={favorites.includes(dish.id)}
                  //toggleFavorite={() => toggleFavorite(dish.id)}
                />
              </View>
            ))
          ) : (
            <Text>No recipes yet.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

