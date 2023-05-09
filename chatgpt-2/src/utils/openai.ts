import { MessageRole } from "../db";

type OpenAIMessage = { role: MessageRole; content: string };
export const openaiQuery = async (
  messages: OpenAIMessage[],
  options?: { maxTokens?: number }
) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getOpenAIKey()}`,
    },
    body: JSON.stringify({
      messages,
      temperature: 0.5,
      max_tokens: options?.maxTokens ?? 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.5,
      model: "gpt-3.5-turbo",
    }),
  };
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    requestOptions
  );
  if (response.status > 299 || response.status < 200) {
    window.alert("Error calling open ai. Try re-entering your key.");
    throw new Error("OpenAI API error");
  }

  const res = await response.json();
  return res.choices[0].message.content;
};

export const openaiQueryStream = async (
  messages: OpenAIMessage[],
  onDelta: (delta: string) => void,
  options?: { maxTokens?: number }
) => {
  const controller = new AbortController();
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getOpenAIKey()}`,
    },
    body: JSON.stringify({
      messages,
      temperature: 0.3,
      model: "gpt-3.5-turbo",
      max_tokens: options?.maxTokens ?? 1000,
      stream: true,
    }),
    signal: controller.signal,
  };
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    requestOptions
  );
  if (response.status > 299 || response.status < 200) {
    window.alert("Error calling open ai. Try re-entering your key.");
    throw new Error("OpenAI API error");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let messageStreamContent = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await reader?.read();
    if (res == null) {
      continue;
    }
    if (res.done) {
      break;
    }

    const data = decoder.decode(res.value);
    for (let line of data.split("\n")) {
      line = line.replace("data: ", "");
      if (line.length === 0 || line === "[DONE]") {
        continue;
      }
      const resp = JSON.parse(line);
      const content = resp.choices[0].delta.content;
      if (content == null) {
        continue;
      }
      messageStreamContent += content;
      onDelta(content);
    }
  }
  return messageStreamContent;
};

export const storeOpenAIKey = (key: string) => {
  localStorage.setItem("openai-key", key);
};

export const getOpenAIKey = () => {
  const key = localStorage.getItem("openai-key");
  if (key == null) {
    window.alert("Please enter your OpenAI API key");
    throw new Error("OpenAI API key not set");
  }
  return key;
};
