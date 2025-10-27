import { useAuth } from "../../contexts/authContext"
import {useEffect, useState} from 'react'
import type {ChangeEvent} from 'react'
import type UserProfile from "../../types/User"
import { db} from "../../firebase/firebaseConfig"
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";


interface EditProfileProps {
    currentUserProfile: UserProfile | null
    openProfile: (id: string) => void;
}


export default function EditProfile({currentUserProfile, openProfile}: EditProfileProps) {

  const { currentUser } = useAuth()  
  const isCurrentUser = currentUser?.uid === currentUserProfile?.uid

  if (!currentUser || !isCurrentUser) return null

const [profileData, setProfileData] = useState( {
    displayName: '',
    photoURL: '',
    bio: '',
    favoriteCuisine: ''
})

useEffect(() => {
    if(currentUserProfile) {
        setProfileData({
            displayName: currentUserProfile.displayName ?? "",
            photoURL: currentUserProfile.photoURL ?? "",
            bio: currentUserProfile.bio ?? "",
            favoriteCuisine: currentUserProfile.favoriteCuisine ?? ""
        })
    }
}, [currentUserProfile])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target
    setProfileData(prevData => ({
        ...prevData,
        [name]: value,
    }))
  }

    async function handleUpdateProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!currentUser || !isCurrentUser) return;

        try {
            const userRef = await doc(db, 'users', currentUser.uid)
            await updateDoc(userRef, {
                displayName: profileData.displayName,
                photoURL: profileData.photoURL,
                bio: profileData.bio,
                favoriteCuisine: profileData.favoriteCuisine
            } )
            openProfile(currentUserProfile?.uid!)
        } catch (error) {
            console.error('there was an error saving the updates', error)
        }

    }

    return (
    <>
      <div>Edit Profile</div>
      <form onSubmit={handleUpdateProfile} className="" method="POST">
        <div className="p-3">
          <label>Name:
            <input
              type="text"
              name="displayName"
              value={profileData.displayName}
              onChange={handleChange} />
          </label>
        </div>

        <div className="p-3">
          <label>Photo URL:
            <input
              type="text"
              name="photoURL"
              value={profileData.photoURL}
              onChange={handleChange} />
          </label>
        </div>

        <div className="p-3">
          <label>Bio:
            <input
              type="text"
              name="bio"
              value={profileData.bio}
              onChange={handleChange} />
          </label>
        </div>

        <div className="p-3">
          <label>Favorite Cuisine:
            <input
              type="text"
              name="favoriteCuisine"
              value={profileData.favoriteCuisine}
              onChange={handleChange} />
          </label>
        </div>

        <button className="m-8 p-1 rounded text-white bg-blue-500" type="submit">Save</button>
      </form>
    </>
  )
}