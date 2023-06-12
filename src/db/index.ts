import Dexie, { Table } from "dexie";
import logger from "dexie-logger";
import {
  Conversation,
  ChatConfig,
  AddMessage,
  AddConversation,
  AddChatConfig,
  Message,
  OAIMessage,
} from "./models";

export class Database extends Dexie {
  conversations!: Table<Conversation, number>;
  messages!: Table<Message, number>;
  chatConfigs!: Table<ChatConfig, number>;
  constructor() {
    super("db");

    this.version(2).stores({
      conversations: "++id, ts, chatConfigId",
      messages: "++id, ts, conversationId, contents",
      chatConfigs: "++id, ts, title, systemPrompt, shortcut, providers",
    });

    this.version(1).stores({
      conversations: "++id, ts, presetId",
      messages: "++id, conversationId, ts, role, content",
      presets: "++id, ts, title, models, systemPrompt, shortcut, temperature",
    });
  }
}

export const database = new Database();
database.use(logger());

const setOAIMessageContent = async (messageId: number, content: string) => {
  return await database.messages
    .where({ id: messageId, type: "open-ai" })
    .modify((message: OAIMessage) => {
      message.contents.content = content;
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
        delete conversation.chatConfigId;
      } else {
        conversation.chatConfigId = chatConfigId;
      }
    });
};

const addMessage = async (m: Omit<Message, "id" | "ts">) => {
  const message: AddMessage = {
    ...m,
    ts: Date.now(),
  };
  const messageId = await database.messages.add(message as Message);
  return messageId;
};

const addConversation = async (chatConfigId?: number) => {
  const conversation: AddConversation = {
    ts: Date.now(),
    ...(chatConfigId != null && { chatConfigId: chatConfigId }),
  };
  return await database.conversations.add(conversation as Conversation);
};

const addChatConfig = async (chatConfig: Omit<AddChatConfig, "ts">) => {
  const addChatConfig: AddChatConfig = {
    ts: Date.now(),
    ...chatConfig,
  };
  return await database.chatConfigs.add(addChatConfig as ChatConfig);
};

const deleteAllMessages = async (conversationId: number) => {
  await database.messages
    .where("conversationId")
    .equals(conversationId)
    .delete();
};

const putChatConfig = async (chatConfig: ChatConfig) => {
  return await database.chatConfigs.put(chatConfig);
};

const deleteConversation = async (conversationId: number) => {
  await database.conversations.where("id").equals(conversationId).delete();
  await deleteAllMessages(conversationId);
};

export const db = {
  addMessage,
  setOAIMessageContent,
  deleteAllMessages,

  addConversation,
  deleteConversation,
  setConversationTitle,
  setConversationChatConfigId,

  addChatConfig,
  putChatConfig,
};
