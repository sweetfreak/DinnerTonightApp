import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth'; // ✅ added explicit import of signOut
import { doc, getDoc } from 'firebase/firestore';
import { router } from "expo-router";


interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  savedRecipes?: string[];
  myRecipes?: string[];
  [key: string]: any;
}

type AuthContextType = {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setCurrentUser(user);
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
    } else {
      setUserData(null);
    }
    setLoading(false);
  });
  return unsubscribe;
}, [auth]);

  // ✅ CHANGED: use Firebase’s signOut method directly, with proper error handling
const signOut = async () => {
  try {
    await auth.signOut();
    setCurrentUser(null);
    setUserData(null);
    router.replace("/signIn/SignInOptions");

  } catch (error) {
    console.error("Sign-out error:", error);
  }
};

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}