import { createContext, useContext, useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { db } from "../firebase/firebaseConfig"
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import type UserProfile from "../types/User"

interface UserProfileContextType {
  currentUserProfile: UserProfile | null
  profilePicture: string | null
  setCurrentUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
  refreshProfile: () => Promise<void>
  favorites: string[]
  toggleFavorite: (recipeId: string) => void
}

const UserProfileContext = createContext<UserProfileContextType>({
  currentUserProfile: null,
  profilePicture: null,
  setCurrentUserProfile: () => {},
  refreshProfile: async () => {},
  favorites: [],     
  toggleFavorite: () => {},
});

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  const [favorites, setFavorites] = useState<string[]>(currentUserProfile?.savedRecipes || [])

  const auth = getAuth()

  const refreshProfile = async () => {
    const user = auth.currentUser
    if (!user) return
    const docRef = doc(db, "users", user.uid)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      const data = { uid: snap.id, ...snap.data() } as UserProfile
      setCurrentUserProfile(data)
      setProfilePicture(data.photoURL ?? null)
    }
  }

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

   useEffect(() => {
    if (currentUserProfile?.savedRecipes) {
      setFavorites(currentUserProfile.savedRecipes);
    }
  }, [currentUserProfile]);

  const toggleFavorite = async (recipeId: string) => {
    if (!currentUserProfile) return;

    const isFavorite = favorites.includes(recipeId);
    const updated = isFavorite
      ? favorites.filter(id => id !== recipeId)
      : [...favorites, recipeId];

    setFavorites(updated);

    // update Firestore
    await updateDoc(doc(db, "users", currentUserProfile.uid), {
      savedRecipes: updated,
    });
  
  };

  return (
    <UserProfileContext.Provider value={{ currentUserProfile, profilePicture, setCurrentUserProfile, refreshProfile, favorites, toggleFavorite }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);