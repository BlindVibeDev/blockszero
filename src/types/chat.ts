export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isRead: boolean;
}