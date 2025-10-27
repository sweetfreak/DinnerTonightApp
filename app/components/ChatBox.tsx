import {useAuth} from "../../contexts/authContext/index"
import {useState, useEffect, useRef} from 'react'
import { doc, getDoc, getDocs, addDoc, updateDoc, collection, query, where, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import type UserProfile from '../../types/User'
import type Recipe from '../../types/Recipe'
import Chat, {Message} from '../../types/Chat'
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {Text, Dimensions, View, ScrollView, Keyboard, KeyboardAvoidingView, Button, TextInput, TouchableOpacity, Platform} from 'react-native'
import { Link } from 'expo-router'
import { useUserProfile } from "../../contexts/UserProfileContext";

interface ChatProps {
    // id: string;
    // participants: string[];
    // updatedAt: Date
    // lastMessageID: string;

    chat: Chat | null
    

}


export default function ChatBox({ chat } : ChatProps) {

 const { currentUserProfile } = useUserProfile();
const [newMessage, setNewMessage] = useState("")
const [messages, setMessages] = useState<Message[]>([])
const scrollViewRef = useRef<ScrollView>(null);


const friendName = chat!.participantProfiles?.find(p => p.uid !== currentUserProfile?.uid)?.displayName;

const screenHeight = Dimensions.get('window').height;
const inputAreaHeight = 100; // adjust based on styling
const scrollHeight = screenHeight - inputAreaHeight;

const updateMessage = (value: string) => {
  setNewMessage(value);
};

 // 🟩 SCROLL TO BOTTOM FUNCTION
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // 🟩 SCROLL WHEN MESSAGES CHANGE
  useEffect(() => {
    scrollToBottom();
  }, [messages]);



useEffect(() => {
  if (!chat) return;

  const messagesRef = collection(db, "chats", chat.id, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chatMessages: Message[] = snapshot.docs.map((thisDoc) => ({
      id: thisDoc.id,
      ...(thisDoc.data() as Omit<Message, "id">),
    }));
    setMessages(chatMessages);
  });

  const chatRef = doc(db, "chats", chat.id);
  const unsubscribeChat = onSnapshot(chatRef, (chatSnap) => {
    if (chatSnap.exists()) {
      const updatedChat = chatSnap.data();
      // Optionally, trigger a UI update or state update here if needed
      // e.g. setChat({ ...chat, lastMessageID: updatedChat.lastMessageID });
    }
  });

  // 🟩 update cleanup return
  return () => {
    unsubscribe();
    unsubscribeChat();
  };
}, [chat!.id]);


  // 🟩 CHANGED SECTION in handleSubmit()
  async function handleSubmit() {
    if (!newMessage.trim() || !currentUserProfile) return;

    try {
      const messagesRef = collection(db, "chats", chat!.id, "messages");
      const chatRef = doc(db, "chats", chat!.id);

      const newMessageRef = await addDoc(messagesRef, {
        text: newMessage,
        senderId: currentUserProfile.uid,
        createdAt: serverTimestamp(),
      });

      // 🟩 NEW: update parent chat document
      
      await updateDoc(chatRef, {
        latestMessageID: newMessageRef.id,
        latestMessageSenderID: currentUserProfile.uid,
        updatedAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  }

  return (
    <View className='flex-1'

    >
      <ScrollView
        className="border-4 rounded-xl p-2 bg-lime-800"
        contentContainerStyle={{ paddingBottom: 10 }}
        ref={scrollViewRef}
        style={{ maxHeight: scrollHeight }}
      >
        
          {messages.map((msg) => (
            <View
            key={msg.id}
            >
            <Text
              
              className={`p-2 rounded mb-2 ${
                msg.senderId === currentUserProfile?.uid
                  ? "bg-blue-200 self-end"
                  : "bg-gray-200 self-start"
              }`}
            >
              <Text className="font-bold"> 
                {msg.senderId == currentUserProfile?.uid ? currentUserProfile.displayName : friendName }:  
              </Text> 
            {msg.text}
            </Text>
            </View>
          ))}
        
      </ScrollView>
        
        {/* Input value */}
        <View className="flex-row m-2">
          <TextInput
            value={newMessage}
            onChangeText={(e) => setNewMessage(e)}
            placeholder="Write here..."
            className="flex-grow border-2 rounded-xl p-4 self-start text-black"
            //onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />
          <TouchableOpacity  className=" ml-2 bg-blue-500 items-center p-4 rounded-xl"
            onPress={handleSubmit}>
            <Text className="text-white">Send</Text>
          </TouchableOpacity>
        </View>
      
    </View>
  );

}