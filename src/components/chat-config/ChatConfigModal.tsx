import clsx from "clsx";
import { useState, MouseEventHandler, ReactNode, useEffect, FC } from "react";
import {
  ChatConfig,
  ChatConfigProvider,
  GodModeProvider,
  OAIProvider,
} from "../../db/models";
import j from "react-syntax-highlighter/dist/esm/languages/prism/j";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type ModalChatConfig = Omit<ChatConfig, "id" | "ts">;

interface ChatConfigModalProps {
  initialChatConfig?: ChatConfig;
  onClose: () => void;
  onSubmit: (chatConfig: ModalChatConfig) => void;
}

export const ChatConfigModal: FC<ChatConfigModalProps> = ({
  initialChatConfig,
  onClose,
  onSubmit,
}) => {
  const [chatConfig, setChatConfig] = useState<ModalChatConfig>(
    initialChatConfig ?? {
      title: "",
      shortcut: null,
      providers: [
        {
          type: "open-ai",
          model: "gpt-4",
          temperature: 0,
          systemPrompt: "You are a helpful bot",
        },
      ],
    }
  );

  const onClickDropshadow: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(chatConfig);
    onClose();
  };

  const addProvider = (type: ChatConfigProvider["type"]) => {
    const initProvider: ChatConfigProvider = (() => {
      switch (type) {
        case "open-ai": {
          return {
            type: "open-ai",
            model: "gpt-4",
            temperature: 0,
            systemPrompt: "You are a helpful bot",
          };
        }
        case "godmode": {
          return {
            type: "godmode",
            description: "Autonomous agent making the world a better place",
          };
        }
        default: {
          throw new Error("never");
        }
      }
    })();
    setChatConfig((p) => ({ ...p, providers: [...p.providers, initProvider] }));
  };

  // const removeProvider = () => {};

  // TODO(gab): disabled on invalid temperature
  const disabled = chatConfig.title === "";
  return (
    <div
      className="fixed left-0 top-0 flex h-screen w-screen cursor-pointer items-center justify-center bg-[rgba(0,0,0,0.4)]"
      onClick={onClickDropshadow}
    >
      <div
        className={clsx(
          "flex w-[800px] cursor-auto flex-col rounded bg-white p-4"
          // isAgent ? "w-[1000px]" : "w-[500px]"
        )}
      >
        <Section>
          <div className="flex items-center justify-between">
            <div className="mb-1 select-none text-title">Chat Config</div>
            <div className="flex items-center">
              {/* <button
                className={clsx(
                  "h-6 rounded border border-gray-400 px-2",
                  isAgent
                    ? "bg-dark-gray text-white"
                    : "hover:bg-[#fafafa] active:bg-[#f4f4f4]"
                )}
                onClick={toggleAgent}
              >
                {isAgent ? "Undo agent" : "Make agent"}
              </button> */}
              <div
                className="flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200"
                onClick={onClose}
              >
                <span className="material-symbols-outlined material-fat">
                  close
                </span>
              </div>
            </div>
          </div>
        </Section>
        <ChatConfigForm chatConfig={chatConfig} setChatConfig={setChatConfig} />
        <div className="w-8" />
        <div className="flex-1">
          <ProvidersForm
            chatConfig={chatConfig}
            setChatConfig={setChatConfig}
          />
          <AddProviderButton onSubmit={addProvider} />
        </div>
        <button
          disabled={disabled}
          className={
            "h-[40px] rounded bg-dark-gray text-[16px] text-white enabled:hover:bg-dark-gray-hovered enabled:active:bg-dark-gray-active disabled:opacity-80"
          }
          onClick={handleSubmit}
        >
          Create chat config
        </button>
      </div>
    </div>
  );
};

interface AddProviderButtonProps {
  onSubmit: (type: ChatConfigProvider["type"]) => void;
}
const AddProviderButton: FC<AddProviderButtonProps> = ({ onSubmit }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild tabIndex={-1}>
        <button className="mt-[-8px] flex items-center text-[11px] font-thin text-gray-500 outline-none">
          Add provider
          <span className="material-symbols-outlined pt-1 text-[16px]">
            add
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[150px] max-w-[300px] bg-white shadow-[0px_0px_3px_rgba(0,0,0,0.3)]">
          <DropdownMenu.Item className="w-full truncate border-b border-gray-300 bg-gray-100 p-2 text-[11px] outline-none">
            {"Select chat config"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              onSubmit("open-ai");
            }}
            className="w-full cursor-pointer truncate p-2 text-[11px] outline-none hover:bg-gray-100"
          >
            Open AI Chat
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              onSubmit("godmode");
            }}
            className="w-full cursor-pointer truncate p-2 text-[11px] outline-none hover:bg-gray-100"
          >
            God Mode
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

interface ProvidersFormProps {
  chatConfig: ModalChatConfig;
  setChatConfig: (chatConfig: ModalChatConfig) => void;
}
const ProvidersForm: FC<ProvidersFormProps> = ({
  chatConfig,
  setChatConfig,
}) => {
  return (
    <>
      {chatConfig.providers.map((provider) => {
        const setProvider = <Config extends ChatConfigProvider>(
          newProvider: Config
        ) => {
          // TODO: immer
          const newProviders = chatConfig.providers.slice();
          newProviders[j] = newProvider;
          setChatConfig({
            ...chatConfig,
            providers: newProviders,
          });
        };

        switch (provider.type) {
          case "open-ai": {
            return (
              <div className="rounded border border-gray-5 p-2">
                <OAIProviderForm
                  provider={provider}
                  setProvider={setProvider<OAIProvider>}
                />
              </div>
            );
          }
          case "godmode": {
            return (
              <div className="rounded border border-gray-5 p-2">
                <GodModeProviderForm
                  provider={provider}
                  setProvider={setProvider<GodModeProvider>}
                />
              </div>
            );
          }
          default: {
            throw new Error("never");
          }
        }
      })}
    </>
  );
};

interface ChatConfigFormProps {
  chatConfig: ModalChatConfig;
  setChatConfig: (provider: ModalChatConfig) => void;
}
const ChatConfigForm: FC<ChatConfigFormProps> = ({
  chatConfig,
  setChatConfig,
}) => {
  const { title, shortcut } = chatConfig;

  const setTitle = (title: string) => {
    setChatConfig({ ...chatConfig, title });
  };
  const setShortcut = (shortcut: string | null) => {
    setChatConfig({ ...chatConfig, shortcut });
  };
  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
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
              shortcut != null ? `⌥ + ${shortcut.toUpperCase()}` : "None"
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
      </div>
    </div>
  );
};

interface OAIProviderFormProps {
  provider: OAIProvider;
  setProvider: (provider: OAIProvider) => void;
}
const OAIProviderForm: FC<OAIProviderFormProps> = ({
  provider,
  setProvider,
}) => {
  const [textTemperature, setTextTemperature] = useState(
    provider.temperature.toString() ?? "1.0"
  );
  const setModel = (model: "gpt-4" | "gpt-3.5-turbo") => {
    setProvider({ ...provider, model });
  };
  const setSystemPrompt = (systemPrompt: string) => {
    setProvider({ ...provider, systemPrompt });
  };

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
    setProvider({ ...provider, temperature });
    // TODO: setPRocider dangerous dep
  }, [
    isFaultyTemperature,
    textTemperature,
    temperature,
    setProvider,
    provider,
  ]);
  return (
    <>
      <Section>
        <Title>Model</Title>
        <div className="flex h-[40px] w-full select-none rounded border border-dark-gray">
          <button
            onClick={() => setModel("gpt-4")}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              provider.model === "gpt-4" && "bg-dark-gray text-white"
            )}
          >
            GPT 4
          </button>
          <button
            onClick={() => setModel("gpt-3.5-turbo")}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              provider.model === "gpt-3.5-turbo" && "bg-dark-gray text-white"
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
          value={provider.systemPrompt}
          className="text-input mb-4 min-h-[100px] py-2"
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </Section>
    </>
  );
};

interface GodModeProviderFormProps {
  provider: GodModeProvider;
  setProvider: (provider: GodModeProvider) => void;
}
const GodModeProviderForm: FC<GodModeProviderFormProps> = ({
  provider,
  setProvider,
}) => {
  return (
    <div className="flex min-h-0 flex-col">
      <Section>
        <Title>Agent description</Title>
        <input
          type="text"
          className="text-input"
          value={provider.description}
          onChange={(e) =>
            setProvider({ ...provider, description: e.target.value })
          }
        />
      </Section>
      {/* <Section>
        <Title>Agent sub-goals</Title>
        <div className="flex max-h-[300px] flex-col overflow-y-auto">
          {agentConfig.goals.map((goal, i) => (
            <div className="flex items-center">
              <input
                key={i}
                type="text"
                className="text-input mb-2 flex-1"
                value={goal}
                onChange={(e) => setAgentGoal(i, e.target.value)}
              />
              <span
                className="material-symbols-outlined font ml-2 cursor-pointer select-none text-[20px]"
                onClick={() => removeAgentGoal(i)}
              >
                close
              </span>
            </div>
          ))}
        </div> */}
      {/* <button
          onClick={addAgentGoal}
          className="mt-2 self-start hover:opacity-80"
        >
          + Add goal
        </button>
      </Section> */}
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
