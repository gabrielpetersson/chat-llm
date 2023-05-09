import { FC, KeyboardEventHandler, useState } from "react";
import { MessageList } from "./Messages";
import {
  selectActivePaneId,
  selectPanes,
  useMessages,
} from "../../state/selectors";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { sendMessage } from "../../state/conversations";
import { Pane, paneSlice } from "../../state/panes";
import { Uuid } from "../../utils/uuid";
import { dbSelectConversation } from "../../db/db-selectors";
import { useLiveQuery } from "dexie-react-hooks";
import clsx from "clsx";

interface PaneProps {
  pane: Pane;
  paneId: Uuid;
}
const Pane: FC<PaneProps> = ({ pane, paneId }) => {
  const dispatch = useAppDispatch();

  const activePaneId = useAppSelector(selectActivePaneId);
  const isActivePane = activePaneId === paneId;

  const messages = useMessages(pane.conversationId);
  const conversation = useLiveQuery(() =>
    dbSelectConversation(pane.conversationId)
  );
  const [messageDraft, setMessageDraft] = useState("");

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key !== "Enter" || messageDraft === "") {
      return;
    }
    setMessageDraft("");
    await dispatch(sendMessage(pane.conversationId, messageDraft));
  };
  const onRemovePane = () => {
    dispatch(paneSlice.actions.deletePane({ paneId: paneId }));
  };
  return (
    <div
      className="flex min-w-[300px] flex-1 flex-col"
      onClick={() => {
        dispatch(paneSlice.actions.setActivePane(paneId));
      }}
    >
      <div className="flex h-[70px] items-center px-4">
        <div
          className={clsx(
            "flex cursor-pointer text-[18px] font-medium"
            // isActivePane && "underline underline-offset-4"
          )}
        >
          {conversation?.title ?? "New conversation"}
        </div>
        <div className={"flex flex-1 items-center"}>
          {isActivePane && (
            <span className="material-symbols-outlined text-3xl">
              chevron_left
            </span>
          )}
        </div>
        <div
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200"
          onClick={onRemovePane}
        >
          <span className="material-symbols-outlined material-fat pt-1 text-gray-600">
            close
          </span>
        </div>
      </div>
      <MessageList messages={messages} isActivePane={isActivePane} />
      <div className="flex h-[70px] items-center justify-center px-6">
        <input
          value={messageDraft}
          onChange={(e) => setMessageDraft(e.target.value)}
          onKeyDown={onKeydown}
          placeholder="Tell me something..."
          className="dark:dark-gray h-[40px] w-full max-w-[300px] rounded-md border border-black/10 border-orange-900 bg-white px-2 shadow-[0_0_10px_rgba(0,0,0,0.10)] outline-none dark:border-gray-900/50 dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
        />
      </div>
    </div>
  );
};

export const Panes: FC = () => {
  const panes = useAppSelector(selectPanes);

  return (
    <div className="flex flex-1 overflow-x-auto [&>div+div]:border-l-2 [&>div+div]:border-gray-300">
      {Object.entries(panes).map(([paneId, pane]) => {
        return <Pane key={paneId} paneId={paneId as Uuid} pane={pane} />;
      })}
    </div>
  );
};
