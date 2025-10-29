
export interface Style {
  name: string;
  prompt: string;
  icon: string;
}

export type MessageAuthor = 'user' | 'ai';

export interface ShoppingLink {
  itemName: string;
  description: string;
  url: string;
}
export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  shoppingLinks?: ShoppingLink[];
}
