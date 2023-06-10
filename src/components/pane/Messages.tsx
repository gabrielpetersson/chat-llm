import clsx from "clsx";
import { FC, memo, useLayoutEffect, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CodeLang } from "../../state/panes";
import "./github-markdown.css";
import { usePrevious } from "../hooks/usePrevious";
import ReactMarkdown from "react-markdown";
import {
  GodModeGoalsMessage,
  GodModeAgentThoughtsMessage,
  GodModeResultMessage,
  GodModeUserFeedbackMessage,
  Message,
  OAIMessage,
} from "../../db/models";

interface MessageItemProps {
  message: OAIMessage;
  codeLang: CodeLang | null;
  isActivePane: boolean;
}
// TODO(gab): memoed because scrolling code horizontally will be reset when other messages
// update, aka all the time when a new message is streamed
export const MessageItem: FC<MessageItemProps> = memo(
  ({ message, codeLang }) => {
    const bg = message.contents.role === "user" ? "bg-white" : "bg-gray-100";
    return (
      <div
        className={clsx(
          "flex min-h-[55px] flex-shrink-0 flex-col border-b p-4 [&>pre]:overflow-hidden [&>pre]:rounded",
          bg
        )}
      >
        <ReactMarkdown
          children={message.contents.content}
          className="markdown-body"
          components={{
            code({ className, children, inline, ...props }) {
              return codeLang && inline !== true ? (
                <SyntaxHighlighter
                  children={children.join("")}
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
  }
);

// TODO rename
interface AgentMessageItemProps {
  message:
    | GodModeAgentThoughtsMessage
    | GodModeResultMessage
    | GodModeUserFeedbackMessage
    | GodModeGoalsMessage;
  codeLang: CodeLang | null;
  isActivePane: boolean;
}
export const AgentMessageItem: FC<AgentMessageItemProps> = memo(
  ({ message, codeLang }) => {
    // const bg = message.role === "result" ? "bg-white" : "bg-gray-100";
    switch (message.type) {
      case "godmode-agent-goals": {
        return (
          <div
            className={clsx(
              "flex min-h-[55px] flex-shrink-0 flex-col border-b p-4 [&>pre]:overflow-hidden [&>pre]:rounded",
              "bg-white"
            )}
          >
            <div className="text-base font-medium">Goals</div>
            {message.contents.goals.map((goal) => (
              <div className="text-base">{goal}</div>
            ))}
          </div>
        );
      }
      case "godmode-agent-result": {
        return (
          <div
            className={clsx(
              "flex min-h-[55px] flex-shrink-0 flex-col border-b p-4 [&>pre]:overflow-hidden [&>pre]:rounded",
              "bg-gray-200"
            )}
          >
            <div className="text-base font-medium">Result:</div>
            <ReactMarkdown
              children={`\`\`\`\n${message.contents.content}\n\`\`\``}
              className="markdown-body"
              components={{
                code({ className, children, inline, ...props }) {
                  return codeLang && inline !== true ? (
                    <SyntaxHighlighter
                      children={children.join("")}
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
      }
      case "godmode-agent-thoughts": {
        return (
          <div
            className={clsx(
              "flex min-h-[55px] flex-shrink-0 flex-col border-b p-4 [&>pre]:overflow-hidden [&>pre]:rounded",
              "bg-gray-100"
            )}
          >
            <div className="text-base font-medium">Thoughts:</div>
            <ReactMarkdown
              children={`${message.contents.thoughts.text}`}
              className="markdown-body"
              components={{
                code({ className, children, inline, ...props }) {
                  return codeLang && inline !== true ? (
                    <SyntaxHighlighter
                      children={children.join("")}
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
            <div className="mt-2 text-base font-medium">Reasoning:</div>
            <ReactMarkdown
              children={`${message.contents.thoughts.reasoning}`}
              className="markdown-body"
              components={{
                code({ className, children, inline, ...props }) {
                  return codeLang && inline !== true ? (
                    <SyntaxHighlighter
                      children={children.join("")}
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
            <div className="mt-2 text-base font-medium">Plan:</div>
            <ReactMarkdown
              children={`\`\`\`\n${JSON.stringify(
                message.contents.command,
                null,
                4
              )}\n\`\`\``}
              className="markdown-body"
              components={{
                code({ className, children, inline, ...props }) {
                  return codeLang && inline !== true ? (
                    <SyntaxHighlighter
                      children={children.join("")}
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
      }
      case "godmode-user-feedback": {
        return (
          <div
            className={clsx(
              "flex min-h-[55px] flex-shrink-0 flex-col border-b p-4 [&>pre]:overflow-hidden [&>pre]:rounded",
              "bg-white"
            )}
          >
            <div className="text-base font-medium">Feedback</div>
            <div className="text-base">{message.contents.content}</div>
          </div>
        );
      }
      default: {
        // assertNever()
        throw new Error("never");
      }
    }
  }
);

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

  // TODO(gab): should not be hardcoded
  const codeLang = "javascript";
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" ref={ref}>
      {messages.map((message, i) => {
        // TODO: exhaustive
        const msg =
          message.type === "open-ai" ? (
            <MessageItem
              key={message.id}
              message={message}
              codeLang={codeLang}
              isActivePane={isActivePane}
            />
          ) : (
            <AgentMessageItem
              key={message.id}
              message={message}
              codeLang={codeLang}
              isActivePane={isActivePane}
            />
          );
        // NOTE(gab): gives last message more space so it does not start auto-scroll
        const isLastMessage = i === messages.length - 1;
        return isLastMessage ? (
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
