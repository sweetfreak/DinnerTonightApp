import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import LogIn from "./LogIn"
import CreateAccount from "./CreateAccount"


export default function SignInOptions() {
    const [showLogInNotCreate, setShowLogInNotCreate] = useState(true)

function toggleScreens() {
        setShowLogInNotCreate(prev => !prev)
    }


return (
  <View className="flex-1 p-5">
    {showLogInNotCreate ? (
      <>
        <LogIn />
        <TouchableOpacity onPress={toggleScreens} className='mt-4'>
          <Text className=" font-bold text-center">or Create an account</Text>
      </TouchableOpacity>
      </>
    ) : (
      <>
        <CreateAccount />
        <TouchableOpacity onPress={toggleScreens} className="mt-4">
            <Text className="font-bold text-center">or Log In</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

}