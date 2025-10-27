import {useEffect, useState} from 'react'
import ChatBox from './ChatBox'

import type UserProfile  from '../../types/User'
import type Chat from '../../types/Chat'

import { doc, getDoc, getDocs, addDoc, collection, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import ChatCard from './ChatCard'
import { SafeAreaView } from 'react-native-safe-area-context';

import {Text, View, ScrollView, KeyboardAvoidingView, Button, Platform, TouchableOpacity} from 'react-native'
import { Link,  } from 'expo-router'
import { useUserProfile } from "../../contexts/UserProfileContext";


// interface ChatPageProps {
//     // currentUserProfile: UserProfile | null
// }

export default function ChatPage() {
 const { currentUserProfile } = useUserProfile();

const [showFriends, setShowFriends] = useState(false)
const [showChat, setShowChat] = useState(false)

const [allChats, setAllChats] = useState<Chat[]>([])

const [activeChat, setActiveChat] = useState<Chat | null>(null)

const [friends, setFriends] = useState<(UserProfile[])>([])

    useEffect(() => {
        setShowFriends(true)
    }, [friends])

    useEffect(() => {
        if (!currentUserProfile || !currentUserProfile) return

        async function getFriends() {
            const friendIDs = currentUserProfile?.friends || [];
            if (friendIDs.length === 0) {
                setFriends([])
                return;
            }
        
            try {
                const batches: UserProfile[][] = []
                for (let i = 0; i < friendIDs.length; i += 10) {
                    const batchIDs = friendIDs.slice(i, i + 10);
                    const batchDocs = await Promise.all(
                        batchIDs.map(async (id) => {
                            const docRef = doc(db, 'users', id)
                            const docSnap = await getDoc(docRef)
                            if (!docSnap.exists()) return null
                            return { uid: docSnap.id, ...docSnap.data() } as UserProfile
                        })
                    )
                    batches.push(batchDocs.filter(Boolean) as UserProfile[]);

                }

                const allFriends = batches.flat()
                setFriends(allFriends)

            } catch (error) {
                console.error("error fetching friends:", error)
            }
        
        }
        getFriends()
    }, [currentUserProfile])

    // 🟩 ADDED
    useEffect(() => {
    if (!currentUserProfile) return;

    async function fetchChats() {
        try {
        const q = query(collection(db, "chats"), where("participants", "array-contains", currentUserProfile?.uid));
        const snapshot = await getDocs(q);

        const fetchedChats: Chat[] = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            // Get participant display names
            const participantProfiles = await Promise.all(
            data.participants.map(async (uid: string) => {
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);
                return userSnap.exists()
                ? { uid, displayName: userSnap.data().displayName }
                : { uid, displayName: "UnknownUser" };
            })
            );

            // Fetch last message (if it exists)
            let latestMessageText = "";
            if (data.lastMessageID) {
            const messageRef = doc(db, "chats", docSnap.id, "messages", data.lastMessageID);
            const messageSnap = await getDoc(messageRef);
            if (messageSnap.exists()) {
                latestMessageText = messageSnap.data().text || "";
            }
            }

            return {
            id: docSnap.id,
            participants: data.participants,
            participantProfiles,
            latestMessageText,
            latestMessageSenderID: data.latestMessageSenderID || "",
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            messages: [],
            
            } as Chat & { latestMessageText?: string };
        }));

        setAllChats(fetchedChats);
        } catch (error) {
        console.error("Error fetching chats:", error);
        }
    }

    fetchChats();
    }, [currentUserProfile]);

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
            lastMessage: "",
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

    

    return (
        <SafeAreaView className="flex-1 bg-lime-100 ">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                keyboardVerticalOffset={80}
                className=" flex-1 items-center "> 
                <Text className='text-3xl text-lime-800 font-bold'>Friend List:</Text>
                <View className='flex'>
                    
                    {friends?.length > 0 && showFriends ? 
                        <View className=''>
                        
                            {friends.map((friend, index) => {
                                return <View key={index} className="flex-row items-center"> 
                                        <Text>{friend.displayName} </Text>
                                        <TouchableOpacity 
                                            onPress={() => handleStartChat(friend.uid)}
                                            className=" m-2 rounded-full bg-blue-500">
                                            <Text className='text-white'>Start Chat</Text>
                                        </TouchableOpacity>                   
                                </View>
                            })}
                        </View>

                    :
                    <Text>
                        Time to add some friends!
                    </Text>

                    

                }
                </View>
                {showChat ? <View className="flex-1 w-full">
                    <ChatBox 
                    chat = {activeChat}                    
                    />
                    <Button 
                    onPress={() => setShowChat(false)} 
                    title="Close Chat"
                    
                    /> 
                        
           
                    
                    </View>
                : 
                
                    <View className='flex flex-col rounded-xl gap-2 bg-lime-800 p-4 w-11/12'>
                        <Text className="text-2xl text-white font-bold">Chat List</Text>
                        {friends.map((friend) => {
                            const friendChat = allChats.find(c => c.participants.includes(friend.uid));

                            return (
                                <ChatCard
                                key={friend.uid}
                                friendID={friend.uid}
                                friendDisplay={friend.displayName!}
                                latestMessage={friendChat?.latestMessageText || "No messages yet"}
                                latestMessageSenderID={friendChat?.latestMessageSenderID || ""}
                                handleStartChat={handleStartChat}
                                />
                            );
                        })}
                    </View>
                }
            </KeyboardAvoidingView>
        </SafeAreaView>
    )


}