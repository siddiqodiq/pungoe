// app/types.ts
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}