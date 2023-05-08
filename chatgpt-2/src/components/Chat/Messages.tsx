import clsx from "clsx";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Message } from "../../db";
import { CodeLang } from "../../state/panes";

interface MessageItemProps {
  message: Message;
  codeLang: CodeLang | null;
}
export const MessageItem: FC<MessageItemProps> = ({ message, codeLang }) => {
  const bg = message.role === "user" ? "bg-white" : "bg-gray-100";
  return (
    <div className={clsx("flex min-h-[60px] flex-col border-b p-4", bg)}>
      <ReactMarkdown
        children={message.content}
        components={{
          code({ className, children, inline, ...props }) {
            return codeLang && inline !== true ? (
              <SyntaxHighlighter
                // {...props}
                children={children.join("").replace(/\n$/, "")} //
                style={vs}
                language={codeLang}
                PreTag="div"
              />
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
};

interface ChatMessagesProps {
  messages: Message[];
}
export const ChatList: FC<ChatMessagesProps> = ({ messages }) => {
  const codeLang = "javascript";
  return (
    <div className="flex flex-1 flex-col">
      {messages.map((messages) => (
        <MessageItem key={messages.id} message={messages} codeLang={codeLang} />
      ))}
    </div>
  );
};
