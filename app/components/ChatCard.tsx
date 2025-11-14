
import {View, Text, Button, TouchableOpacity} from 'react-native'


interface ChatCardProps {
    friendID: string
    friendDisplay: string
    latestMessageText: string
    latestMessageSenderID: string
    handleStartChat: (id: string) => void
}

export default function ChatCard({friendID, friendDisplay, latestMessageText, latestMessageSenderID, handleStartChat} : ChatCardProps) {


    return (
        <View className="m-1">
            <TouchableOpacity 
              onPress={() => handleStartChat(friendID)} 
            className="flex-col p-2 h-20 border-4 border-stone-800 bg-gray-400 rounded-3xl">
                <Text className="font-bold">{friendDisplay}:</Text>
                <Text className={`${latestMessageSenderID != friendID ? 'italic' : 'font-bold'}`} numberOfLines={1}>{latestMessageSenderID === friendID ? "🔵" : ""}{latestMessageText}</Text>
            </TouchableOpacity>
          </View>
          

    )
}