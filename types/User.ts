export default interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  favoriteCuisine?: string,
  favoriteRecipe?: string,
  savedRecipes: string[]; // recipe IDs
  myRecipes: string[];
  friends: string[];
  friendRequestsSent: string[]
  friendRequestsReceived: string[]
  chatGroupIds: string[]
}