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

export interface Preset {
  id: number;
  ts: number;
  title: string;
  models: ("gpt-3.5-turbo" | "gpt-4")[];
  systemPrompt: string;
  temprature: number;
  shortcut?: string;
}
export type AddPreset = Omit<Preset, "id">;

export class Database extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  presets!: Table<Preset>;
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

const setConversationPresetId = async (
  conversationId: number,
  presetId: number | "default"
) => {
  return await database.conversations
    .where("id")
    .equals(conversationId)
    .modify((conversation) => {
      if (presetId === "default") {
        delete conversation.presetId;
      } else {
        conversation.presetId = presetId;
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

const addConversation = async (presetId?: number) => {
  const conversation: AddConversation = {
    ts: Date.now(),
    ...(presetId != null && { presetId: presetId }),
  };
  return await database.conversations.add(conversation as Conversation);
};

const addPreset = async (preset: Omit<AddPreset, "ts">) => {
  const addPreset: AddPreset = {
    ts: Date.now(),
    ...preset,
  };
  return await database.presets.add(addPreset as Preset);
};

const putPreset = async (preset: Preset) => {
  return await database.presets.put(preset);
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
  setConversationPresetId,
  deleteConversation,
  addPreset,
  putPreset,
};
