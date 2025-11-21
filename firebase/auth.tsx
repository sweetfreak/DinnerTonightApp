import { auth, db} from "./firebaseConfig"
import { signInWithEmailAndPassword, type User } from 'firebase/auth';
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updatePassword, updateProfile, signOut } from "firebase/auth";
import {doc, setDoc, serverTimestamp} from 'firebase/firestore'

 export async function doCreateUserWithEmailAndPassword(email: string, password: string, displayName: string) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName})

      await setDoc(doc(db, "users", user.uid), {
         uid: user.uid,
         email: user.email,
         displayName: displayName,
         photoURL: "",
         bio: "",
         favoriteCuisine: "",
         favoriteRecipe: "",
         savedRecipes: [],
         myRecipes: [],
         followers: [],
         following: [],
         settings: {
            isPublicProfile: true,
            notificationsEnabled: true
         },
         chatGroupIds: [],
         createdAt: serverTimestamp(),
         lastLogin: serverTimestamp(),
      })


    return user
 }

 export const doSignInWithEmailAndPassword = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
 }
 //could get google/apple login stuff here too: https://www.youtube.com/watch?v=WpIDez53SK4

export async function doSignOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

 export const doPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email)
 }

 export const doPasswordChange = (user: User, password: string) => {
    if (!user) throw new Error("No current user logged in");
    return updatePassword(user, password)
 }

 export const doSendEmailVerification = (user: User) => {
    if (!user) throw new Error("No current user logged in");
    return sendEmailVerification(user, {
        url: `${window.location.origin}/home`,
    })
 }

