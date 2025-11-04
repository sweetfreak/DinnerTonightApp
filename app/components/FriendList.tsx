import {Text, View, TouchableOpacity} from 'react-native'
import {Link} from 'expo-router'
import type UserProfile  from '../../types/User'


type FriendListProps = {
  friends: UserProfile[];
};

export default function FriendList({friends}: FriendListProps) {

    return (
        <View>
    {friends?.length > 0 ? 
            <View className=''>
            
                {friends.map((friend, index) => {
                    return <View key={index} className="flex-row m-2 items-center"> 
                            <Text>{friend.displayName} </Text>
                            <Link 
                                href={{ pathname:"/components/UserProfilePage", params: {id: friend.uid}}}  
                                className=" p-2 rounded-full bg-blue-500">
                                <Text className='text-white'>{friend.displayName}'s Profile</Text>
                            </Link>                   
                    </View>
                })}
            </View>

        :
        <Text>
            Time to add some friends!
        </Text>

    }
    </View>
)
}