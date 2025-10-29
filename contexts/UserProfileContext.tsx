import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import type UserProfile from "../types/User";

interface UserProfileContextType {
  currentUserProfile: UserProfile | null;
  profilePicture: string | null;
  setCurrentUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType>({
  currentUserProfile: null,
  profilePicture: null,
  setCurrentUserProfile: () => {},
  refreshProfile: async () => {},
});

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const auth = getAuth();

  const refreshProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = { uid: snap.id, ...snap.data() } as UserProfile;
      setCurrentUserProfile(data);
      setProfilePicture(data.photoURL ?? null);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUserProfile(null);
        setProfilePicture(null);
        return;
      }

      // Subscribe to profile changes in Firestore
      const docRef = doc(db, "users", user.uid);
      const unsubscribeSnapshot = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data) {
          const profile = { uid: snap.id, ...data } as UserProfile;
          setCurrentUserProfile(profile);
          setProfilePicture(profile.photoURL ?? null);
        }
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <UserProfileContext.Provider value={{ currentUserProfile, profilePicture, setCurrentUserProfile, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);