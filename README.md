# Chat LLM (better chatgpt) - [Try it](https://chatgpt-2-lac.vercel.app/)
1. Create _chat configs_ with system prompts and temperature, open a new chat with a config in one click
3. Hold command while clicking to open chat in a new pane
4. Ask multiple questions at the same time, in the same or in different chats
5. Use shortcuts to open any chat config
<img width="1710" alt="image" src="https://github.com/gabrielpetersson/chatgpt-2/assets/46445785/ab433b7f-48a5-4b6f-8470-89dff00ee77e">

https://chatgpt-2-lac.vercel.app/
### What this project is and what it is not
1. It's a chat UI for engineers and power users of chatgpt, with the hypothesis that creating new chats with the right config fast, and being able to send multiple questions at the same time is the best way of using chatgpt.
2. The philosophy is that the UI should only contain features that are _frequently used_, i.e. first-class support for general agents is not relevant since basically no one uses it day to day (for now) to do actual work. 
3. It has only mission critical UI - there are no message bubbles or message icons taking up space, and there is no need for a send button, we all use enter, and so on. 

### TODO
1. Remove/edit chats
2. Make messages that are out of context red
3. Click a message to fork the conversation into a new conversation in another pane
4. Expandable textarea for the message input
5. Make opening in new pane work for shortcuts (i.e. alt+command+SHORTCUT)
6. Query GPT4, Claude, and serpapi at the same time and show them side by side (opt-in ofc)



