import React, { createContext, useContext, FC, useState } from "react";
import { ChatConfig } from "../../db";

interface ChatConfigContextState {
  chatConfig: Omit<ChatConfig, "id" | "ts">;
  isCreatingConfig: boolean;
  setTitle: (title: string) => void;
  setSystemPrompt: (systemPrompt: string) => void;
  setTemperature: (temperature: number) => void;
  setShortcut: (shortcut: string | null) => void;
  setModel: (model: "gpt-4" | "gpt-3.5-turbo") => void;
  submit: () => void;
}

const ChatConfigContext = createContext<ChatConfigContextState | null>(null);

interface Props {
  children: React.ReactNode;
  initialChatConfig?: ChatConfig;
  onSubmit: (chatConfig: Omit<ChatConfig, "id" | "ts">) => void;
}
export const ChatConfigProvider: FC<Props> = ({
  children,
  initialChatConfig,
  onSubmit,
}) => {
  const [chatConfig, setChatConfig] = useState<Omit<ChatConfig, "id" | "ts">>(
    initialChatConfig ?? {
      title: "",
      models: ["gpt-4"],
      systemPrompt: "",
      temprature: 1.0,
      shortcut: null,
    }
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
  const submit = () => {
    onSubmit(chatConfig);
  };
  return (
    <ChatConfigContext.Provider
      value={{
        chatConfig: chatConfig,
        isCreatingConfig: initialChatConfig == null,
        setTitle,
        setSystemPrompt,
        setTemperature,
        setShortcut,
        setModel,
        submit,
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
