import { useLiveQuery } from "dexie-react-hooks";
import { FC, MouseEventHandler } from "react";
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

interface ConversationItemProps {
  active: boolean;
  conversation: Conversation;
}
const ConversationItem: FC<ConversationItemProps> = ({
  active,
  conversation,
}) => {
  const dispatch = useAppDispatch();

  if (conversation.title == null) {
    return null;
  }

  const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const key = getOpenAIKey();
    if (key == null) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      dispatch(openConversation(conversation.id, { openInNewPane: true }));
      return;
    }
    dispatch(openConversation(conversation.id));
  };
  const onRemoveConversation: MouseEventHandler = (e) => {
    e.stopPropagation();
    dispatch(removeConversation(conversation.id));
  };
  return (
    <div
      className={clsx(
        "mt-1 flex h-10 shrink-0 cursor-pointer select-none items-center truncate rounded-lg pl-2 text-white hover:bg-dark-gray-hovered active:bg-dark-gray-active",
        active ? "bg-dark-gray-active" : "hover:bg-dark-gray-hovered"
      )}
      onClick={onClick}
    >
      <span className="material-symbols-outlined mr-2 cursor-pointer pt-[3px] text-[20px]">
        chat
      </span>
      <div className={"flex-1 truncate text-[13px]"}>{conversation.title}</div>
      {active ? (
        <div
          className="mx-1 flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-gray-700 active:bg-gray-600"
          onClickCapture={onRemoveConversation}
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </div>
      ) : null}
    </div>
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
    <div className="nice-scrollbar mt-1 flex min-h-0 flex-1 flex-col overflow-y-auto bg-dark-gray">
      {conversations?.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          active={conversationId === conversation.id}
          conversation={conversation}
        />
      ))}
    </div>
  );
};
