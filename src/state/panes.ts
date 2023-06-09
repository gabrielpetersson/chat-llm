import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Uuid } from "../utils/uuid";

const codeLangs = ["python", "javascript", "typescript"] as const;
export type CodeLang = (typeof codeLangs)[number];

export interface Pane {
  conversationId: number;
  messageStream?: string;
}
export type Panes = { [id: Uuid]: Pane };
export interface PaneState {
  panes: Panes;
  activePaneId?: Uuid;
}

const initialState: PaneState = {
  panes: {},
};

export const paneSlice = createSlice({
  name: "panes",
  initialState,
  reducers: {
    setActivePane: (state, action: PayloadAction<Uuid>) => {
      state.activePaneId = action.payload;
    },
    addPane: (
      state,
      action: PayloadAction<{ paneId: Uuid; conversationId: number }>
    ) => {
      state.panes[action.payload.paneId] = {
        conversationId: action.payload.conversationId,
      };
    },
    setPaneConversation: (
      state,
      action: PayloadAction<{ paneId: Uuid; conversationId: number }>
    ) => {
      const pane = state.panes[action.payload.paneId];
      if (pane == null) {
        console.error("pane not found", action.payload.paneId);
        return;
      }
      pane.conversationId = action.payload.conversationId;
    },
    deletePane: (state, action: PayloadAction<{ paneId: Uuid }>) => {
      delete state.panes[action.payload.paneId];
      if (action.payload.paneId == state.activePaneId) {
        const paneIds = Object.keys(state.panes);
        if (paneIds.length > 0) {
          state.activePaneId = paneIds[0] as Uuid;
        } else {
          delete state.activePaneId;
        }
      }
    },
  },
});
