import React, { createContext, useContext, FC, useState } from "react";
import { AgentConfig, ChatConfig } from "../../db";

type AddChatConfig = Omit<ChatConfig, "id" | "ts">;
type AddAgentConfig = Omit<AgentConfig, "id" | "ts" | "presetId">;

interface ChatConfigContextState {
  chatConfig: AddChatConfig;
  agentConfig: AddAgentConfig | null;
  isCreatingConfig: boolean;
  submit: () => void;
  toggleAgent: () => void;

  setTitle: (title: string) => void;
  setModel: (model: "gpt-4" | "gpt-3.5-turbo") => void;
  setShortcut: (shortcut: string | null) => void;
  setSystemPrompt: (systemPrompt: string) => void;
  setTemperature: (temperature: number) => void;

  addAgentGoal: (goal: string) => void;
  removeAgentGoal: (index: number) => void;
  setAgentDescription: (description: string) => void;
}

const ChatConfigContext = createContext<ChatConfigContextState | null>(null);

interface Props {
  children: React.ReactNode;
  initialChatConfig?: ChatConfig;
  initialAgentConfig?: AgentConfig;
  onSubmit: (
    chatConfig: AddChatConfig,
    agentConfig: AddAgentConfig | null
  ) => void;
}
export const ChatConfigProvider: FC<Props> = ({
  children,
  initialChatConfig,
  initialAgentConfig,
  onSubmit,
}) => {
  const [chatConfig, setChatConfig] = useState<AddChatConfig>(
    initialChatConfig ?? {
      title: "",
      models: ["gpt-4"],
      systemPrompt: "",
      temprature: 1.0,
      shortcut: null,
    }
  );
  const [agentConfig, setAgentConfig] = useState<AddAgentConfig | null>(
    initialAgentConfig ?? null
  );

  const setTitle = (title: string) => {
    setChatConfig((p) => ({ ...p, title }));
  };
  const setModel = (model: "gpt-4" | "gpt-3.5-turbo") => {
    setChatConfig((p) => ({ ...p, models: [model] }));
  };
  const setSystemPrompt = (systemPrompt: string) => {
    setChatConfig((p) => ({ ...p, systemPrompt }));
  };
  const setTemperature = (temperature: number) => {
    // TODO: typo in db
    setChatConfig((p) => ({ ...p, temprature: temperature }));
  };
  const setShortcut = (shortcut: string | null) => {
    setChatConfig((p) => ({ ...p, shortcut }));
  };
  const setAgentDescription = (description: string) => {
    setAgentConfig((p) => {
      if (p == null) {
        console.error("no agent");
        return p;
      }
      return { ...p, description };
    });
  };
  const addAgentGoal = (goal: string) => {
    setAgentConfig((p) => {
      if (p == null) {
        console.error("no agent");
        return p;
      }
      return { ...p, goals: [...p.goals, goal] };
    });
  };
  const removeAgentGoal = (index: number) => {
    setAgentConfig((p) => {
      if (p == null) {
        console.error("no agent");
        return p;
      }
      return { ...p, goals: p.goals.filter((_, i) => i !== index) };
    });
  };

  const toggleAgent = () => {
    setAgentConfig((p) => {
      if (p == null) {
        return {
          description: "Make the world a better place",
          goals: ["Testing", "testing"],
        };
      }
      return null;
    });
  };
  const submit = () => {
    onSubmit(chatConfig, agentConfig);
  };
  return (
    <ChatConfigContext.Provider
      value={{
        chatConfig: chatConfig,
        isCreatingConfig: initialChatConfig == null,
        agentConfig,
        submit,
        toggleAgent,

        setTitle,
        setModel,
        setShortcut,
        setTemperature,
        setSystemPrompt,

        addAgentGoal,
        removeAgentGoal,
        setAgentDescription,
      }}
    >
      {children}
    </ChatConfigContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChatConfigContext = () => {
  const context = useContext(ChatConfigContext);
  if (context == null) {
    throw new Error("no chat config context");
  }
  return context;
};
