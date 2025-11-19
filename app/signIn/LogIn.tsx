//import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react'
import {doSignInWithEmailAndPassword, doPasswordReset} from '../../firebase/auth'
//import {getAuth} from "firebase/auth"
// import { useAuth } from '../../contexts/authContext/index'
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native'

export default function LogIn() {
   //  const auth = getAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [forgotPassword, setForgotPassword] = useState(false)
    const [successfulPasswordEmailSent, setSuccessfulPasswordEmailSent] = useState(false)


    //formEvent might not be the right type?
    async function handleSubmit() {
        
        setErrorMessage("")

        if (!isSigningIn) {
            setIsSigningIn(true)
            try {
                await doSignInWithEmailAndPassword(email, password)
            } catch (error: any) {
                switch (error.code) {
                    case "auth/invalid-email":
                    setErrorMessage("Please enter a valid email address.");
                    break;
                    case "auth/user-disabled":
                    setErrorMessage("This account has been disabled.");
                    break;
                    case "auth/user-not-found":
                    setErrorMessage("No account found with that email.");
                    break;
                    case "auth/wrong-password":
                    setErrorMessage("Incorrect password. Try again.");
                    break;
                    case "auth/missing-password":
                    setErrorMessage("Please enter your password.");
                    break;
                    default:
                    setErrorMessage("An unexpected error occurred. Please try again.");
                }
                console.error("Login failed:", error);
            } finally {
                setIsSigningIn(false);
            }
        }
    }

    async function handleResetPassword() {
        try {
            await doPasswordReset(email)
            setSuccessfulPasswordEmailSent(true)
        }
        catch(error: any) {
            switch (error.code) {
                case "auth/user-disabled":
                setErrorMessage("This account has been disabled.");
                break;
                case "auth/user-not-found":
                setErrorMessage("No account found with that email.");
                break;
                case "auth/invalid-email":
                setErrorMessage("Please enter a valid email address.");
                break;
                default:
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
            console.error("Login failed:", error);
        } finally {
            // setSuccessfulPasswordEmailSent(true)
        }
    }

    return (
        <View className="flex-col p-5 border-2">
            
            <Text className="text-xl font-bold mb-4">Log In</Text>
            
            <View className="mb-4">
                <Text className="mb-2">Email:</Text>
                <TextInput 
                    className="border border-gray-300 bg-white rounded p-3"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="chef@cook.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            {!forgotPassword &&
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
            }
            <View className="mt-5 mb-5">
                <Button  title={forgotPassword ? "Back" : "Forgot Password?" } 
                onPress={
                    () => {
                    setForgotPassword(prev => !prev)
                    setErrorMessage("")
                    setSuccessfulPasswordEmailSent(false)
                    }
                } />
            </View>

            <TouchableOpacity
                onPress={forgotPassword ? handleResetPassword  : handleSubmit}
                disabled={isSigningIn || (forgotPassword && successfulPasswordEmailSent)}
                className={`p-3 rounded ${isSigningIn ? "bg-gray-400" : "bg-blue-500"}`}
            >
                <Text className="text-white text-center font-semibold">
                    {forgotPassword ? "Send Reset Password Email" : "Sign In"}
                </Text>
            </TouchableOpacity>

            {successfulPasswordEmailSent &&
                <Text className="text-green-600 mt-2">
                    Password reset email sent! Check your inbox (including your spam folder).
                </Text>
            }

            {errorMessage && (
                <Text className="text-red-500 font-bold mt-2 text-sm">{errorMessage}</Text>
            )}
        </View>
    )
}