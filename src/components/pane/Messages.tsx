import clsx from "clsx";
import { FC, useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Message } from "../../db";
import { CodeLang } from "../../state/panes";
import "./github-markdown.css";
import { usePrevious } from "../hooks/usePrevious";

interface MessageItemProps {
  message: Message;
  codeLang: CodeLang | null;
  isActivePane: boolean;
}
export const MessageItem: FC<MessageItemProps> = ({ message, codeLang }) => {
  const bg = message.role === "user" ? "bg-white" : "bg-gray-100";

  const lang = (() => {
    if (message.content.toLowerCase().includes("javascript")) {
      return "javascript";
    }
    if (message.content.toLowerCase().includes("rust")) {
      return "rust";
    }
    if (message.content.toLowerCase().includes("python")) {
      return "python";
    }
    if (message.content.toLowerCase().includes("html")) {
      return "html";
    }
    if (message.content.toLowerCase().includes("css")) {
      return "css";
    }
    return codeLang;
  })();

  return (
    <div
      className={clsx(
        "flex min-h-[55px] flex-shrink-0 flex-col border-b p-4 [&>pre]:overflow-hidden [&>pre]:rounded",
        bg
      )}
    >
      <ReactMarkdown
        children={message.content}
        className="markdown-body"
        components={{
          code({ className, children, inline, ...props }) {
            return lang && inline !== true ? (
              <SyntaxHighlighter
                children={children.join("")}
                style={vs}
                language={lang}
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
  isActivePane: boolean;
}
export const MessageList: FC<ChatMessagesProps> = ({
  messages,
  isActivePane,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const prevScrollHeight = usePrevious(ref.current?.scrollHeight);
  const prevMessagesLength = usePrevious(messages.length) ?? 0;

  useLayoutEffect(() => {
    const container = ref.current;
    if (container == null || prevScrollHeight == null) {
      return;
    }
    const isNewMessage = messages.length > prevMessagesLength;
    const scrollHeightChanged = prevScrollHeight !== ref.current?.scrollHeight;

    const isAtBottom =
      prevScrollHeight - container.clientHeight - container.scrollTop < 10;
    if (isAtBottom && (isNewMessage || scrollHeightChanged)) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, prevMessagesLength, prevScrollHeight]);

  const isScrollable = (() => {
    if (ref.current == null) {
      return false;
    }
    return ref.current.scrollHeight - ref.current.clientHeight > 0;
  })();
  // TODO should not be hardcoded
  const codeLang = "javascript";
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" ref={ref}>
      {messages.map((message, i) => {
        const msg = (
          <MessageItem
            key={message.id}
            message={message}
            codeLang={codeLang}
            isActivePane={isActivePane}
          />
        );

        // adds a height to the last message so it does not start autoscroll
        return isScrollable && i === messages.length - 1 ? (
          <div key={message.id} className="min-h-[300px]">
            {msg}
          </div>
        ) : (
          msg
        );
      })}
    </div>
  );
};
