import { useLiveQuery } from "dexie-react-hooks";
import { FC, MouseEventHandler, useRef } from "react";
import { Conversation } from "../db";
import clsx from "clsx";
import { dbSelectConversations } from "../db/db-selectors";
import { useAppDispatch, useAppSelector } from "../state/store";
import { selectActiveConversationId } from "../state/selectors";
import {
  openConversation,
  removeConversation,
  startNewConversation,
} from "../state/conversations";
import { getOpenAIKey } from "../utils/openai";

interface ConversationItemProps {
  active: boolean;
  conversation: Conversation;
}
const ConversationItem: FC<ConversationItemProps> = ({
  active,
  conversation,
}) => {
  const dispatch = useAppDispatch();
  const clickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (conversation.title == null) {
    return null;
  }

  const onClick = () => {
    if (clickRef.current != null) {
      return;
    }
    const id = setTimeout(() => {
      clickRef.current = null;
      dispatch(openConversation(conversation.id));
    }, 250);
    clickRef.current = id;
  };
  const onDoubleClick = () => {
    if (clickRef.current == null) {
      return;
    }
    clearTimeout(clickRef.current);
    clickRef.current = null;
    dispatch(openConversation(conversation.id, { newPane: true }));
  };
  const onRemoveConversation: MouseEventHandler = (e) => {
    e.stopPropagation();
    dispatch(removeConversation(conversation.id));
  };
  return (
    <div
      className={clsx(
        "group mt-1 flex h-12 w-full cursor-pointer select-none items-center truncate rounded-lg px-4 text-white",
        active ? "bg-dark-gray-active" : "hover:bg-dark-gray-hovered"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <span className="material-symbols-outlined mr-4 block pt-1">chat</span>
      <div className={"flex-1 truncate"}>{conversation.title}</div>
      {active ? (
        <div
          className="ml-1 mr-[-5px] flex h-8 w-8 cursor-pointer items-center justify-center rounded hover:bg-gray-700 active:bg-gray-600"
          onClickCapture={onRemoveConversation}
        >
          <span className="material-icons material-symbols-outlined pt-1">
            delete
          </span>
        </div>
      ) : null}
    </div>
  );
};

const AddConversationItem: FC = () => {
  const clickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onClick = () => {
    const key = getOpenAIKey();
    if (key == null) {
      return;
    }
    const id = setTimeout(() => {
      dispatch(startNewConversation());
      clickRef.current = null;
    }, 200);
    clickRef.current = id;
  };
  const onDoubleClick = () => {
    if (clickRef.current == null) {
      return;
    }
    clearTimeout(clickRef.current);
    clickRef.current = null;
    dispatch(startNewConversation({ newPane: true }));
  };
  const dispatch = useAppDispatch();
  return (
    <div
      className={clsx(
        "mt-1 flex h-12 w-full cursor-pointer select-none items-center justify-center truncate rounded-lg border border-gray-600 text-[16px] text-white hover:bg-dark-gray-hovered active:bg-dark-gray-active"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <span className="material-symbols-outlined mr-2">add</span>
      {"Add conversation"}
    </div>
  );
};

export const ConversationList: FC = () => {
  const conversationId = useAppSelector(selectActiveConversationId);
  const conversations = useLiveQuery(() => dbSelectConversations());

  return (
    <div className="flex flex-1 flex-col bg-dark-gray">
      <AddConversationItem />
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
