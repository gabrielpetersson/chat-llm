import {
  ChangeEventHandler,
  FC,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useLiveQuery } from "dexie-react-hooks";
import clsx from "clsx";
import { usePrevious } from "../hooks/usePrevious";
import { dbSelectConversation, dbSelectPresets } from "../../db/db-selectors";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Conversation, db } from "../../db";

interface PaneProps {
  pane: Pane;
  paneId: Uuid;
}
const Pane: FC<PaneProps> = ({ pane, paneId }) => {
  const dispatch = useAppDispatch();
  const activePaneId = useAppSelector(selectActivePaneId);
  const isActivePane = activePaneId === paneId;

  const conversation = useLiveQuery(
    () => dbSelectConversation(pane.conversationId),
    [pane.conversationId]
  );
  const messages = useMessages(pane.conversationId);

  const [messageDraft, setMessageDraft] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // TODO(gab): move input focus to a redux extras action
  const prevIsActive = usePrevious(isActivePane);
  const becameActive = isActivePane && !prevIsActive;
  useEffect(() => {
    if (becameActive) {
      textAreaRef.current?.focus();
    }
  }, [becameActive]);

  useLayoutEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea == null) {
      return;
    }

    const halfScreen = textArea.clientHeight / 2;
    const isMaxSize = textArea.scrollHeight > halfScreen;
    if (isMaxSize) {
      textArea.style.overflowY = "auto";
    } else {
      textArea.style.overflowY = "hidden";
    }

    textArea.style.height = "auto";
    textArea.style.height = `${
      textArea.scrollHeight //isMaxSize ? halfScreen : textArea.scrollHeight
    }px`;
  }, [messageDraft]);

  const onKeydown: KeyboardEventHandler<HTMLTextAreaElement> = async (e) => {
    if (
      e.key !== "Enter" ||
      messageDraft === "" ||
      e.shiftKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    setMessageDraft("");
    await dispatch(sendMessage(pane.conversationId, messageDraft));
  };

  const onInput: ChangeEventHandler<HTMLTextAreaElement> = async (e) => {
    setMessageDraft(e.target.value);
  };

  const onRemovePane: MouseEventHandler = (e) => {
    e.stopPropagation();
    dispatch(paneSlice.actions.deletePane({ paneId: paneId }));
  };

  const onClickPane = () => {
    dispatch(paneSlice.actions.setActivePane(paneId));
  };

  return (
    <div
      className={clsx(
        // TODO(gab): make panes a table for border collapse. negative left margin collapses borders
        "flex min-w-[400px] flex-1 border-[8px] border-l-0 border-dark-gray bg-dark-gray",
        !isActivePane && "cursor-pointer"
      )}
      onClick={onClickPane}
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded bg-white">
        <div
          className={clsx(
            "flex h-[70px] cursor-pointer items-center border-b px-4",
            isActivePane ? "border-gray-300 bg-gray-100" : "border-transparent"
          )}
        >
          <div className="min-w-0 flex-1">
            <div className={clsx("flex-1 truncate text-title")}>
              {conversation?.title == null || conversation.title === ""
                ? "New conversation"
                : conversation.title}
            </div>
            {conversation ? <ChoosePreset conversation={conversation} /> : null}
          </div>

          <div
            className={clsx(
              "flex h-8 w-8 cursor-pointer items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200",
              isActivePane && "hover:bg-gray-200 active:bg-gray-300"
            )}
            onClickCapture={onRemovePane}
          >
            <span className="material-symbols-outlined material-fat pt-[2px]">
              close
            </span>
          </div>
        </div>
        {/* TODO: remove memo by fixing dexies weird memoization & move input to own component */}
        {useMemo(
          () => (
            <MessageList messages={messages} isActivePane={isActivePane} />
          ),
          [isActivePane, messages]
        )}
        <div className="flex items-center justify-center p-4">
          {/* <input
            ref={inputRef}
            value={messageDraft}
            autoFocus
            onChange={(e) => setMessageDraft(e.target.value)}
            onKeyDown={onKeydown}
            placeholder="Tell me something..."
            className="text-input w-full max-w-[500px] shadow-[0_0_10px_rgba(0,0,0,0.10)] outline-none"
          /> */}
          <textarea
            ref={textAreaRef}
            rows={1}
            value={messageDraft}
            autoFocus
            onChange={onInput}
            onKeyDown={onKeydown}
            placeholder="Tell me something..."
            className="w-full max-w-[500px] resize-none overflow-hidden rounded border border-dark-gray p-2 shadow-[0_0_10px_rgba(0,0,0,0.10)] outline-none"
          />
        </div>
      </div>
    </div>
  );
};

const StartPage: FC = () => (
  <div
    className={clsx(
      "flex min-w-[400px] flex-1 border-[8px] border-l-0 border-dark-gray bg-dark-gray"
    )}
  >
    <div className="flex flex-1 flex-col items-center rounded bg-white p-40 px-10">
      <div className="text-header">Welcome to Chat LLM</div>
      <div className="mb-6 text-center">
        All your data is 100% local, and ChatGPT calls are made from the browser
      </div>
      <div>This is an open sourced project, contributions welcome</div>
      <a
        href="https://github.com/gabrielpetersson/chat-llm"
        className="mb-6 text-blue-600 underline"
      >
        https://github.com/gabrielpetersson/chat-llm
      </a>
      <div className="text-center">Click here to find your api key</div>
      <a
        href="https://platform.openai.com/account/api-keys"
        target="_blank"
        className="mb-6 text-blue-600 underline"
      >
        https://platform.openai.com/account/api-keys
      </a>
      <div className="text-center">
        Press "Default chat" to get started, or create a chat config!
      </div>
    </div>
  </div>
);

export const Panes: FC = () => {
  const panes = useAppSelector(selectPanes);
  const paneEntries = Object.entries(panes);
  if (paneEntries.length === 0) {
    return <StartPage />;
  }
  return (
    <div className="flex flex-1 overflow-x-auto">
      {paneEntries.map(([paneId, pane]) => {
        return <Pane key={paneId} paneId={paneId as Uuid} pane={pane} />;
      })}
    </div>
  );
};

interface ChoosePresetProps {
  conversation: Conversation;
}
const ChoosePreset: FC<ChoosePresetProps> = ({ conversation }) => {
  const presets = useLiveQuery(() => dbSelectPresets(), []);
  const currentPreset = presets?.find((p) => p.id === conversation.presetId);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild tabIndex={-1}>
        <button className="mt-[-8px] flex items-center text-[11px] font-thin text-gray-500 outline-none">
          {`Chat config: ${currentPreset?.title ?? "Default"}`}
          <span className="material-symbols-outlined pt-1 text-[16px]">
            expand_more
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[150px] max-w-[300px] bg-white shadow-[0px_0px_3px_rgba(0,0,0,0.3)]"
          sideOffset={5}
        >
          <DropdownMenu.Item className="w-full truncate border-b border-gray-300 bg-gray-100 p-2 text-[11px] outline-none">
            {"Select preset"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              db.setConversationPresetId(conversation.id, "default");
            }}
            className="w-full cursor-pointer truncate p-2 text-[11px] outline-none hover:bg-gray-100"
          >
            {"Default chat"}
          </DropdownMenu.Item>
          {presets?.map((preset) => {
            return (
              <DropdownMenu.Item
                key={preset.id}
                className="w-full cursor-pointer truncate p-2 text-[11px] outline-none hover:bg-gray-100"
                onClick={() => {
                  db.setConversationPresetId(conversation.id, preset.id);
                }}
              >
                {preset.title}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
