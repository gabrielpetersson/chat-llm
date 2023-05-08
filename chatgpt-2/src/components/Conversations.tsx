import { useLiveQuery } from "dexie-react-hooks";
import { FC } from "react";
import { Conversation } from "../db";
import clsx from "clsx";
import {
  dbSelectFirstMessage,
  dbSelectConversations,
} from "../db/db-selectors";
import { startNewConversation, openConversation } from "../state/panes";
import { useAppDispatch, useAppSelector } from "../state/store";
import { selectActiveConversationId } from "../state/selectors";

interface ConversationItemProps {
  active: boolean;
  conversation: Conversation;
  onClick: () => void;
}
const ConversationItem: FC<ConversationItemProps> = ({
  active,
  conversation,
  onClick,
}) => {
  // get conversation title from db
  const firstMessage = useLiveQuery(() =>
    dbSelectFirstMessage(conversation.id)
  );
  return (
    <div
      className={clsx(
        "mt-1 flex h-12 w-full cursor-pointer items-center truncate rounded-lg pl-4 text-white",
        active ? "bg-dark-gray-active" : "hover:bg-dark-gray-hovered"
      )}
      onClick={onClick}
    >
      <span className="material-symbols-outlined mr-4 pt-1">chat</span>
      <div className={"truncate"}>
        {firstMessage != null ? firstMessage.content : "New conversation"}
      </div>
    </div>
  );
};

interface AddConversationItemProps {
  onClick: () => void;
}
const AddConversationItem: FC<AddConversationItemProps> = ({ onClick }) => {
  return (
    <div
      className={clsx(
        "mt-1 flex h-12 w-full cursor-pointer items-center justify-center truncate rounded-lg border border-gray-600 text-white hover:bg-dark-gray-hovered active:bg-dark-gray-active"
      )}
      onClick={onClick}
    >
      <span className="material-symbols-outlined mr-2">add</span>
      {"Add conversation"}
    </div>
  );
};

export const ConversationList: FC = () => {
  const dispatch = useAppDispatch();
  const conversationId = useAppSelector(selectActiveConversationId);

  const conversations = useLiveQuery(() => dbSelectConversations());
  const newConversation = async () => {
    dispatch(startNewConversation());
  };
  return (
    <div className="flex w-full flex-col bg-dark-gray p-3">
      <AddConversationItem onClick={newConversation} />
      {conversations?.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          active={conversationId === conversation.id}
          conversation={conversation}
          onClick={() => dispatch(openConversation(conversation.id))}
        />
      ))}
    </div>
  );
};
