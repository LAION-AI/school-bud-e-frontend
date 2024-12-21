import { Handlers } from "$fresh/server.ts";
import { ServerSentEventStream } from "https://deno.land/std@0.210.0/http/server_sent_event_stream.ts";

import { chatContent } from "../../internalization/content.ts";

// const API_URL = Deno.env.get("API_URL_TOGETHER") || "";
// const API_KEY = Deno.env.get("API_KEY_TOGETHER") || "";
// const API_MODEL = "MISTRALAI/MIXTRAL-8X22B-INSTRUCT-V0.1";
const API_URL = Deno.env.get("LLM_URL") || "";
const API_KEY = Deno.env.get("LLM_KEY") || "";
const API_MODEL = Deno.env.get("LLM_MODEL") || "";

const API_IMAGE_URL = Deno.env.get("VLM_URL") || "";
const API_IMAGE_KEY = Deno.env.get("VLM_KEY") || "";
const API_IMAGE_MODEL = Deno.env.get("VLM_MODEL") || "";
const API_IMAGE_CORRECTION_MODEL = Deno.env.get("VLM_CORRECTION_MODEL") || "";

// const CURRENT_DATETIME = new Date().toISOString();
// console.log(CURRENT_DATETIME, API_MODEL);

interface Message {
  role: string;
  content: string;
}

async function getModelResponseStream(messages: Message[], lang: string, llmApiUrl: string, llmApiKey: string, llmApiModel: string, systemPrompt: string, vlmApiUrl: string, vlmApiKey: string, vlmApiModel: string, vlmCorrectionModel: string) {
  let isLastMessageAssistant =
    messages[messages.length - 1].role === "assistant";
  while (isLastMessageAssistant) {
    messages.pop();
    isLastMessageAssistant = messages[messages.length - 1].role === "assistant";
  }

  // check if the LAST message has #correction or #korrektur in the content (case insensitive)
  const isCorrectionInLastMessage = hasKorrekturHashtag(messages);

  console.log("isCorrectionInLastMessage", isCorrectionInLastMessage);

  let useThisSystemPrompt = isCorrectionInLastMessage ? chatContent[lang].correctionSystemPrompt : chatContent[lang].systemPrompt;

  if (systemPrompt != "") {
    useThisSystemPrompt = systemPrompt;
  }

  console.log(useThisSystemPrompt);

  messages.unshift({
    role: "system",
    content: useThisSystemPrompt,
  });

  // looks for messages with array content that contains objects with a 'type' property set to 'image_url'

  const isImageInMessages = messages.some((message) => {
    if (Array.isArray(message.content)) {
      // Check if any item in the array has type "image_url"
      return message.content.some((item) => item.type === "image_url");
    } else if (
      typeof message.content === "object" && message.content !== null
    ) {
      // Check if single object has type "image_url"
      return (message.content as { type?: string }).type === "image_url";
    }
    return false;
  });

  let api_url = llmApiUrl != '' ? llmApiUrl : API_URL;
  let api_key = llmApiKey != '' ? llmApiKey : API_KEY;
  let api_model = llmApiModel != '' ? llmApiModel : API_MODEL;

  if (isImageInMessages) {
    api_url = vlmApiUrl != '' ? vlmApiUrl : API_IMAGE_URL;
    api_key = vlmApiKey != '' ? vlmApiKey : API_IMAGE_KEY;
    api_model = vlmApiModel != '' ? vlmApiModel : API_IMAGE_MODEL;
  }

  if (isCorrectionInLastMessage) {
    api_model = vlmCorrectionModel != '' ? vlmCorrectionModel : API_IMAGE_CORRECTION_MODEL;
  }

  const fetchOptions: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "messages": messages,
      "model": api_model,
      "stream": true,
    }),
  };

  // console.log("body", {
  //   "messages": messages,
  //   "model": API_MODEL,
  //   "stream": true,
  // });
  const response = await fetch(api_url, fetchOptions);

  if (!response.body) {
    return new Response("Failed to get response body from external API", {
      status: 500,
    });
  }

  if (response.status === 400) {
    console.log("Bad request");
    const res = await response.json();
    console.log(res);
    return new Response("Bad request", { status: 400 });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            lines.forEach((line: string) => {
              // console.log(line);
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                const jsonStr = line.substring(5); // Adjust to correctly parse your API response
                try {
                  const data = JSON.parse(jsonStr);
                  if (
                    data.choices[0] !== undefined &&
                    data.choices[0].delta.content !== undefined &&
                    data.choices[0].delta.content !== null
                  ) {
                    if (data.choices[0].delta.content === "<|im_end|>") {
                      console.log("End of model response!");
                      controller.close();
                    } else {
                      controller.enqueue(
                        {
                          data: JSON.stringify(
                            data.choices[0].delta.content,
                          ),
                          id: Date.now(),
                          event: "message",
                        },
                      );
                    }
                  }
                } catch (error: Error | unknown) {
                  console.error("Error parsing JSON:", error, jsonStr);
                  controller.close();
                }
              } else if (line === "data: [DONE]") {
                console.log("Closing controller!");
                controller.close();
              }
            });
          }
        } catch (_error) {
          // console.error("Error reading the stream", error);
          controller.close();
        }
      },
      cancel(err) {
        console.log("cancel", err);
        console.log("cancel");
      },
    }).pipeThrough(new ServerSentEventStream()),
    {
      headers: {
        "Content-Type": "text/event-stream",
      },
    },
  );
}

// deno-lint-ignore no-explicit-any
function hasKorrekturHashtag(messages: any[]): boolean {
  if (!messages || messages.length === 0) return false;
  
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || !lastMessage.content) return false;

  let content = '';
  
  // Handle different content formats
  if (typeof lastMessage.content === 'string') {
    content = lastMessage.content;
  } else if (Array.isArray(lastMessage.content)) {
    // Handle array of content objects
    const textContent = lastMessage.content.find(
      // deno-lint-ignore no-explicit-any
      (item: any) => item.type === 'text'
    );
    content = textContent?.text || '';
  }

  return content.toLowerCase().includes('#korrektur') || 
         content.toLowerCase().includes('#correction');
}

export const handler: Handlers = {
  async POST(req: Request) {
    const payload = await req.json();

    // console.log(payload.lang);

    // payload.messages.unshift({
    //   role: "system",
    //   content:
    //     "You are an intelligent and empathetic learning assistant. Always respond empathetically, friendly, curiously and appropriately to the school context. Respond briefly and to the point. Your name is BUD-E and you would be created by LAION. LAION is a non-profit organization for the democratization of open source AI. Try to keep the conversation friendly, educational and entertaining and to keep it running while taking into account previously said information. Respond briefly, concisely and to the point.",
    // });

    // console.log("Model used: ", API_MODEL);
    // console.log("payload messages", payload.messages);
    return getModelResponseStream(payload.messages, payload.lang, payload.llmApiUrl, payload.llmApiKey, payload.llmApiModel, payload.systemPrompt, payload.vlmApiUrl, payload.vlmApiKey, payload.vlmApiModel, payload.vlmCorrectionModel);
  },
};
