import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { db } from "../db";
import { dbSelectMessages } from "../db/db-selectors";

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

// export const langCheck = (): AppThunk => {
//   return async (dispatch, getState) => {
//     const messages = getState().messages.messages.map(({ role, content }) => ({
//       role,
//       content,
//     }));
//     const st = messages
//       .map((m) => m.content)
//       .join("")
//       .toLocaleLowerCase();

//     const lang = codeLangs.find((lang) => st.includes(lang)) || null;
//     dispatch(paneSlice.actions.setCodeLang(lang));
//   };
// };

export const sendMessage = (
  conversationId: number,
  messageContent: string
): AppThunk<Promise<void>> => {
  return async (dispatch) => {
    await db.addMessage(conversationId, messageContent, "user");
    const messages = await dbSelectMessages(conversationId);

    const assistantMessageId = (
      await db.addMessage(conversationId, "", "assistant")
    ).valueOf() as number;
    const controller = new AbortController();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: messages.map(({ role, content }) => ({
          role,
          content,
        })),
        temperature: 0.6,
        model: "gpt-3.5-turbo",
        max_tokens: 30,
        stream: true,
      }),
      signal: controller.signal,
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let messageStreamContent = "";

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await reader?.read();
      if (res == null) {
        continue;
      }
      if (res.done) {
        break;
      }

      const obj = decoder.decode(res.value);
      const lines = obj
        .split("\n")
        .map((line) => line.replace("data: ", ""))
        .filter((line) => line.length > 0)
        .filter((line) => line !== "[DONE]")
        .map((line) => JSON.parse(line));

      for (const line of lines) {
        const content = line.choices[0].delta.content;
        if (content == null) {
          continue;
        }
        messageStreamContent += content;
        dispatch(
          conversationSlice.actions.appendMessageStream({
            conversationId: conversationId,
            messageId: assistantMessageId,
            delta: content,
          })
        );
      }
    }

    await db.setMessageContent(assistantMessageId, messageStreamContent);
    dispatch(
      conversationSlice.actions.clearMessageStream({
        conversationId,
        messageId: assistantMessageId,
      })
    );
  };
};

// const requestOptions = {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: "Bearer " + import.meta.env.VITE_OPENAI_API_KEY,
//   },
//   body: JSON.stringify({
//     messages: messages.map(({ role, content }) => ({
//       role,
//       content,
//     })),
//     temperature: 0.1,
//     max_tokens: 1000,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0.5,
//     model: "gpt-3.5-turbo",
//   }),
// };
// const resp = await fetch(
//   "https://api.openai.com/v1/chat/completions",
//   requestOptions
// );
// const res = await resp.json();
