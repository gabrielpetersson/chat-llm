import { Panes } from "./pane/Pane";
import { ConversationList } from "./conversations/Conversations";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { ChatConfigList } from "./chat-config/ChatConfigList";
import { OpenAIKeyInput } from "./OpenAIKey";
import { OPEN_AI_KEY } from "../utils/openai";

export const Home = () => {
  const [storedKey, setStoredKey] = useLocalStorage(OPEN_AI_KEY, "");
  return (
    <main className={`flex flex-1`}>
      <div className="grid flex-1 grid-cols-[minmax(200px,300px)_minmax(500px,1fr)] grid-rows-[1fr]">
        <div className="flex min-h-0 flex-col bg-dark-gray p-[8px]">
          <ChatConfigList />
          <div className="shrink-0 truncate py-1 text-[12px] text-white opacity-50">
            {"Hold ⌘ to open chat in new pane"}
          </div>
          <hr className="border-t-gray-500" />
          <ConversationList />
          <a
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
            className="my-2 text-white underline hover:text-gray-200"
          >
            Click to get api key
          </a>
          <OpenAIKeyInput value={storedKey} onChange={setStoredKey} />
        </div>
        <div className="flex min-h-0 bg-white">
          <Panes />
        </div>
      </div>
    </main>
  );
};
////
//
