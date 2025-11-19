export default interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  favoriteCuisine?: string,
  favoriteRecipe?: string,
  savedRecipes: string[]
  myRecipes: string[]
  friends: string[]
  friendRequestsSent: string[]
  friendRequestsReceived: string[]
  chatGroupIds: string[]
  settings: {
            isPublicProfile: boolean,
            notificationsEnabled: boolean
         },
  createdAt: Date,
  lastLogin: Date
  banned: false
}