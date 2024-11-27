import { PromiseExtended } from "dexie";
import { database } from ".";
import {
  Conversation,
  Message,
  ChatConfig,
  GodModeGoalsMessage,
} from "./models";

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

export const dbSelectGodModeGoals = (
  conversationId: number
): PromiseExtended<GodModeGoalsMessage | undefined> => {
  return database.messages
    .where({ conversationId, type: "godmode-agent-goals" })
    .first() as PromiseExtended<GodModeGoalsMessage | undefined>;
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
  return database.chatConfigs.get(chatConfigId);
};

export const dbSelectChatConfigs = (): PromiseExtended<ChatConfig[]> => {
  return database.chatConfigs.reverse().toArray();
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
