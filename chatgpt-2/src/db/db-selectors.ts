import { PromiseExtended } from "dexie";
import { Conversation, database, Message } from ".";

export const dbSelectConversations = (): PromiseExtended<Conversation[]> => {
  return database.conversations.reverse().toArray();
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
): PromiseExtended<Message | undefined> =>
  database.messages.where("conversationId").equals(conversationId).first();

export const dbSelectConversation = (
  conversationId: number
): PromiseExtended<Conversation | undefined> =>
  database.conversations.get(conversationId);
