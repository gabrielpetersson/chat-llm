import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { paneSlice } from "./panes";
import { enableBatching } from "redux-batched-actions";
import { conversationSlice } from "./conversations";

export const store = configureStore({
  reducer: enableBatching(
    combineReducers({
      panes: paneSlice.reducer,
      conversations: conversationSlice.reducer,
    })
  ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<R = void> = ThunkAction<
  R,
  RootState,
  void,
  Action<string>
>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
