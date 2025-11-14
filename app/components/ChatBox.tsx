import {useAuth} from "../../contexts/authContext/index"
import {useState, useEffect, useRef} from 'react'
import { doc, getDoc, getDocs, addDoc, documentId, updateDoc, arrayUnion, collection, query, where, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import type UserProfile from '../../types/User'
import type Recipe from '../../types/Recipe'
import Chat, {Message} from '../../types/Chat'
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {Text, Dimensions, Image, View, ScrollView, Keyboard, KeyboardAvoidingView, Button, TextInput, TouchableOpacity, Platform} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useUserProfile } from "../../contexts/UserProfileContext";

interface ChatProps {

    chat: Chat | null
    

}


export default function ChatBox({ chat } : ChatProps) {
 const { currentUserProfile } = useUserProfile();
const [newMessage, setNewMessage] = useState("")
const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter()

const scrollViewRef = useRef<ScrollView>(null);


const [showRecipes, setShowRecipes] = useState(false);
const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

const filteredRecipes = savedRecipes.filter((r) =>
  r.dishName.toLowerCase().includes(searchQuery.toLowerCase())
);

const friendName = chat!.participantProfiles?.find(p => p.uid !== currentUserProfile?.uid)?.displayName;

const screenHeight = Dimensions.get('window').height;
const inputAreaHeight = 100; // adjust based on styling
const scrollHeight = screenHeight - inputAreaHeight;


    function handlePress(recipeId: string)  {
        // navigate to full recipe
        router.push({ pathname: "../components/FullRecipe", params: { recipeId: recipeId } });
    };

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

async function handleSendRecipe(recipe: Recipe) {
  if (!chat || !currentUserProfile) return;

  try {
    const messagesRef = collection(db, "chats", chat.id, "messages");
    const chatRef = doc(db, "chats", chat.id);

    const newMessageRef = await addDoc(messagesRef, {
      type: "recipe",
      recipeId: recipe.id,
      recipeTitle: recipe.dishName,
      //add recipe description??
      recipePhotoURL: recipe.imageURL,
      senderId: currentUserProfile.uid,
      createdAt: serverTimestamp(),
    });

      const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) return;
      const chatData = chatSnap.data();
      const shared = chatData.sharedRecipes || [];

      //make an object called updates
      const updates: any = {
        latestMessageID: newMessageRef.id,
        latestMessageText: "📝 Sent recipe for " + recipe.dishName,
        latestMessageSenderID: currentUserProfile.uid,
        updatedAt: serverTimestamp(),
      };

      // if the recipeId is not in sharedRecipes, add it to the updates object
      if (recipe.id && !(chatData.sharedRecipes || []).includes(recipe.id)) {
        updates.sharedRecipes = arrayUnion(recipe.id);
      }
      // update the chat document with the updates
    await updateDoc(chatRef, updates);

    setShowRecipes(false);
  } catch (err) {
    console.error("Error sending recipe:", err);
  }
}

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
  if (!showRecipes || !currentUserProfile?.savedRecipes?.length) return;

  async function fetchSavedRecipes() {
    try {
      const q = query(
        collection(db, "recipes"),
        where(documentId(), "in", currentUserProfile?.savedRecipes)
      );
      const snapshot = await getDocs(q);

      const fetched = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Recipe),
        id: docSnap.id,
      }));

      setSavedRecipes(fetched);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
      setSavedRecipes([]);
    }
  }

  fetchSavedRecipes();
}, [showRecipes, currentUserProfile?.savedRecipes]);

  return (
    <View className='flex-1 '>
      <ScrollView
        className="border-4 rounded-xl p-2 bg-lime-800 flex-1 mb-2 min-w-[90%] "
        contentContainerStyle={{ paddingBottom: 10 }}
        ref={scrollViewRef}
        // style={{ maxHeight: scrollHeight }}
      >
        
          {messages.map((msg) => (
  <View key={msg.id}>
    {msg.type === "recipe" ? (
      <TouchableOpacity
        className={`p-3 m-1 rounded-xl ${
          msg.senderId === currentUserProfile?.uid ? "bg-blue-200 self-end" : "bg-green-200 self-start"
        }`}
        onPress={() => handlePress(msg.recipeId)}

      >
        <Image source={{uri: msg.recipePhotoURL}} 
          className="w-48 h-24 rounded-lg"
          //resizeMode="cover" 
                  />
        <Text className="font-bold">{msg.recipeTitle}</Text>
        
        <Text className="text-xs text-gray-600">(Tap to view)</Text>
      </TouchableOpacity>
    ) : (
      <Text
        className={`p-2 rounded mb-2 ${
          msg.senderId === currentUserProfile?.uid ? "bg-blue-200 self-end" : "bg-gray-200 self-start"
        }`}
      >
        <Text className="font-bold">
          {msg.senderId == currentUserProfile?.uid
            ? currentUserProfile.displayName
            : friendName}
          :
        </Text>{" "}
        {msg.text}
      </Text>
    )}
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

        {showRecipes && (
          <ScrollView className="max-h-60 bg-white rounded-lg mt-2 p-2">
            <TextInput
        placeholder="Search recipes..."
        placeholderTextColor='gray'
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="bg-white rounded-xl p-3 mb-4 text-lg "
      />
            {filteredRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                className="border-b border-gray-200 p-2"
                onPress={() => handleSendRecipe(recipe)}
              >
                <Text className="font-bold">{recipe.dishName}</Text>
                <Text numberOfLines={1}>{recipe.description}</Text>
              </TouchableOpacity>
            ))}
                  
          </ScrollView>
        )}

        </View>
      
    
  )

}