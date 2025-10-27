import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";



export default async function getUserRecipes(uid: string) {
    const q = query(collection(db, "recipes"), where('createdBy', '==', uid ))
    const querySnapshot = await getDocs(q)
    const recipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
    return recipes
}