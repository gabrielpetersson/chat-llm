export interface GodModeAgentThoughtsMessage {
  type: "godmode-agent-thoughts";
  id: number;
  ts: number;
  conversationId: number;
  contents: {
    command: string;
    thoughts: { text: string; reasoning: string };
  };
}

export interface GodModeResultMessage {
  type: "godmode-agent-result";
  id: number;
  ts: number;
  conversationId: number;
  contents: {
    content: string;
  };
}

export interface GodModeUserFeedbackMessage {
  type: "godmode-user-feedback";
  id: number;
  ts: number;
  conversationId: number;
  contents: {
    role: "user";
    content: string;
  };
}

export interface GodModeGoalsMessage {
  type: "godmode-agent-goals";
  id: number;
  ts: number;
  conversationId: number;
  contents: {
    goals: string[];
  };
}

// class TestMessage {
//   constructor(type: "open-ai" | "claude", body: any) {
//     return new TestMessage1(body);
// if (type == "open-ai") {
//   return new TestMessage1(body);
// }
// if (type == "claude") {
//   return new TestMessage2(body);
// }
//   }
// }

// class TestMessage1 {
//   type: "open-ai";
//   body: string;
//   constructor(body: string) {
//     this.type = "open-ai";
//     this.body = body;
//   }
// }

// class TestMessage2 {
//   type: "claude";
//   body: { hey: string };
//   constructor(body: { hey: string }) {
//     this.type = "claude";
//     this.body = body;
//   }
// }

// const m = new TestMessage("open-ai", "hey");
// type M = TestMessage1 | TestMessage2;

// const f = (m: TestMessage) => {};

export interface OAIMessage {
  type: "open-ai";
  id: number;
  ts: number;
  conversationId: number;
  contents: {
    role: "user" | "assistant" | "system";
    content: string;
  };
}
export type Message =
  | OAIMessage
  | GodModeAgentThoughtsMessage
  | GodModeResultMessage
  | GodModeUserFeedbackMessage
  | GodModeGoalsMessage;
export type AddMessage = Omit<Message, "id">;

export interface Conversation {
  id: number;
  ts: number;
  chatConfigId?: number;
  title?: string;
}
export type AddConversation = Omit<Conversation, "id">;

export interface GodModeProvider {
  type: "godmode";
  description: string;
}

export interface OAIProvider {
  type: "open-ai";
  model: "gpt-3.5-turbo" | "gpt-4"; // TODO(gab): add completions etc
  systemPrompt: string;
  temperature: number;
}

export type ChatConfigProvider = OAIProvider | GodModeProvider;
export interface ChatConfig {
  id: number;
  ts: number;
  title: string;
  shortcut?: string | null;
  providers: ChatConfigProvider[];
}
export type AddChatConfig = Omit<ChatConfig, "id">;
