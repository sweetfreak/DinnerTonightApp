import {Text, View, Button, KeyboardAvoidingView, Platform, TouchableOpacity, Pressable} from 'react-native'
import {useEffect, useState} from 'react'
import { doc, getDoc, getDocs, addDoc, collection, orderBy, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

import type Recipe from "../../types/Recipe";
import type UserProfile  from '../../types/User'
import type Chat from '../../types/Chat'
// import { SafeAreaView } from 'react-native-safe-area-context';

import ChatBox from './ChatBox'
import ChatCard from './ChatCard'
import RecipeCard from "./RecipeCard";
import SharedRecipesModal from "./SharedRecipesModal";

    type ChatsPageProps = {
      friends: UserProfile[];
      currentUserProfile: UserProfile | null
      selectedFriendId: string | null
      clearSelectedFriend: () => void;

    };

export default function ChatsPage({currentUserProfile, friends, selectedFriendId, clearSelectedFriend} : ChatsPageProps) {
    const [allChats, setAllChats] = useState<Chat[]>([])
    const [activeChat, setActiveChat] = useState<Chat | null>(null)
    const [showChat, setShowChat] = useState(false)

    const [showSharedRecipes, setShowSharedRecipes] = useState(false)
    const [sharedRecipes, setSharedRecipes] = useState<Recipe[]>([])
    


    useEffect(() => {
  if (!currentUserProfile) return

  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", currentUserProfile.uid),
    orderBy("updatedAt", "desc")
  );

  // Listen for real-time chat updates
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const fetchedChats: Chat[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();

        // Load participant display names
        const participantProfiles = await Promise.all(
          data.participants.map(async (uid: string) => {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            return userSnap.exists()
              ? { uid, displayName: userSnap.data().displayName }
              : { uid, displayName: "UnknownUser" };
          })
        );

        return {
          id: docSnap.id,
          participants: data.participants,
          participantProfiles,
          sharedRecipes: data.sharedRecipes,
          latestMessageText: data.latestMessageText || "",
          latestMessageSenderID: data.latestMessageSenderID || "",
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          messages: [],
        } as Chat;
      })
    );

    setAllChats(fetchedChats);
  });

  return () => unsubscribe();
}, [currentUserProfile]);

 useEffect(() => {
    if (!selectedFriendId || !currentUserProfile) return
    handleStartChat(selectedFriendId)
    },[selectedFriendId])

useEffect(() => {
  if (!showSharedRecipes|| !currentUserProfile) return;

  async function fetchSharedRecipes() {
    try {
      const chatIds = allChats.map(c => c.id);
      let allRecipeMessages: Recipe[] = [];

      for (const chatId of chatIds) {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, where("type", "==", "recipe"));
        const snapshot = await getDocs(q);

        const recipes = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: data.recipeId,
            dishName: data.recipeTitle,
            imageURL: data.recipePhotoURL,
            description: data.recipeDescription || "",
          } as Recipe;
        });

        allRecipeMessages = [...allRecipeMessages, ...recipes];
      }

      setSharedRecipes(allRecipeMessages);
    } catch (err) {
      console.error("Error fetching shared recipes:", err);
      setSharedRecipes([]);
    }
  }

  fetchSharedRecipes();
}, [showSharedRecipes]);

    async function getOrCreateChat(currentUid: string, friendUid: string) {
        const chatsRef = collection(db, "chats")
        
        const q = query(chatsRef, where("participants", "array-contains", currentUid))
        const snapshot = await getDocs(q)

        const existingChat = snapshot.docs.find(myDoc => 
            myDoc.data().participants.includes(friendUid)
        )

        let chatDoc

        if (existingChat) {
            chatDoc = existingChat
        } else {

        const newChatRef = await addDoc(chatsRef, {
            participants: [currentUid, friendUid],
            latestMessage: "",
            updatedAt: serverTimestamp()
        })
        chatDoc = await getDoc(newChatRef)
        }
        
        const participantProfiles = await Promise.all(
            chatDoc.data()!.participants.map(async (uid: string) => {
                const userRef = doc(db,'users', uid)
                const userSnap = await getDoc(userRef)
                return userSnap.exists() 
                    ? {uid, displayName: userSnap.data().displayName }
                    : {uid, displayName: "UnknownUser" }
            })
        )

        return {
            id: chatDoc.id,
            participants: chatDoc.data()!.participants,
            participantProfiles,
            sharedRecipes: chatDoc.data()!.sharedRecipes,
            latestMessageText: chatDoc.data()!.latestMessageText || "",
            latestMessageSenderID: chatDoc.data()!.latestMessageSenderID || "",
            updatedAt: chatDoc.data()!.updatedAt?.toDate?.() || new Date(),
            messages: []
        } as Chat;
    }

 async function handleStartChat(friendId: string) {
        if (!currentUserProfile) return

        const newChat = await getOrCreateChat(currentUserProfile.uid, friendId)
        setActiveChat(newChat)
        setShowChat(true)

    }

        console.log("TEST")


    return (
        // <SafeAreaView className="flex-1 bg-lime-100 ">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                keyboardVerticalOffset={80}
                className=" flex-1  mb-20"> 
                <View className=" flex-1  ">
                {showChat ? 
                    <View className="flex-1 w-full">
                        <View className='flex-row gap-8 self-center'>
                            <TouchableOpacity 
                                onPress={() => {
                                  setShowChat(false)
                                 clearSelectedFriend()
                                }
                                }
                                className="bg-lime-800 self-center rounded-full p-3 mb-2"
                                > 
                                <Text className="text-white">Back to Chat List</Text>

                                </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={() => setShowSharedRecipes(true)}
                                className="bg-lime-800 self-center rounded-full p-3 mb-2"
                                > 
                                <Text className="text-white">View Recipes</Text>

                            </TouchableOpacity>

                          

                             <SharedRecipesModal
                                visible={showSharedRecipes}
                                onClose={() => setShowSharedRecipes(false)}
                                sharedRecipeIds={activeChat?.sharedRecipes || []}
                            />


                        </View>
                    <ChatBox 
                        chat = {activeChat}                    
                    />
                        
                    </View>
                : 
            
                <View className='flex flex-col rounded-xl gap-2 bg-lime-800 p-4 min-w-[90%] min-h-[90%]'>
                    <Text className="text-2xl text-white font-bold">Chat List</Text>
                    {friends.map((friend) => {
                        const friendChat = allChats.find(c => c.participants.includes(friend.uid));

                        return (
                            <ChatCard
                                key={friend.uid}
                                friendID={friend.uid}
                                friendDisplay={friend.displayName!}
                                latestMessageText={friendChat?.latestMessageText || "No messages yet"}
                                latestMessageSenderID={friendChat?.latestMessageSenderID || ""}
                                handleStartChat={handleStartChat}
                            />
                        );
                    })}
                </View>
            }
            </View>
           </KeyboardAvoidingView>
        //          </SafeAreaView>
    )
}