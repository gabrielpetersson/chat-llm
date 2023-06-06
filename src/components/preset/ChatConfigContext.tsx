import React, { createContext, useContext, FC, useState } from "react";
import { Preset } from "../../db";

interface ChatConfigContextState {
  preset: Omit<Preset, "id" | "ts">;
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
  initialPreset?: Preset;
  onSubmit: (preset: Omit<Preset, "id" | "ts">) => void;
}
export const ChatConfigProvider: FC<Props> = ({
  children,
  initialPreset,
  onSubmit,
}) => {
  const [preset, setPreset] = useState<Omit<Preset, "id" | "ts">>(
    initialPreset ?? {
      title: "",
      models: ["gpt-4"],
      systemPrompt: "",
      temprature: 1.0,
      shortcut: null,
    }
  );

  const setTitle = (title: string) => {
    setPreset((p) => ({ ...p, title }));
  };
  const setModel = (model: "gpt-4" | "gpt-3.5-turbo") => {
    setPreset((p) => ({ ...p, models: [model] }));
  };
  const setSystemPrompt = (systemPrompt: string) => {
    setPreset((p) => ({ ...p, systemPrompt }));
  };
  const setTemperature = (temperature: number) => {
    // TODO: typo in db
    setPreset((p) => ({ ...p, temprature: temperature }));
  };
  const setShortcut = (shortcut: string | null) => {
    setPreset((p) => ({ ...p, shortcut }));
  };
  const submit = () => {
    onSubmit(preset);
  };
  return (
    <ChatConfigContext.Provider
      value={{
        preset,
        isCreatingConfig: initialPreset == null,
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
export const usePresetConfigContext = () => {
  const context = useContext(ChatConfigContext);
  if (context == null) {
    throw new Error("no chat config context");
  }
  return context;
};
