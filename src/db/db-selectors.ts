import { PromiseExtended } from "dexie";
import { Conversation, database, Message, ChatConfig } from ".";

export const dbSelectConversations = (): PromiseExtended<Conversation[]> => {
  return database.conversations.reverse().toArray();
};

export const dbSelectFirstConversation = (): PromiseExtended<
  Conversation | undefined
> => {
  return database.conversations.reverse().first();
};

export const dbSelectMessages = (
  conversationId: number
): PromiseExtended<Message[]> => {
  return database.messages
    .where("conversationId")
    .equals(conversationId)
    .toArray();
};

export const dbSelectFirstMessage = (
  conversationId: number
): PromiseExtended<Message | undefined> => {
  return database.messages
    .where("conversationId")
    .equals(conversationId)
    .first();
};

export const dbSelectConversation = (
  conversationId: number
): PromiseExtended<Conversation | undefined> => {
  return database.conversations.get(conversationId);
};

export const dbSelectChatConfig = (
  chatConfigId: number
): PromiseExtended<ChatConfig | undefined> => {
  return database.presets.get(chatConfigId);
};

export const dbSelectConversationAll = (
  conversationId: number
): PromiseExtended<Conversation | undefined> => {
  return database.conversations.get(conversationId);
};

export const dbSelectChatConfigs = (): PromiseExtended<ChatConfig[]> => {
  return database.presets.reverse().toArray();
};

export const dbSelectPythonConversations = (): PromiseExtended<
  Conversation[]
> => {
  return database.conversations
    .where("text")
    .startsWith("python")
    .reverse()
    .toArray();
};
