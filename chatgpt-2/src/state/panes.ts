import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { Uuid, generateUuid } from "../utils/uuid";
import { db } from "../db";
import { batchActions } from "redux-batched-actions";

const codeLangs = ["python", "javascript", "typescript"] as const;
export type CodeLang = (typeof codeLangs)[number];

interface Panel {
  conversationId: number;
  messageStream?: string;
}
export type Panes = { [id: Uuid]: Panel };
export interface PaneState {
  panes: Panes;
  activePane?: Uuid;
}

const initialState: PaneState = {
  panes: {},
};

export const paneSlice = createSlice({
  name: "panes",
  initialState,
  reducers: {
    setActivePane: (state, action: PayloadAction<Uuid>) => {
      state.activePane = action.payload;
    },
    addPane: (
      state,
      action: PayloadAction<{ id: Uuid; conversationId: number }>
    ) => {
      state.panes[action.payload.id] = {
        conversationId: action.payload.conversationId,
      };
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

export const startNewConversation = (): AppThunk => {
  return async (dispatch) => {
    const conversationId = await db.addConversation();

    const paneId = generateUuid();
    dispatch(
      batchActions([
        paneSlice.actions.addPane({
          id: paneId,
          conversationId: conversationId.valueOf() as number,
        }),
        paneSlice.actions.setActivePane(paneId),
      ])
    );
    return conversationId;
  };
};

export const openConversation = (
  conversationId: number
): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    const state = getState();
    const existingPane = Object.entries(state.panes).find(
      ([_, v]) => v.conversationId === conversationId
    );

    if (existingPane != null) {
      dispatch(paneSlice.actions.setActivePane(existingPane[0] as Uuid));
    } else {
      const paneId = generateUuid();
      dispatch(
        batchActions([
          paneSlice.actions.addPane({
            id: paneId,
            conversationId,
          }),
          paneSlice.actions.setActivePane(paneId),
        ])
      );
    }
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
