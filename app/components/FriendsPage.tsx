
import type UserProfile  from '../../types/User'
import {useEffect, useState} from 'react'

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import FriendList from './FriendList'
import ChatsPage from './ChatsPage';
// import { SafeAreaView } from 'react-native-safe-area-context';

import {Text, View, ScrollView, KeyboardAvoidingView, Button, Platform, TouchableOpacity, Pressable} from 'react-native'
import { useUserProfile } from "../../contexts/UserProfileContext";

import  useActiveSection  from "../../contexts/ActiveSectionContext";
import FriendSearch from './FriendSearch';



export default function FriendsPage() {
    const { currentUserProfile } = useUserProfile();
    const [showFriends, setShowFriends] = useState(false)
    const {activeSection, setActiveSection} = useActiveSection()
    const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([])


    const [friends, setFriends] = useState<(UserProfile[])>([])
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)

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

    useEffect(() => {
        async function loadPendingRequests() {
            if (!currentUserProfile) return

            const ids = [
            ...(currentUserProfile.friendRequestsSent || []),
            ...(currentUserProfile.friendRequestsReceived || [])
            ];            
            if (ids.length === 0) {
                setPendingRequests([])
                return
            }

            const profiles = await Promise.all(
                ids.map(async (id) => {
                    const ref = doc(db, 'users', id)
                    const snap = await getDoc(ref)
                    return snap.exists() ? ({uid: snap.id, ...snap.data()} as UserProfile)
                    : null
                })
            )
            setPendingRequests(profiles.filter(Boolean) as UserProfile[])
        }
        loadPendingRequests()
    }, [currentUserProfile])

    function openFriendChat(friendId: string) {
        setSelectedFriendId(friendId)
        setActiveSection("chats" as any)
    }

    return (
        // <SafeAreaView edges={['bottom']} className="flex-1 bg-lime-100 ">
        <View className="flex-1 bg-lime-100 ">
           <KeyboardAvoidingView
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        keyboardVerticalOffset={60}
                        className=" flex-1 items-center ">

                <Text className='text-3xl text-lime-800 font-bold m-4'>Friends</Text>

                <View className='flex-1'>

                    <View className='flex-row justify-center gap-4 mb-2'>
                        {['search', 'friend list', 'chats', ].map((type) => (
                            <Pressable
                                key={type}
                                onPress={() => {
                                    setSelectedFriendId(null)
                                    setActiveSection(type as any)
                                    } 
                                }
                                className={`px-4 py-2 rounded-full ${
                                    activeSection === type ? "bg-green-600" : "bg-green-300"}`}>
                                <Text className='text-white capitalize'>{type}</Text>
                            </Pressable>
                        ))}

                    </View>

                    <View className="flex-1">
                        {activeSection === "friend list"  && <FriendList 
                            friends={friends}
                            pendingRequests={pendingRequests}
                            openFriendChat={openFriendChat}
                            /> }
                        {activeSection === "search"  && <FriendSearch />}
                        {activeSection === "chats"  && <ChatsPage 
                            currentUserProfile= {currentUserProfile}
                            friends={friends}
                            selectedFriendId={selectedFriendId}
                            clearSelectedFriend={() => setSelectedFriendId(null)}
                        /> }

                    </View>

                    
                    
                </View>
              
         </KeyboardAvoidingView>
         </View>
        // </SafeAreaView>
    )


}