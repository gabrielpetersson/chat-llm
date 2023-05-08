import { useLiveQuery } from "dexie-react-hooks";
import { FC, KeyboardEventHandler, useState } from "react";
import { ChatList } from "./Messages";
import { dbSelectConversation } from "../../db/db-selectors";
import { selectActiveConversationId, useMessages } from "../../state/selectors";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { sendMessage } from "../../state/conversations";

interface ChatPaneProps {
  conversationId: number;
}
const ChatPane: FC<ChatPaneProps> = ({ conversationId }) => {
  const dispatch = useAppDispatch();

  const conversation = useLiveQuery(() => dbSelectConversation(conversationId));
  const messages = useMessages(conversationId);
  const [messageDraft, setMessageDraft] = useState("");

  if (conversation == null || messages == null) {
    return <>{"could not find conversation"}</>;
  }

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key !== "Enter") {
      return;
    }
    setMessageDraft("");
    await dispatch(sendMessage(conversationId, messageDraft));
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1">
        <ChatList messages={messages} />
      </div>
      <div className="flex h-[70px] items-center justify-center">
        <input
          value={messageDraft}
          onChange={(e) => setMessageDraft(e.target.value)}
          onKeyDown={onKeydown}
          placeholder="Tell me something..."
          className="dark:dark-gray h-[40px] w-[300px] rounded-md border border-black/10 border-orange-900 bg-white px-2 shadow-[0_0_10px_rgba(0,0,0,0.10)] outline-none dark:border-gray-900/50 dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
        />
      </div>
    </div>
  );
};

export const Chat: FC = () => {
  const conversationId = useAppSelector(selectActiveConversationId);

  return (
    <div className="flex flex-1">
      {conversationId != null && <ChatPane conversationId={conversationId} />}
    </div>
  );
};
