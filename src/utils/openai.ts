const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

type OpenAIMessage = { role: string; content: string };
export const openaiQuery = async (
  messages: OpenAIMessage[],
  options: { maxTokens?: number; model?: string; temperature?: number } = {
    maxTokens: 1000,
    model: "gpt-3.5-turbo",
    temperature: 0,
  }
) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getOpenAIKey()}`,
    },
    body: JSON.stringify({
      messages,
      temperature: options.temperature,
      model: options.model,
      max_tokens: options.maxTokens,
      top_p: 0.5,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  };
  const response = await fetch(OPENAI_ENDPOINT, requestOptions);
  if (response.status > 299 || response.status < 200) {
    console.error(response, "not readable");
    window.alert("Error calling open ai. Try re-entering your key.");
    throw new Error("OpenAI API error");
  }

  const res = await response.json();
  return res.choices[0].message.content;
};

export const openaiQueryStream = async (
  messages: OpenAIMessage[],
  onDelta: (delta: string) => void,
  {
    maxTokens = 2000,
    model = "gpt-3.5-turbo",
    temperature = 0,
  }: { maxTokens?: number; model?: string; temperature?: number } = {}
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
      temperature,
      model: model,
      max_tokens: maxTokens,
      top_p: 0.5,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    }),
    signal: controller.signal,
  };
  const response = await fetch(OPENAI_ENDPOINT, requestOptions);
  if (response.status > 299 || response.status < 200) {
    console.error(response);
    window.alert("Error calling open ai. Try re-entering your key.");
    throw new Error(
      `OpenAI API error - ${response.status}: ${response.statusText}`
    );
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

export const OPEN_AI_KEY = "openai-key";
export const setOpenAIKey = (key: string) => {
  localStorage.setItem(OPEN_AI_KEY, key);
};

export const getOpenAIKey = () => {
  const key = localStorage.getItem(OPEN_AI_KEY);
  if (key == null) {
    window.alert("Please enter your OpenAI API key");
    throw new Error("OpenAI API key not set");
  }
  return key;
};
