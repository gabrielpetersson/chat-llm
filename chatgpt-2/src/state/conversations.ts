import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { db } from "../db";
import {
  dbSelectConversation,
  dbSelectMessages,
  dbSelectPreset,
} from "../db/db-selectors";
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

const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant called ChatGPT.";

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
    await db.addMessage(conversationId, messageContent, "user");

    const conversation = await dbSelectConversation(conversationId);
    if (conversation == null) {
      console.error(`Conversation ${conversationId} not found`);
      return;
    }

    // NOTE(gab): add title ASAP but don't block on it
    (async () => {
      if (conversation.title != null) {
        return;
      }
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
        temprature: 1,
      });
    })();

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

    const preset = conversation.presetId
      ? await dbSelectPreset(conversation.presetId)
      : null;
    const systemPrompt =
      preset == null ? DEFAULT_SYSTEM_PROMPT : preset.systemPrompt;
    openaiMessages.unshift({ role: "system", content: systemPrompt });
    const model = preset != null ? preset.models[0] : "gpt-3.5-turbo";
    const temprature = preset != null ? preset.temprature : 0.5;

    const responseContent = await openaiQueryStream(openaiMessages, onDelta, {
      maxTokens: 400,
      model,
      temprature,
    });
    await db.setMessageContent(assistantMessageId, responseContent);
    // TODO(gab): the message stream is not cleaned up, as apparently the indexdb
    // listener we have is not synchronously triggering. this is fine though,
    // a bit of a memory leak but will trigger less rerenders
  };
};

export const startNewConversation = (options?: {
  openInNewPane?: boolean;
  presetId?: number;
}): AppThunk => {
  return async (dispatch) => {
    const conversationId = await db.addConversation(options?.presetId);
    dispatch(openConversation(conversationId.valueOf() as number, options));
    return conversationId;
  };
};

export const openConversation = (
  conversationId: number,
  options?: { openInNewPane?: boolean }
): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    const state = getState();
    const currentConversationId = selectActiveConversationId(state);

    const conversationPane = Object.entries(state.panes.panes).find(
      ([_, v]) => v.conversationId === conversationId
    );

    const currentPaneId = selectActivePaneId(state);

    const action = (() => {
      const isActivePane = currentPaneId != null;
      const openInNewPane = options?.openInNewPane ?? false;

      if (conversationPane != null && !openInNewPane) {
        return "focus-already-open-pane";
      }
      if (conversationPane == null && !openInNewPane && isActivePane) {
        return "overtake-pane";
      }
      return "open-new-pane";
    })();

    switch (action) {
      case "focus-already-open-pane": {
        dispatch(paneSlice.actions.setActivePane(conversationPane![0] as Uuid));
        if (currentConversationId != null) {
          dispatch(throwConversationIfEmpty(currentConversationId));
        }
        break;
      }
      case "overtake-pane": {
        dispatch(
          paneSlice.actions.setPaneConversation({
            paneId: currentPaneId!,
            conversationId,
          })
        );
        if (currentConversationId != null) {
          dispatch(throwConversationIfEmpty(currentConversationId));
        }
        break;
      }
      case "open-new-pane": {
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
        break;
      }
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
