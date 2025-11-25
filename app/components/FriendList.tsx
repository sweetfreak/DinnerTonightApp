import {Text, View, TouchableOpacity, ScrollView} from 'react-native'
import {Link} from 'expo-router'
import type UserProfile  from '../../types/User'


import  useActiveSection  from "../../contexts/ActiveSectionContext";


type FriendListProps = {
  friends: UserProfile[];
  openFriendChat: (friendId: string) => void
    pendingRequests: UserProfile[];

};

export default function FriendList({friends, openFriendChat, pendingRequests}: FriendListProps) {

    const {activeSection, setActiveSection} = useActiveSection()


    return (
        <View>
            {pendingRequests.length > 0 && (
        <View className="mb-6">
          <Text className="text-xl font-bold text-lime-800 mb-2">
            Pending Friend Requests
          </Text>

          {pendingRequests.map((user, i) => (
            <View key={i} className="border-t border-gray-400 py-2">
              <Link
                href={{ pathname: "/components/UserProfilePage", params: { id: user.uid } }}
                className="p-2 rounded-full bg-lime-800 mb-2"
              >
                <Text className="text-lime-400">{user.displayName}'s Profile</Text>
              </Link>
            </View>
          ))}
        </View>
      )}
    {friends?.length > 0 ? 
            <ScrollView className=''>
            <Text className="text-xl font-bold text-lime-800 mb-2">
                Friends
            </Text>
                {friends.map((friend, index) => {
                    return <View key={index} className="border-t border-gray-400 flex-col items-center"> 
                                {/* <Text>{friend.displayName} </Text> */}

                                <Text className="self-center pt-4 font-bold text-xl">{friend.displayName}</Text>
                                <View className="flex-row gap-4">
                                    <Link 
                                        href={{ pathname:"/components/UserProfilePage", params: {id: friend.uid}}}  
                                        className=" my-4 p-2 rounded-full bg-lime-800">
                                        <Text className='text-lime-400'>Open Profile</Text>
                                    </Link>   
                                    <TouchableOpacity
                                        className="my-4 p-2 rounded-full bg-lime-500"
                                        onPress={() => openFriendChat(friend.uid)}
                                        >
                                        <Text className="text-lime-800">Open Chat</Text>
                                    </TouchableOpacity>   
                                </View>
                                            
                            </View>
                })}
            </ScrollView>

        :
        <Text>
            Time to add some friends!
        </Text>

    }
    </View>
)
}