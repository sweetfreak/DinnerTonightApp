export default interface Chat {
  id: string
  participants: string[]
  participantProfiles?: {uid: string, displayName: string}[]
  latestMessageText: string
  latestMessageSenderID: string
  updatedAt: Date
  messages: Message[]
}

export interface Message {
  id: string
  senderId: string
  text: string
  createdAt: Date
  type: string
}