import { FC, MouseEventHandler } from "react";

import clsx from "clsx";
import { useAppDispatch } from "../../state/store";
import { startNewConversation } from "../../state/conversations";
import { getOpenAIKey } from "../../utils/openai";
import usePortal from "react-useportal";
import { useLiveQuery } from "dexie-react-hooks";
import { dbSelectChatConfigs } from "../../db/db-selectors";
import { ChatConfigModal } from "./ChatConfigModal";
import { useOpenChatConfigShortcut as useStartChatShortcut } from "./useShortcut";
import { ChatConfig, db } from "../../db";

export const ChatConfigList: FC = () => {
  const chatConfigs = useLiveQuery(() => dbSelectChatConfigs(), []);
  useStartChatShortcut();
  return (
    <div className="mb-2 flex min-h-0 flex-1 flex-col bg-dark-gray">
      <AddChatConfigButton />
      <div className="nice-scrollbar mt-2 flex flex-1 basis-0 flex-col overflow-y-auto">
        <ChatConfigItem key={"default-chat-config"} chatConfig={"default"} />
        {chatConfigs?.map((chatConfig) => (
          <ChatConfigItem key={chatConfig.id} chatConfig={chatConfig} />
        ))}
      </div>
    </div>
  );
};

interface ChatConfigItemProps {
  chatConfig: ChatConfig | "default";
}
const ChatConfigItem: FC<ChatConfigItemProps> = ({ chatConfig }) => {
  const dispatch = useAppDispatch();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const key = getOpenAIKey();
    if (key == null) {
      return;
    }
    const options =
      chatConfig === "default" ? {} : { chatConfig: chatConfig.id };
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      dispatch(
        startNewConversation({
          openInNewPane: true,
          ...options,
        })
      );
      return;
    }
    dispatch(startNewConversation(options));
  };

  const handleClickSettings: MouseEventHandler = (e) => {
    e.stopPropagation();
    openPortal(e);
  };

  const shortcut = (() => {
    if (chatConfig === "default") {
      return "⌥ + ⎵";
    }
    return chatConfig.shortcut != null
      ? `⌥ + ${chatConfig.shortcut.toUpperCase()}`
      : null;
  })();
  return (
    <>
      {isOpen && chatConfig !== "default" && (
        <Portal>
          <ChatConfigModal
            initialChatConfig={chatConfig}
            onClose={closePortal}
            onSubmit={(p) => db.putChatConfig({ ...chatConfig, ...p })}
          />
        </Portal>
      )}
      <div
        className={clsx(
          "mt-1 flex h-10 shrink-0 cursor-pointer select-none items-center truncate rounded-lg pl-2 text-white hover:bg-dark-gray-hovered active:bg-dark-gray-active"
        )}
        onClick={onClick}
      >
        <span className="material-symbols-outlined mr-2 cursor-pointer text-[20px]">
          file_open
        </span>
        <div className={"truncate text-[13px]"}>
          {chatConfig === "default" ? "Default chat" : chatConfig.title}
        </div>
        <div className={"ml-1 flex-1 shrink-0 pt-[1px] text-[11px] opacity-50"}>
          {shortcut}
        </div>
        {chatConfig !== "default" && (
          <div
            onClickCapture={handleClickSettings}
            className="mx-1 flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-gray-700 active:bg-gray-600"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </div>
        )}
      </div>
    </>
  );
};

const AddChatConfigButton: FC = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  return (
    <>
      {isOpen && (
        <Portal>
          <ChatConfigModal onClose={closePortal} onSubmit={db.addChatConfig} />
        </Portal>
      )}
      <div
        className={clsx(
          "mt-1 flex h-8 w-full cursor-pointer select-none items-center justify-center truncate rounded-lg border border-gray-600 text-[14px] text-white hover:bg-dark-gray-hovered active:bg-dark-gray-active"
        )}
        onClick={openPortal}
      >
        <span className="material-symbols-outlined mr-1 text-[20px]">add</span>
        {"Add chat config"}
      </div>
    </>
  );
};
