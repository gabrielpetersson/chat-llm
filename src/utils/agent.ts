import { getOpenAIKey } from "./openai";

export interface AgentMessage {
  thoughts: {
    text: string;
    reasoning: string;
    plan: string;
    criticism: string;
    speak: string;
    relevant_goal: 1;
  };
  result: string; // added by us
  command: { name: string; args: { directory: string } };
}

export const messageAgent = async (
  description: string,
  goals: string[],
  args: AgentArgs,
  agentId: string,
  messages: { role: string; content: string }[],
  humanFeedback: string | null
) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept-Encoding", "gzip, deflate, br");

  const payload = {
    gpt_model: "gpt-3.5-turbo",
    command: args.command,
    arguments: args.arguments,
    assistant_reply: "",
    message_history: messages,
    ai_name: "GodmodeGPT",
    ai_description: description,
    ai_goals: goals,
    agent_id: agentId,
    openai_key: getOpenAIKey(),
  };
  if (humanFeedback != null) {
    payload.command = "human_feedback";
    payload.arguments = humanFeedback;
  }
  const raw = JSON.stringify(payload);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(
    "https://godmode-7y6flpzrmq-ue.a.run.app/api",
    requestOptions
  );

  const res = await response.json();
  console.log("args", res);
  return res;
};

// HUMAN FEEDBACK
//   {
//     "openai_key": "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",
//     "gpt_model": "gpt-3.5-turbo",
//     "command": "human_feedback",
//     "arguments": "Okay please don't do that\n",
//     "assistant_reply": "{\n    \"thoughts\": {\n        \"text\": \"After reviewing the resources on how to append text to a file in Python, I have determined that the best approach for my current task is to use the 'open' function with the 'a' mode to open the file in append mode, and then use the 'write' method to append the text to the file. I will use the 'write_to_file' command to implement this approach.\",\n        \"reasoning\": \"I reviewed the resources on how to append text to a file in Python and determined that the 'open' function with the 'a' mode and the 'write' method is the best approach for my current task. I will use the 'write_to_file' command to implement this approach.\",\n        \"plan\": \"- Use 'open' function with 'a' mode to open file in append mode\\n- Use 'write' method to append text to file\\n- Use 'write_to_file' command to implement approach\",\n        \"criticism\": \"I need to ensure that I am using the correct file name and path when using the 'write_to_file' command. I should also be mindful of the cost of each command and aim to complete tasks in the least number of steps.\",\n        \"speak\": \"I will use the 'write_to_file' command to append text to the file using the 'open' function with the 'a' mode and the 'write' method.\",\n        \"relevant_goal\": \"1\"\n    },\n    \"command\": {\n        \"name\": \"write_to_file\",\n        \"args\": {\n            \"filename\": \"example.txt\",\n            \"text\": \"This is a test.\"\n        }\n    }\n}",
//     "message_history": [
//         {
//             "role": "user",
//             "content": "Determine which next command to use, and respond using the format specified above:"
//         },
//         {
//             "role": "assistant",
//             "content": "{\n    \"thoughts\": {\n        \"text\": \"I need to determine which command to use next based on the current task at hand. I should review the goals and constraints to ensure I am staying within the parameters set for me. Once I have a clear understanding of the task, I can determine which command to use.\",\n        \"reasoning\": \"I need to review the goals and constraints to ensure I am staying within the parameters set for me. Once I have a clear understanding of the task, I can determine which command to use.\",\n        \"plan\": \"- Review goals and constraints\\n- Determine task at hand\\n- Choose appropriate command\",\n        \"criticism\": \"I need to ensure that I am not wasting time by choosing the wrong command. I should also be mindful of the cost of each command and aim to complete tasks in the least number of steps.\",\n        \"speak\": \"I am reviewing the goals and constraints to determine the appropriate command to use.\",\n        \"relevant_goal\": \"None\"\n    },\n    \"command\": {\n        \"name\": \"list_files\",\n        \"args\": {\n            \"directory\": \".\"\n        }\n    }\n}"
//         },
//         {
//             "role": "system",
//             "content": "Command list_files returned: []"
//         },
//         {
//             "role": "user",
//             "content": "Determine which next command to use, and respond using the format specified above:"
//         },
//         {
//             "role": "assistant",
//             "content": "{\n    \"thoughts\": {\n        \"text\": \"I need to determine which command to use next based on the current task at hand. I should review the goals and constraints to ensure I am staying within the parameters set for me. Once I have a clear understanding of the task, I can determine which command to use.\",\n        \"reasoning\": \"I need to review the goals and constraints to ensure I am staying within the parameters set for me. Once I have a clear understanding of the task, I can determine which command to use.\",\n        \"plan\": \"- Review goals and constraints\\n- Determine task at hand\\n- Choose appropriate command\",\n        \"criticism\": \"I need to ensure that I am not wasting time by choosing the wrong command. I should also be mindful of the cost of each command and aim to complete tasks in the least number of steps.\",\n        \"speak\": \"I am reviewing the goals and constraints to determine the appropriate command to use.\",\n        \"relevant_goal\": \"None\"\n    },\n    \"command\": {\n        \"name\": \"google\",\n        \"args\": {\n            \"query\": \"how to append text to a file in python\"\n        }\n    }\n}"
//         },
//         {
//             "role": "system",
//             "content": "Command google returned: [\n {\n  \"title\": \"Python append to a file - GeeksforGeeks\",\n  \"link\": \"https://www.geeksforgeeks.org/python-append-to-a-file/\",\n  \"snippet\": \"Using the shutil module: This approach uses the shutil.copyfileobj() method to append the contents of another file (source_file) to 'file.txt'.\"\n },\n {\n  \"title\": \"Python Program to Append to a File - Programiz\",\n  \"link\": \"https://www.programiz.com/python-programming/examples/append-to-file\",\n  \"snippet\": \"Open the file in append 'a' mode, and write to it using write() method. Inside write() method, a string \\\"new text\\\" is passed. This text is seen on the file ...\"\n },\n {\n  \"title\": \"python - How do I append to a file? - Stack Overflow\",\n  \"link\": \"https://stackoverflow.com/questions/4706499/how-do-i-append-to-a-file\",\n  \"snippet\": \"f = open('filename.txt', 'a') f.write('whatever you want to write here (in append mode) here.').\"\n },\n {\n  \"title\": \"How to Append to a File in Python - Spark By {Examples}\",\n  \"link\": \"https://sparkbyexamples.com/python/how-to-append-to-a-file-in-python/\",\n  \"snippet\": \"To append to a file in Python, you first need to open the file in append mode. You can do it with open() function. When opening the file, you ...\"\n },\n {\n  \"title\": \"Python Create File \\u2013 How to Append and Write to a Text File - freeCodeCamp\",\n  \"link\": \"https://www.freecodecamp.org/news/python-create-file-how-to-append-and-write-to-a-text-file/\",\n  \"snippet\": \"The best practice for writing to, appending to, and reading from text files in Python is using the with keyword. The general syntax looks like ...\"\n },\n {\n  \"title\": \"Append to File Python - Scaler Topics\",\n  \"link\": \"https://www.scaler.com/topics/append-to-file-python/\",\n  \"snippet\": \"We can open the file in append or write mode, so the file pointer will point to the end of the file. Then, using the write() function, append the newline ...\"\n },\n {\n  \"title\": \"Append Text to File in Python - PythonForBeginners.com\",\n  \"link\": \"https://www.pythonforbeginners.com/basics/append-text-to-file-in-python\",\n  \"snippet\": \"To append the text to the file, we will first open the file in append mode using the open() function. After that, we will pass the text and the ...\"\n },\n {\n  \"title\": \"How to append text to a file in python - Studytonight\",\n  \"link\": \"https://www.studytonight.com/python-howtos/how-to-append-text-to-a-file-in-python\",\n  \"snippet\": \"Example: Appending Text to a File. To append data, use the append mode(a+) in the open() function that allows writing the data to the existing file. It allows ...\"\n }\n]"
//         },
//         {
//             "role": "user",
//             "content": "Determine which next command to use, and respond using the format specified above:"
//         },
//         {
//             "role": "assistant",
//             "content": "{\n    \"thoughts\": {\n        \"text\": \"I have found several resources on how to append text to a file in Python. I should review them to determine the best approach for my current task. Once I have a clear understanding of the task and the best approach, I can determine which command to use.\",\n        \"reasoning\": \"I need to review the resources I found on how to append text to a file in Python to determine the best approach for my current task. Once I have a clear understanding of the task and the best approach, I can determine which command to use.\",\n        \"plan\": \"- Review resources on how to append text to a file in Python\\n- Determine best approach for current task\\n- Choose appropriate command\",\n        \"criticism\": \"I need to ensure that I am not wasting time by reviewing unnecessary resources. I should also be mindful of the cost of each command and aim to complete tasks in the least number of steps.\",\n        \"speak\": \"I am reviewing the resources on how to append text to a file in Python to determine the best approach for my current task.\",\n        \"relevant_goal\": \"1\"\n    },\n    \"command\": {\n        \"name\": \"google\",\n        \"args\": {\n            \"query\": \"python append text to file\"\n        }\n    }\n}"
//         },
//         {
//             "role": "system",
//             "content": "Command google returned: [\n {\n  \"title\": \"Python append to a file - GeeksforGeeks\",\n  \"link\": \"https://www.geeksforgeeks.org/python-append-to-a-file/\",\n  \"snippet\": \"This approach uses the shutil.copyfileobj() method to append the contents of another file (source_file) to 'file.txt'. This can be useful if you ...\"\n },\n {\n  \"title\": \"python - How do I append to a file? - Stack Overflow\",\n  \"link\": \"https://stackoverflow.com/questions/4706499/how-do-i-append-to-a-file\",\n  \"snippet\": \"f = open('filename.txt', 'a') f.write('whatever you want to write here (in append mode) here.').\"\n },\n {\n  \"title\": \"Python Program to Append to a File - Programiz\",\n  \"link\": \"https://www.programiz.com/python-programming/examples/append-to-file\",\n  \"snippet\": \"Open the file in append 'a' mode, and write to it using write() method. Inside write() method, a string \\\"new text\\\" is passed. This text is seen on the file ...\"\n },\n {\n  \"title\": \"Python Create File \\u2013 How to Append and Write to a Text File - freeCodeCamp\",\n  \"link\": \"https://www.freecodecamp.org/news/python-create-file-how-to-append-and-write-to-a-text-file/\",\n  \"snippet\": \"The best practice for writing to, appending to, and reading from text files in Python is using the with keyword. The general syntax looks like ...\"\n },\n {\n  \"title\": \"Append to File Python - Scaler Topics\",\n  \"link\": \"https://www.scaler.com/topics/append-to-file-python/\",\n  \"snippet\": \"Append-only mode is used to insert the text at the end of the file. It opens the file in append mode, and when the file is opened in append mode, the file ...\"\n },\n {\n  \"title\": \"Append Text to File in Python - PythonForBeginners.com\",\n  \"link\": \"https://www.pythonforbeginners.com/basics/append-text-to-file-in-python\",\n  \"snippet\": \"To append a text to a file using the write() method, we first need to open the file in append mode. For this, we will use the open() function ...\"\n },\n {\n  \"title\": \"How to append text or lines to a file in python? - thisPointer\",\n  \"link\": \"https://thispointer.com/how-to-append-text-or-lines-to-a-file-in-python/\",\n  \"snippet\": \"Open the file in append mode ('a'). Write cursor points to the end of file. \\u00b7 Append '\\\\n' at the end of the file using write() function \\u00b7 Append the given line to ...\"\n },\n {\n  \"title\": \"How to append text to a file in python - Studytonight\",\n  \"link\": \"https://www.studytonight.com/python-howtos/how-to-append-text-to-a-file-in-python\",\n  \"snippet\": \"To append data, use the append mode(a+) in the open() function that allows writing the data to the existing file. It allows to write and read the data from the ...\"\n }\n]"
//         },
//         {
//             "role": "user",
//             "content": "Determine which next command to use, and respond using the format specified above:"
//         },
//         {
//             "role": "assistant",
//             "content": "{\n    \"thoughts\": {\n        \"text\": \"After reviewing the resources on how to append text to a file in Python, I have determined that the best approach for my current task is to use the 'open' function with the 'a' mode to open the file in append mode, and then use the 'write' method to append the text to the file. I will use the 'write_to_file' command to implement this approach.\",\n        \"reasoning\": \"I reviewed the resources on how to append text to a file in Python and determined that the 'open' function with the 'a' mode and the 'write' method is the best approach for my current task. I will use the 'write_to_file' command to implement this approach.\",\n        \"plan\": \"- Use 'open' function with 'a' mode to open file in append mode\\n- Use 'write' method to append text to file\\n- Use 'write_to_file' command to implement approach\",\n        \"criticism\": \"I need to ensure that I am using the correct file name and path when using the 'write_to_file' command. I should also be mindful of the cost of each command and aim to complete tasks in the least number of steps.\",\n        \"speak\": \"I will use the 'write_to_file' command to append text to the file using the 'open' function with the 'a' mode and the 'write' method.\",\n        \"relevant_goal\": \"1\"\n    },\n    \"command\": {\n        \"name\": \"write_to_file\",\n        \"args\": {\n            \"filename\": \"example.txt\",\n            \"text\": \"This is a test.\"\n        }\n    }\n}"
//         }
//     ],
//     "ai_name": "GodmodeGPT",
//     "ai_description": "Test",
//     "ai_goals": [
//         "Testing4444",
//         "Hyey"
//     ],
//     "agent_id": "7a20d074-8edb-41d7-b184-a3a5e1707c0d"
// }

const AGENT_ARGS_KEY = "agent-args";
interface AgentArgs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arguments: unknown; // NOTE(gab): does not matter, will just shove into api
  command: string;
}

// TODO: put in db
export const setAgentArgs = (args: AgentArgs) => {
  localStorage.setItem(AGENT_ARGS_KEY, JSON.stringify(args));
};

export const getAgentArgs = (): AgentArgs | null => {
  const args = localStorage.getItem(AGENT_ARGS_KEY);
  if (args == null) {
    return null;
  }
  return JSON.parse(args); // TODO(gab): zod safe parsing
};
