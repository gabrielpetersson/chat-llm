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
    deletePane: (state, action: PayloadAction<{ paneId: Uuid }>) => {
      delete state.panes[action.payload.paneId];
    },
  },
});
