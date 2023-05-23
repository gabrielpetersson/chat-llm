import { useEffect } from "react";
import { Panes } from "./pane/Panes";
import { ConversationList } from "./conversations/Conversations";
import { dbSelectFirstConversation } from "../db/db-selectors";
import { useAppDispatch } from "../state/store";
import { openConversation } from "../state/conversations";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Presets } from "./preset/Preset";
import { OpenAIKeyInput } from "./OpenAIKey";

export const Home = () => {
  const [storedKey, setStoredKey] = useLocalStorage("openai-key", "");
  const dispatch = useAppDispatch();

  useEffect(() => {
    // NOTE(gab): opens the latest conversation on load
    (async () => {
      const conversation = await dbSelectFirstConversation();
      if (conversation != null) {
        dispatch(openConversation(conversation.id, { openInNewPane: true }));
      }
    })();
  }, [dispatch]);
  return (
    <main className={`flex flex-1`}>
      <div className="grid flex-1 grid-cols-[minmax(200px,300px)_minmax(500px,1fr)] grid-rows-[1fr]">
        <div className="flex min-h-0 flex-col bg-dark-gray p-[8px]">
          <Presets />
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
