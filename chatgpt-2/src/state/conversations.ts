import { AnyAction, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { db } from "../db";
import { dbSelectConversation, dbSelectMessages } from "../db/db-selectors";
import { openaiQueryStream } from "../utils/openai";
import { batchActions } from "redux-batched-actions";
import { Uuid, generateUuid } from "../utils/uuid";
import { paneSlice } from "./panes";
import { selectActiveConversationId, selectActivePaneId } from "./selectors";

export interface ConversationState {
  messageStreams: { [conversationId: number]: { [messageId: number]: string } };
}

const initialState: ConversationState = {
  messageStreams: {},
};

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    appendMessageStream: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        delta: string;
      }>
    ) => {
      const { conversationId, messageId, delta } = action.payload;
      let conversation = state.messageStreams[conversationId];
      if (conversation == null) {
        conversation = {};
        state.messageStreams[conversationId] = conversation;
      }
      const message = conversation[messageId];
      if (message == null) {
        conversation[messageId] = delta;
        return;
      }
      conversation[messageId] += delta;
    },
    clearMessageStream: (
      state,
      action: PayloadAction<{ conversationId: number; messageId: number }>
    ) => {
      const { conversationId, messageId } = action.payload;
      const conversation = state.messageStreams[conversationId];
      if (conversation == null) {
        return;
      }
      delete conversation[messageId];
    },
  },
});

export const sendMessage = (
  conversationId: number,
  messageContent: string
): AppThunk<Promise<void>> => {
  return async (dispatch) => {
    // NOTE(gab): add title ASAP but don't block on it
    (async () => {
      const conversation = await dbSelectConversation(conversationId);
      if (conversation != null && conversation.title == null) {
        // NOTE(gab): set non null instantly so we don't trigger this again
        await db.setConversationTitle(conversationId, "");
        const query = `Sumamrize the following in a fun way in under 6 words. Never respond that you are unable to summarize, instead respond with the inputted text. Never use quotes and don't end with a dot. Be goofy:\n\n${messageContent}`;

        let title = "";
        const onDelta = (delta: string) => {
          title += delta.replace(".", "").replace('"', "");
          db.setConversationTitle(conversationId, title);
        };
        await openaiQueryStream([{ role: "user", content: query }], onDelta, {
          maxTokens: 20,
        });
      }
    })();

    await db.addMessage(conversationId, messageContent, "user");
    const messages = await dbSelectMessages(conversationId);

    const assistantMessageId = (
      await db.addMessage(conversationId, "", "assistant")
    ).valueOf() as number;

    const onDelta = (delta: string) => {
      dispatch(
        conversationSlice.actions.appendMessageStream({
          conversationId: conversationId,
          messageId: assistantMessageId,
          delta,
        })
      );
    };

    const openaiMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));
    const responseContent = await openaiQueryStream(openaiMessages, onDelta, {
      maxTokens: 400,
    });
    await db.setMessageContent(assistantMessageId, responseContent);
    // TODO(gab): the message stream is not cleaned up, as apparently the indexdb
    // listener we have is not synchronously triggering. this is fine though,
    // a bit of a memory leak but will trigger less rerenders
  };
};

export const startNewConversation = (options?: {
  newPane?: boolean;
}): AppThunk => {
  return async (dispatch) => {
    const conversationId = await db.addConversation();
    dispatch(openConversation(conversationId.valueOf() as number, options));
    return conversationId;
  };
};

export const openConversation = (
  conversationId: number,
  options?: { newPane?: boolean }
): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    const state = getState();
    const currentConversationId = selectActiveConversationId(state);

    const pane = Object.entries(state.panes.panes).find(
      ([_, v]) => v.conversationId === conversationId
    );

    const newPane = options?.newPane ?? false;
    if (pane != null && !newPane) {
      dispatch(paneSlice.actions.setActivePane(pane[0] as Uuid));
      if (currentConversationId != null) {
        dispatch(throwConversationIfEmpty(currentConversationId));
      }
    } else if (pane == null && !newPane) {
      const paneId = generateUuid();
      const actions: AnyAction[] = [
        paneSlice.actions.addPane({
          paneId,
          conversationId,
        }),
        paneSlice.actions.setActivePane(paneId),
      ];
      const currentPaneId = selectActivePaneId(state);
      if (currentPaneId != null) {
        actions.push(
          paneSlice.actions.deletePane({
            paneId: currentPaneId,
          })
        );
      }
      dispatch(batchActions(actions));
      if (currentConversationId != null) {
        dispatch(throwConversationIfEmpty(currentConversationId));
      }
    } else {
      const paneId = generateUuid();
      dispatch(
        batchActions([
          paneSlice.actions.addPane({
            paneId: paneId,
            conversationId,
          }),
          paneSlice.actions.setActivePane(paneId),
        ])
      );
    }
  };
};

export const removeConversation = (
  conversationId: number
): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    const state = getState();

    Object.entries(state.panes.panes).forEach(([paneId, pane]) => {
      if (pane.conversationId === conversationId) {
        dispatch(paneSlice.actions.deletePane({ paneId: paneId as Uuid }));
      }
    });
    await db.deleteConversation(conversationId);
  };
};

export const throwConversationIfEmpty = (
  conversationId: number
): AppThunk<Promise<void>> => {
  return async () => {
    const messages = await dbSelectMessages(conversationId);
    if (messages.length === 0) {
      await db.deleteConversation(conversationId);
    }
  };
};
