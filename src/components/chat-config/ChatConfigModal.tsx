import clsx from "clsx";
import { FC, useState, MouseEventHandler, ReactNode, useEffect } from "react";
import { ChatConfig } from "../../db";
import { ChatConfigProvider, useChatConfigContext } from "./ChatConfigContext";

interface ChatConfigProps {
  initialChatConfig?: ChatConfig;
  onClose: () => void;
  onSubmit: (chatConfig: Omit<ChatConfig, "id" | "ts">) => void;
}
export const ChatConfigModal: FC<ChatConfigProps> = ({
  initialChatConfig,
  onSubmit,
  onClose,
}) => {
  return (
    <ChatConfigProvider
      initialChatConfig={initialChatConfig}
      onSubmit={onSubmit}
    >
      <ChatConfigDumb onClose={onClose} />
    </ChatConfigProvider>
  );
};

interface ChatConfigDumbProps {
  onClose: () => void;
}

const ChatConfigDumb: FC<ChatConfigDumbProps> = ({ onClose }) => {
  const {
    chatConfig,
    isCreatingConfig,
    setTitle,
    setModel,
    setShortcut,
    setSystemPrompt,
    setTemperature,
    submit,
  } = useChatConfigContext();

  const [textTemperature, setTextTemperature] = useState(
    chatConfig.temprature.toString() ?? "1.0"
  );

  const temperature = (() => {
    const numeric = Number(textTemperature);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 1) {
      return null;
    }
    return numeric;
  })();
  const isFaultyTemperature = temperature == null;

  useEffect(() => {
    if (isFaultyTemperature) {
      return;
    }
    // TODO: bit hacky
    setTemperature(temperature);
  }, [isFaultyTemperature, setTemperature, temperature]);

  const onClickDropshadow: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    onClose();
  };

  const onSubmit = () => {
    submit();
    onClose();
  };

  const { title, shortcut, models, systemPrompt } = chatConfig;
  const disable = title === "" || isFaultyTemperature;
  return (
    <div
      className="fixed left-0 top-0 flex h-screen w-screen cursor-pointer items-center justify-center bg-[rgba(0,0,0,0.4)]"
      onClick={onClickDropshadow}
    >
      <div className="flex w-[500px] cursor-auto flex-col rounded bg-white p-4">
        <Section>
          <div className="flex items-center justify-between">
            <div className="mb-1 select-none text-title">Chat Config</div>
            <div
              className="flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200"
              onClick={onClose}
            >
              <span className="material-symbols-outlined material-fat">
                close
              </span>
            </div>
          </div>
        </Section>
        <Section>
          <Title>Title</Title>
          <input
            type="text"
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Section>
        <Section>
          <Title>
            {`Shortcut: ${
              shortcut != null 
                ? `⌥ + ${shortcut.toUpperCase()} (⌥ + ${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + ${shortcut.toUpperCase()} for new pane)` 
                : "None"
            }`}
          </Title>
          <div className="flex h-[40px] w-full select-none rounded border border-dark-gray">
            <ShortcutButton
              onClick={() => setShortcut(shortcut === "a" ? null : "a")}
              active={shortcut === "a"}
            >
              A
            </ShortcutButton>
            <ShortcutButton
              onClick={() => setShortcut(shortcut === "s" ? null : "s")}
              active={shortcut === "s"}
            >
              S
            </ShortcutButton>
            <ShortcutButton
              active={shortcut === "d"}
              onClick={() => setShortcut(shortcut === "d" ? null : "d")}
            >
              D
            </ShortcutButton>
            <ShortcutButton
              active={shortcut === "f"}
              onClick={() => setShortcut(shortcut === "f" ? null : "f")}
            >
              F
            </ShortcutButton>
          </div>
        </Section>
        <Section>
          <Title>Model</Title>
          <div className="flex h-[40px] w-full select-none rounded border border-dark-gray">
            <button
              onClick={() => setModel("gpt-4")}
              className={clsx(
                "flex flex-1 items-center justify-center text-[13px]",
                models[0] === "gpt-4" && "bg-dark-gray text-white"
              )}
            >
              GPT 4
            </button>
            <button
              onClick={() => setModel("gpt-3.5-turbo")}
              className={clsx(
                "flex flex-1 items-center justify-center text-[13px]",
                models[0] === "gpt-3.5-turbo" && "bg-dark-gray text-white"
              )}
            >
              GPT 3.5
            </button>
          </div>
        </Section>
        <Section>
          <Title>Temperature (0-1)</Title>
          <input
            type="text"
            className={clsx(
              "text-input",
              isFaultyTemperature && "!border-2 !border-red"
            )}
            value={textTemperature}
            onChange={(e) => setTextTemperature(e.target.value)}
          />
        </Section>
        <Section>
          <Title>System prompt</Title>
          <textarea
            value={systemPrompt}
            className="text-input mb-4 min-h-[100px] py-2"
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </Section>
        <button
          disabled={disable}
          className={
            "h-[40px] rounded bg-dark-gray text-[16px] text-white enabled:hover:bg-dark-gray-hovered enabled:active:bg-dark-gray-active disabled:opacity-80"
          }
          onClick={onSubmit}
        >
          {isCreatingConfig ? "Create chat config" : "Update chat config"}
        </button>
      </div>
    </div>
  );
};

interface ShortcutButtonProps {
  active: boolean;
  children: string;
  onClick: () => void;
}
const ShortcutButton: FC<ShortcutButtonProps> = ({
  active,
  children,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex flex-1 items-center justify-center text-[13px]",
      active && "bg-dark-gray text-white"
    )}
  >
    {children}
  </button>
);

// interface ProviderConfigProps {}
// const ProviderConfig: FC = () => {
//   return (
//     <div>
//       <div></div>
//     </div>
//   );
// };

// interface ProviderListProps {}
// const ProviderList: FC = () => {
//   return (
//     <div>
//       <div></div>
//     </div>
//   );
// };

interface TitleProps {
  children: string;
}
const Title: FC<TitleProps> = ({ children }) => (
  <div className="mb-1 select-none text-[16px] font-medium">{children}</div>
);

interface SectionProps {
  children: ReactNode[] | ReactNode;
}
const Section: FC<SectionProps> = ({ children }) => (
  <div className="mb-5 flex flex-col">{children}</div>
);
