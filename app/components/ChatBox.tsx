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


const [showRecipes, setShowRecipes] = useState(false);
const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);


const friendName = chat!.participantProfiles?.find(p => p.uid !== currentUserProfile?.uid)?.displayName;

const screenHeight = Dimensions.get('window').height;
const inputAreaHeight = 100; // adjust based on styling
const scrollHeight = screenHeight - inputAreaHeight;


 // scroll to bottom
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // scroll to bottom whenever a new message is sent (regardless of user?)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);



useEffect(() => {
  if (!chat) return;

  //get messages from chat
  const messagesRef = collection(db, "chats", chat.id, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  // create snapshot for instant messaging
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chatMessages: Message[] = snapshot.docs.map((thisDoc) => ({
      id: thisDoc.id,
      ...(thisDoc.data() as Omit<Message, "id">),
    }));
    setMessages(chatMessages);
  });

  //create chat ref
  const chatRef = doc(db, "chats", chat.id);
  const unsubscribeChat = onSnapshot(chatRef, (chatSnap) => {

      //unused??
    if (chatSnap.exists()) {
      const updatedChat = chatSnap.data();
   
    }
  });

  // update cleanup return
  return () => {
    unsubscribe();
    unsubscribeChat();
  };
}, [chat!.id]);


  // submit message and update chat
  async function handleSubmit() {
    //prevent empty messages and no user
    if (!newMessage.trim() || !currentUserProfile) return;

    try {
      const messagesRef = collection(db, "chats", chat!.id, "messages");
      const chatRef = doc(db, "chats", chat!.id);

      const newMessageRef = await addDoc(messagesRef, {
        text: newMessage,
        senderId: currentUserProfile.uid,
        createdAt: serverTimestamp(),
      });

      // update chat file
      
      await updateDoc(chatRef, {
        latestMessageID: newMessageRef.id,
        latestMessageText: newMessage,
        latestMessageSenderID: currentUserProfile.uid,
        updatedAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  }


useEffect(() => {
  if (!showRecipes || !currentUserProfile?.uid) return;

  async function fetchRecipes() {
    try {
      const q = query(
        collection(db, "recipes"),
        where("createdBy", "==", currentUserProfile?.uid) // or "authorId"
      );
      const snapshot = await getDocs(q);

      const fetched = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Recipe;
        return {
          ...data,       // spread first
          id: docSnap.id // then add id last so it’s not overwritten
        };
      });

      setSavedRecipes(fetched);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setSavedRecipes([]);
    }
  }

  fetchRecipes();
}, [showRecipes, currentUserProfile?.uid]);

  return (
    <View className='flex-1 '>
      <ScrollView
        className="border-4 rounded-xl p-2 bg-lime-800 flex-1 mb-2 min-w-[90%] "
        contentContainerStyle={{ paddingBottom: 10 }}
        ref={scrollViewRef}
        // style={{ maxHeight: scrollHeight }}
      >
        
          {messages.map((msg) => (
            <View
            key={msg.id}
            >
            <Text
              
              className={`p-2 rounded mb-2  ${
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
        <View className="flex-row items-center gap-2 mt-2">
        <TouchableOpacity 
            className="bg-lime-800 w-10 h-10 rounded-full items-center justify-center"
            onPress={() => setShowRecipes(!showRecipes)}
        >
            <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>

          <TextInput
            value={newMessage}
            onChangeText={(e) => setNewMessage(e)}
            placeholder="Write here..."
            className="flex-1 border-2 bg-white rounded-xl p-4 self-start text-black"
            //onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />
          <TouchableOpacity  className=" ml-2 bg-blue-500 items-center px-4 py-3 rounded-xl"
            onPress={handleSubmit}>
            <Text className="text-white">Send</Text>
          </TouchableOpacity>
        </View>
        </View>
      
    
  )

}