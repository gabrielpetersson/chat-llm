import { Chat } from "./Chat/ChatPane";
import { ConversationList } from "./Conversations";

export const Home = () => {
  return (
    <main className={`flex flex-1`}>
      <div className="grid flex-1 grid-cols-[minmax(200px,300px)_minmax(500px,1fr)_200px] grid-rows-[1fr]">
        <div className="flex bg-dark-gray">
          <ConversationList />
        </div>
        <div className="flex min-h-0 bg-white">
          <Chat />
        </div>
        <div className="flex bg-dark-gray">{/* <p>{keyT}</p> */}</div>
      </div>
    </main>
  );
};
