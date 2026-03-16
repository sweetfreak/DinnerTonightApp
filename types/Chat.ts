export default interface Chat {
  id: string
  participants: string[]
  participantNames: { [uid: string]: string }
  sharedRecipes?: string[]
  latestMessageText?: string
  latestMessageSenderID?: string
  updatedAt?: Date
  messages?: Message[]
}

export interface Message {
  id: string
  senderId: string
  text: string
  createdAt: Date
  type: string
  recipeTitle: string
  recipeId: string
  recipePhotoURL: string
}