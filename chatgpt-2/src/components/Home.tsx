import { useEffect } from "react";
import { Panes } from "./Chat/Panes";
import { ConversationList } from "./Conversations";
import { dbSelectFirstConversation } from "../db/db-selectors";
import { useAppDispatch } from "../state/store";
import { openConversation } from "../state/conversations";
import { useLocalStorage } from "./hooks/useLocalStorage";

const OpenAIKeyInput = () => {
  const [storedKey, setStoredKey] = useLocalStorage("openai-key", "");

  return (
    <div className="flex h-[70px] cursor-pointer items-center justify-center">
      <input
        value={storedKey}
        type={"password"}
        onChange={(e) => setStoredKey(e.target.value)}
        placeholder="Enter your key"
        className="dark:dark-gray h-[40px] w-full max-w-[300px] rounded-md border border-black/10 border-orange-900 bg-white px-2 shadow-[0_0_10px_rgba(0,0,0,0.10)] outline-none dark:border-gray-900/50 dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
      />
    </div>
  );
};

export const Home = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    (async () => {
      const conversation = await dbSelectFirstConversation();
      if (conversation) {
        dispatch(openConversation(conversation.id));
      }
    })();
  }, [dispatch]);
  return (
    <main className={`flex flex-1`}>
      <div className="grid flex-1 grid-cols-[minmax(200px,350px)_minmax(500px,1fr)] grid-rows-[1fr]">
        <div className="flex flex-col bg-dark-gray p-3">
          <ConversationList />
          <OpenAIKeyInput />
        </div>
        <div className="flex min-h-0 bg-white">
          <Panes />
        </div>
        {/* <div className="flex bg-dark-gray"><p>{keyT}</p></div> */}
      </div>
    </main>
  );
};
