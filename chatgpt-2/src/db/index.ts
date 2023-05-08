import Dexie, { Table } from "dexie";

export type MessageRole = "assistant" | "user" | "system";
export interface Message {
  id: number;
  conversationId: number;
  ts: number;
  role: MessageRole;
  content: string;
}
export type AddMessage = Omit<Message, "id">;

export interface Conversation {
  id: number;
  ts: number;
  title?: string;
}
export type AddConversation = Omit<Conversation, "id">;

export class Database extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  constructor() {
    super("db");
    this.version(1).stores({
      conversations: "++id, ts",
      messages: "++id, conversationId, ts, role, content",
    });
  }
}

export const database = new Database();

const setMessageContent = async (messageId: number, content: string) => {
  return await database.messages
    .where("id")
    .equals(messageId)
    .modify((message: Message) => {
      message.content = content;
    });
};

const addMessage = async (
  conversationId: number,
  content: string,
  role: MessageRole
) => {
  const message: AddMessage = {
    ts: Date.now(),
    role,
    content: content,
    conversationId: conversationId,
  };
  const messageId = await database.messages.add(message as Message);
  return messageId;
};

const addConversation = async () => {
  const conversation: AddConversation = {
    ts: Date.now(),
  };
  return await database.conversations.add(conversation as Conversation);
};

const setConversationTitle = async (conversationId: number, title: string) => {
  return await database.conversations
    .where("id")
    .equals(conversationId)
    .modify((conversation: Conversation) => {
      conversation.title = title;
    });
};

export const db = {
  addConversation,
  addMessage,
  setMessageContent,
  setConversationTitle,
};
