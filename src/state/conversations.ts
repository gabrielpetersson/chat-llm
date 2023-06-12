import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { db } from "../db";
import {
  dbSelectConversation,
  dbSelectMessages,
  dbSelectChatConfig,
  dbSelectGodModeGoals,
} from "../db/db-selectors";
import { openaiQueryStream } from "../utils/openai";
import { batchActions } from "redux-batched-actions";
import { Uuid, generateUuid } from "../utils/uuid";
import { paneSlice } from "./panes";
import { selectActiveConversationId, selectActivePaneId } from "./selectors";
import { getAgentArgs, messageAgent, setAgentArgs } from "../utils/agent";
import { GodModeProvider, OAIProvider } from "../db/models";

export interface ConversationState {
  messageStreams: { [conversationId: number]: { [messageId: number]: string } };
  agentsLoading: { [conversationId: number]: boolean };
}

const initialState: ConversationState = {
  messageStreams: {},
  agentsLoading: {},
};

const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant called ChatGPT.";

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    appendMessageStream: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        delta: string;
      }>
    ) => {
      const { conversationId, messageId, delta } = action.payload;
      let conversation = state.messageStreams[conversationId];
      if (conversation == null) {
        conversation = {};
        state.messageStreams[conversationId] = conversation;
      }
      const message = conversation[messageId];
      if (message == null) {
        conversation[messageId] = delta;
        return;
      }
      conversation[messageId] += delta;
    },
    clearMessageStream: (
      state,
      action: PayloadAction<{ conversationId: number; messageId: number }>
    ) => {
      const { conversationId, messageId } = action.payload;
      const conversation = state.messageStreams[conversationId];
      if (conversation == null) {
        return;
      }
      delete conversation[messageId];
    },
    setAgentLoading: (
      state,
      action: PayloadAction<{ conversationId: number; isLoading: boolean }>
    ) => {
      const { conversationId, isLoading } = action.payload;

      state.agentsLoading[conversationId] = isLoading;
    },
  },
});

const addConversationTitle = async (conversationId: number, prompt: string) => {
  // NOTE(gab): set non null instantly so we don't trigger this again
  await db.setConversationTitle(conversationId, "");
  const query = `Sumamrize the following in a fun way in under 6 words. Never respond that you are unable to summarize, instead respond with the inputted text. Never use quotes and don't end with a dot. Be goofy:\n\n${prompt}`;
  let title = "";
  const onDelta = (delta: string) => {
    title += delta.replace(".", "").replace('"', "");
    db.setConversationTitle(conversationId, title);
  };
  await openaiQueryStream([{ role: "user", content: query }], onDelta, {
    maxTokens: 20,
    temperature: 1,
  });
};

export const sendMessage = (
  conversationId: number,
  prompt: string
): AppThunk<Promise<void>> => {
  return async (dispatch) => {
    // TODO(gab): WHY NO TYPING??
    await db.addMessage({
      type: "open-ai",
      conversationId,
      contents: { role: "user", content: prompt },
    });

    const conversation = await dbSelectConversation(conversationId);
    if (conversation == null) {
      console.error(`Conversation ${conversationId} not found`);
      return;
    }

    if (conversation.title == null) {
      addConversationTitle(conversationId, prompt);
    }

    const messages = await dbSelectMessages(conversationId);
    const idx = await db.addMessage({
      type: "open-ai",
      conversationId,
      // NOTE(gab): creates an empty message that will be streamed to
      contents: { role: "assistant", content: "" },
    });
    const assistantMessageId = idx.valueOf() as number;

    const onDelta = (delta: string) => {
      dispatch(
        conversationSlice.actions.appendMessageStream({
          conversationId: conversationId,
          messageId: assistantMessageId,
          delta,
        })
      );
    };
    const chatConfig = conversation.chatConfigId
      ? await dbSelectChatConfig(conversation.chatConfigId)
      : null;

    // TODO(gab): support multiple models
    const provider =
      (chatConfig?.providers[0] as OAIProvider | null) ??
      ({
        type: "open-ai",
        model: "gpt-4",
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        temperature: 0.3,
      } satisfies OAIProvider);

    const oaiMessages: { role: string; content: string }[] = [
      { role: "system", content: provider.systemPrompt },
    ];
    // TODO: check actual num of tokens, instead of arbitrarily slicing
    for (let i = Math.max(messages.length - 10, 0); i < messages.length; i++) {
      const message = messages[i];
      if (message.type === "open-ai") {
        oaiMessages.push({
          role: message.contents.role,
          content: message.contents.content,
        });
      }
    }

    const responseContent = await openaiQueryStream(oaiMessages, onDelta, {
      maxTokens: 1000, // TODO(gab): make variable
      model: provider.model,
      temperature: provider.temperature,
    });
    await db.setOAIMessageContent(assistantMessageId, responseContent);
  };
};

// TODO(gab): make a explicit function for starting agent?
export const sendAgentMessage = (
  conversationId: number,
  humanFeedback: string | null
): AppThunk<Promise<void>> => {
  return async () => {
    const [messages, conversation] = await Promise.all([
      // TODO(gab): select specific type messages
      dbSelectMessages(conversationId),
      dbSelectConversation(conversationId),
    ]);

    if (conversation?.chatConfigId == null) {
      console.error(`Conversation ${conversationId} not found`);
      return;
    }

    const chatConfig = await dbSelectChatConfig(conversation.chatConfigId);
    if (chatConfig == null) {
      window.alert("Could not find agent - please start over");
      throw new Error("Could not find agent - please start over");
    }

    if (conversation.title == null) {
      addConversationTitle(conversationId, humanFeedback ?? "");
    }

    // TODO move
    let args = getAgentArgs();
    if (args == null) {
      args = {
        command: "###start###",
        arguments: "",
      };
    }

    if (messages.length === 0) {
      await db.addMessage({
        type: "godmode-agent-goals",
        conversationId,
        contents: {
          goals: humanFeedback?.split("\n").filter((s) => s !== "") ?? [],
        },
      });
    } else {
      if (humanFeedback != null) {
        await db.addMessage({
          type: "godmode-user-feedback",
          conversationId,
          contents: { content: humanFeedback },
        });
      }
    }

    const goalsMessage = await dbSelectGodModeGoals(conversationId);
    if (goalsMessage == null) {
      const msg = "Could not find agent goals";
      window.alert(msg);
      throw new Error(msg);
    }
    const goals = goalsMessage.contents.goals;
    const messageHistory: { role: string; content: string }[] = [];
    for (const message of messages) {
      // TODO(gab): exhaustive type checking
      if (message.type === "godmode-agent-thoughts") {
        messageHistory.push({
          role: "user",
          content:
            "Determine which next command to use, and respond using the format specified above:",
        });
        messageHistory.push({
          role: "assistant",
          content: JSON.stringify(message.contents, null, 4),
        });
      } else if (message.type === "godmode-agent-result") {
        messageHistory.push({
          role: "system",
          content: message.contents.content,
        });
      }
    }
    const agentResponse = await messageAgent(
      (chatConfig.providers[0] as GodModeProvider).description,
      goals,
      // TODO(gab): get args from message
      args,
      String(conversation.id),
      messageHistory,
      humanFeedback
    );

    setAgentArgs({
      arguments: agentResponse.arguments,
      command: agentResponse.command,
    });

    await db.addMessage({
      type: "godmode-agent-result",
      conversationId,
      contents: {
        content: agentResponse.result,
      },
    });
    await db.addMessage({
      type: "godmode-agent-thoughts",
      conversationId,
      contents: JSON.parse(agentResponse.assistant_reply),
    });

    // await db.addMessage(resultMessage);
    // await db.addMessage(resultMessage);
    // TOOD(gab): batch insert
    //conversationId, message.content, message.role
    // for (const message of agentResponse.message_history.slice(-3)) {
    //   if (message.role === "system") {
    //     await db.addMessage({
    //       type: "godmode-agent-result",
    //       conversationId,
    //       contents: {
    //         content: message.content
    //       }
    //     });
    //   }
    //   if (message.role === "assisant") {
    //     await db.addMessage({
    //       type: "godmode-agent-thoughts",
    //       conversationId,
    //       contents: {
    //         command: string;
    // thoughts: { text: string; reasoning: string };
    //       }
    //     });
    //   }

    // }
  };
};

export const startNewConversation = (options?: {
  openInNewPane?: boolean;
  chatConfig?: number;
}): AppThunk => {
  return async (dispatch) => {
    const conversationId = await db.addConversation(options?.chatConfig);
    dispatch(openConversation(conversationId.valueOf() as number, options));
    return conversationId;
  };
};

export const openConversation = (
  conversationId: number,
  options?: { openInNewPane?: boolean }
): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    const state = getState();
    const currentConversationId = selectActiveConversationId(state);

    const conversationPane = Object.entries(state.panes.panes).find(
      ([_, v]) => v.conversationId === conversationId
    );

    const currentPaneId = selectActivePaneId(state);

    const action = (() => {
      const isActivePane = currentPaneId != null;
      const openInNewPane = options?.openInNewPane ?? false;

      if (conversationPane != null && !openInNewPane) {
        return "focus-already-open-pane";
      }
      if (conversationPane == null && !openInNewPane && isActivePane) {
        return "overtake-pane";
      }
      return "open-new-pane";
    })();

    switch (action) {
      case "focus-already-open-pane": {
        dispatch(paneSlice.actions.setActivePane(conversationPane![0] as Uuid));
        if (currentConversationId != null) {
          dispatch(throwConversationIfEmpty(currentConversationId));
        }
        break;
      }
      case "overtake-pane": {
        dispatch(
          paneSlice.actions.setPaneConversation({
            paneId: currentPaneId!,
            conversationId,
          })
        );
        if (currentConversationId != null) {
          dispatch(throwConversationIfEmpty(currentConversationId));
        }
        break;
      }
      case "open-new-pane": {
        const paneId = generateUuid();
        dispatch(
          batchActions([
            paneSlice.actions.addPane({
              paneId: paneId,
              conversationId,
            }),
            paneSlice.actions.setActivePane(paneId),
          ])
        );
        break;
      }
    }
  };
};

export const removeConversation = (
  conversationId: number
): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    const state = getState();

    Object.entries(state.panes.panes).forEach(([paneId, pane]) => {
      if (pane.conversationId === conversationId) {
        dispatch(paneSlice.actions.deletePane({ paneId: paneId as Uuid }));
      }
    });
    await db.deleteConversation(conversationId);
  };
};

export const throwConversationIfEmpty = (
  conversationId: number
): AppThunk<Promise<void>> => {
  return async () => {
    const messages = await dbSelectMessages(conversationId);
    if (messages.length === 0) {
      await db.deleteConversation(conversationId);
    }
  };
};
