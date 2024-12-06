import { FC, useState } from "react";
import { Conversation } from "../../db";
import { db } from "../../db";

interface ChatEditModalProps {
  conversation: Conversation;
  onClose: () => void;
}

export const ChatEditModal: FC<ChatEditModalProps> = ({ conversation, onClose }) => {
  const [title, setTitle] = useState(conversation.title || "");

  const onClickDropshadow = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    onClose();
  };

  const onSubmit = async () => {
    await db.setConversationTitle(conversation.id, title);
    onClose();
  };

  return (
    <div
      className="fixed left-0 top-0 flex h-screen w-screen cursor-pointer items-center justify-center bg-[rgba(0,0,0,0.4)]"
      onClick={onClickDropshadow}
    >
      <div className="flex w-[500px] cursor-auto flex-col rounded bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="mb-1 select-none text-title">Edit Chat</div>
          <div
            className="flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200"
            onClick={onClose}
          >
            <span className="material-symbols-outlined material-fat">close</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 text-sm">Title</div>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-2 py-1 focus:border-gray-400 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chat title"
          />
        </div>
        <button
          className="mt-4 h-[40px] rounded bg-dark-gray text-[16px] text-white enabled:hover:bg-dark-gray-hovered enabled:active:bg-dark-gray-active disabled:opacity-80"
          onClick={onSubmit}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
