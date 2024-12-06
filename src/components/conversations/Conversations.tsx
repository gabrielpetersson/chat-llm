import { useLiveQuery } from "dexie-react-hooks";
import { FC, MouseEventHandler, useState } from "react";
import { Conversation } from "../../db";
import clsx from "clsx";
import { dbSelectConversations } from "../../db/db-selectors";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { selectActiveConversationId } from "../../state/selectors";
import {
  openConversation,
  removeConversation,
  startNewConversation,
} from "../../state/conversations";
import { getOpenAIKey } from "../../utils/openai";
import { DropdownMenu } from "../../components/DropdownMenu";
import { ChatEditModal } from "./ChatEditModal";

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem: FC<ConversationItemProps> = ({ conversation }) => {
  const dispatch = useAppDispatch();
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const isActive = conversation.id === activeConversationId;
  const [showEditModal, setShowEditModal] = useState(false);

  const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const key = getOpenAIKey();
    if (key == null) {
      alert("Please set your OpenAI key first");
      return;
    }
    dispatch(
      openConversation(conversation.id, {
        openInNewPane: e.metaKey,
      })
    );
  };

  const onDelete = (e: Event) => {
    e.stopPropagation();
    dispatch(removeConversation(conversation.id));
  };

  const onEdit = (e: Event) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  return (
    <>
      <div
        className={clsx(
          "group flex cursor-pointer select-none items-center justify-between rounded px-2 py-1 hover:bg-gray-600",
          isActive && "bg-gray-600"
        )}
        onClick={onClick}
      >
        <div className="truncate text-white">
          {conversation.title || "Untitled Chat"}
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="invisible rounded p-1 text-white hover:bg-gray-500 group-hover:visible"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="material-symbols-outlined material-fat">
                more_vert
              </span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[150px] rounded bg-white p-1 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center rounded px-2 py-1 text-sm hover:bg-gray-100"
                onSelect={onEdit}
              >
                <span className="material-symbols-outlined material-fat mr-2">
                  edit
                </span>
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center rounded px-2 py-1 text-sm text-red-600 hover:bg-gray-100"
                onSelect={onDelete}
              >
                <span className="material-symbols-outlined material-fat mr-2">
                  delete
                </span>
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      {showEditModal && (
        <ChatEditModal
          conversation={conversation}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export const AddConversationItem: FC = () => {
  const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const key = getOpenAIKey();
    if (key == null) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      dispatch(startNewConversation({ openInNewPane: true }));
      return;
    }
    dispatch(startNewConversation());
  };
  const dispatch = useAppDispatch();
  return (
    <div
      className={clsx(
        "mt-1 flex h-12 w-full cursor-pointer select-none items-center justify-center truncate rounded-lg border border-gray-600 text-[16px] text-white hover:bg-dark-gray-hovered active:bg-dark-gray-active"
      )}
      onClick={onClick}
    >
      <span className="material-symbols-outlined mr-2">add</span>
      {"Add conversation"}
    </div>
  );
};

export const ConversationList: FC = () => {
  const conversationId = useAppSelector(selectActiveConversationId);
  const conversations = useLiveQuery(() => dbSelectConversations(), []);

  return (
    <div className="nice-scrollbar flex min-h-0 flex-1 basis-0 flex-col overflow-y-auto">
      {conversations?.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
        />
      ))}
    </div>
  );
};
