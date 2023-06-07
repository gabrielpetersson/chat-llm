import Dexie, { Table } from "dexie";
import logger from "dexie-logger";

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
  presetId?: number;
  title?: string;
}
export type AddConversation = Omit<Conversation, "id">;

export interface ChatConfig {
  id: number;
  ts: number;
  title: string;
  models: ("gpt-3.5-turbo" | "gpt-4")[];
  systemPrompt: string;
  temprature: number;
  shortcut: string | null;
}
export type AddChatConfig = Omit<ChatConfig, "id">;

export class Database extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  presets!: Table<ChatConfig>;
  constructor() {
    super("db");
    this.version(1).stores({
      conversations: "++id, ts, presetId",
      messages: "++id, conversationId, ts, role, content",
      presets: "++id, ts, title, models, systemPrompt, shortcut, temprature",
    });
  }
}

export const database = new Database();
database.use(logger());

const setMessageContent = async (messageId: number, content: string) => {
  return await database.messages
    .where("id")
    .equals(messageId)
    .modify((message) => {
      message.content = content;
    });
};

const setConversationTitle = async (conversationId: number, title: string) => {
  return await database.conversations
    .where("id")
    .equals(conversationId)
    .modify((conversation) => {
      conversation.title = title;
    });
};

const setConversationChatConfigId = async (
  conversationId: number,
  chatConfigId: number | "default"
) => {
  return await database.conversations
    .where("id")
    .equals(conversationId)
    .modify((conversation) => {
      if (chatConfigId === "default") {
        delete conversation.presetId;
      } else {
        conversation.presetId = chatConfigId;
      }
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

const addConversation = async (chatConfigId?: number) => {
  const conversation: AddConversation = {
    ts: Date.now(),
    ...(chatConfigId != null && { presetId: chatConfigId }),
  };
  return await database.conversations.add(conversation as Conversation);
};

const addChatConfig = async (chatConfig: Omit<AddChatConfig, "ts">) => {
  const addChatConfig: AddChatConfig = {
    ts: Date.now(),
    ...chatConfig,
  };
  return await database.presets.add(addChatConfig as ChatConfig);
};

const putChatConfig = async (chatConfig: ChatConfig) => {
  return await database.presets.put(chatConfig);
};

const deleteConversation = async (conversationId: number) => {
  await database.conversations.where("id").equals(conversationId).delete();
  await database.messages
    .where("conversationId")
    .equals(conversationId)
    .delete();
};

export const db = {
  addConversation,
  addMessage,
  setMessageContent,
  setConversationTitle,
  setConversationChatConfigId,
  deleteConversation,
  addChatConfig,
  putChatConfig,
};
