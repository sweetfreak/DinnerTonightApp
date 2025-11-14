import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import {Link} from 'expo-router'
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import type UserProfile from "../../types/User";
import { useUserProfile } from "../../contexts/UserProfileContext";

export default function FriendSearch() {
  const { currentUserProfile } = useUserProfile();
  const [publicUsers, setPublicUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const usersRef = collection(db, "users");

        const q = query(
          usersRef,
          where("settings.isPublicProfile", "==", true)
        );

        const snap = await getDocs(q);

        const fetched = snap.docs.map((d) => ({
          uid: d.id,
          ...d.data(),
        })) as UserProfile[];

        // exclude yourself
        const cleaned = fetched.filter(
          (u) => u.uid !== currentUserProfile?.uid
        );

        setPublicUsers(cleaned);
      } catch (err) {
        console.error("Error loading public users:", err);
      }
    }

    loadUsers();
  }, [currentUserProfile]);

  const filtered = publicUsers.filter((u) =>
    (u.displayName || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 p-4">

      {/* Search Bar */}
      <TextInput
        placeholder="Search users by name..."
        placeholderTextColor="gray"
        value={search}
        onChangeText={setSearch}
        className="bg-white p-3 rounded-xl mb-4 text-base"
      />

      {/* Results */}
      <ScrollView className="flex-1">
        {filtered.map((user) => (
          <Link
            key={user.uid}
            className="bg-lime-200 border border-lime-600 p-4 rounded-lg mb-3"
            href={{ pathname:"/components/UserProfilePage", params: {id: user.uid}}}  

          >
        <View>
            <Text className="text-xl font-bold text-lime-800">
              {user.displayName || "Unnamed User"}
            </Text>
            
            {user.favoriteCuisine ? (
              <Text className="text-gray-700">
                Loves {user.favoriteCuisine}
              </Text>
            ) : null}
            </View>
          </Link>
        ))}

        {filtered.length === 0 && (
          <Text className="text-center text-gray-600 mt-10">
            No users found
          </Text>
        )}
      </ScrollView>

    </View>
  );
}