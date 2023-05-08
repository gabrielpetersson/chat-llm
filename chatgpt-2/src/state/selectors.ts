import { useLiveQuery } from "dexie-react-hooks";
import { Message } from "../db";
import { dbSelectMessages } from "../db/db-selectors";
import { Uuid } from "../utils/uuid";
import { Panes } from "./panes";
import { RootState, useAppSelector } from "./store";

export const selectPanes = (state: RootState): Panes => state.panes.panes;

export const selectActivePane = (state: RootState): Uuid | null =>
  state.panes.activePane ?? null;

export const selectActiveConversationId = (state: RootState): number | null => {
  if (state.panes.activePane == null) {
    return null;
  }
  return state.panes.panes[state.panes.activePane]?.conversationId ?? null;
};

export const selectConversationMessageStreams = (
  state: RootState,
  conversationId: number
): { [messageId: string]: string } => {
  return state.conversations.messageStreams[conversationId] ?? {};
};

export const useMessages = (conversationId: number): Message[] => {
  const messageStreams = useAppSelector((state) =>
    selectConversationMessageStreams(state, conversationId)
  );
  const messages =
    useLiveQuery(() => dbSelectMessages(conversationId), [conversationId]) ??
    [];

  // TODO(gab): this is obv extremely inefficient. will actually go around react here,
  // and not do it functionally. see demo: https://www.loom.com/share/df4ca92ece5b4dd184a215027689cf6e
  const mergedMessages = messages.map((message) => {
    const messageStream = messageStreams[message.id];
    if (messageStream == null) {
      return message;
    }
    return {
      ...message,
      content: messageStream,
    };
  });

  return mergedMessages;
};
