// app/contexts/UserProfileContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import type UserProfile from "../types/User";



const UserProfileContext = createContext<{
  currentUserProfile: UserProfile | null;
  setCurrentUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}>({
  currentUserProfile: null,
  setCurrentUserProfile: () => {},
});

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setCurrentUserProfile(null);
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCurrentUserProfile({ uid: snap.id, ...snap.data() } as UserProfile);
      } else {
        console.log("No profile found for", user.uid);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  });

  return unsubscribe;
}, []);

  return (
    <UserProfileContext.Provider value={{ currentUserProfile, setCurrentUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);