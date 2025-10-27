import  {useState, useEffect, createContext, useContext, } from 'react'
import type { ReactNode } from 'react'
import {auth, db } from "../../firebase/firebaseConfig"
import { onAuthStateChanged, type User } from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore'

interface UserData {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
    savedRecipes?: string[]
    myRecipes?: string[]
    [key: string]: any; // allows for future fields?
}

type AuthContextType = {
  currentUser: User | null
  userData: UserData | null
  loading: boolean
};

const AuthContext = createContext<AuthContextType> ({
    currentUser: null,
    userData: null,
    loading: true
})

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({children}: { children: ReactNode}) {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user)
            if (user) {
                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData)
                }
            } else {
                setUserData(null)
            }
            setLoading(false)
        })
        return unsubscribe
    }, [])

    return (
        <AuthContext.Provider value={{currentUser, userData, loading}}>
            {!loading && children}
        </AuthContext.Provider>
    )


}
