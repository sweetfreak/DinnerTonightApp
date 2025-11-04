//import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react'
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import {collection, query, where, getDocs} from 'firebase/firestore'
import {db} from "../../firebase/firebaseConfig"
import {useRouter} from 'expo-router'

export default function CreateAccount() {

    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const router = useRouter()

    async function handleSubmit() {
        
   
        if (!isRegistering) {
            setIsRegistering(true)
            setErrorMessage('')
            
            try {

                const usersRef = collection(db, 'users')
                const nameQuery = query(usersRef, where("displayName", "==", displayName))
                const querySnapshot = await getDocs(nameQuery)

                if (!displayName.trim()) {
                    setErrorMessage('Please enter a display name')
                    setIsRegistering(false);
                    return
                }

                if (!email.trim()) {
                    setErrorMessage("Please enter email and password")
                    setIsRegistering(false);
                    return
                }

                if (!querySnapshot.empty) {
                    setErrorMessage("That display name is already taken. Please choose another.")
                    setIsRegistering(false);
                    return
                }

                await doCreateUserWithEmailAndPassword(email, password, displayName)
                router.replace("./(tabs)");
            } catch (error: any) {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        setErrorMessage("An account already exists with that email.");
                        break;
                    case "auth/weak-password":
                        setErrorMessage("Password should be at least 6 characters.");
                        break;
                    case "auth/invalid-email":
                        setErrorMessage("Invalid email format.");
                        break;
                    default:
                        setErrorMessage("Failed to create account. Please try again.");
                }
                console.error("create account failed:", error)
            } finally {
                setIsRegistering(false)
            }
        }

    }

    return (
        <View className="flex-col p-5 border-2">
            <Text className="text-xl font-bold mb-4">Sign Up</Text>
            
            <View className="mb-4">
                <Text className="mb-2">Name:</Text>
                <TextInput 
                    className="border border-gray-300 bg-white rounded p-3"
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="ChefName"
                />
            </View>

            <View className="mb-4">
                <Text className="mb-2">Email:</Text>
                <TextInput 
                    className="border border-gray-300 bg-white rounded p-3"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="chef@dinnertonight.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-4">
                <Text className="mb-2">Password:</Text>
                <TextInput 
                    className="border border-gray-300 bg-white rounded p-3"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="****"
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={isRegistering}
                className={`p-3 rounded ${isRegistering ? "bg-gray-400" : "bg-blue-500"}`}
            >
                <Text className="text-white text-center font-semibold">
                    {isRegistering ? "Creating Account..." : "Create Account"}
                </Text>
            </TouchableOpacity>

            {errorMessage && (
                <Text className="text-red-500 mt-2 text-sm">{errorMessage}</Text>
            )}
        </View>
    )
}