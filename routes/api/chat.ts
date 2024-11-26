import { Handlers } from "$fresh/server.ts";
import { ServerSentEventStream } from "https://deno.land/std@0.210.0/http/server_sent_event_stream.ts";

import { chatContent } from "../../internalization/content.ts";

// const API_URL = Deno.env.get("API_URL_TOGETHER") || "";
// const API_KEY = Deno.env.get("API_KEY_TOGETHER") || "";
// const API_MODEL = "MISTRALAI/MIXTRAL-8X22B-INSTRUCT-V0.1";
const API_URL = Deno.env.get("API_URL") || "";
const API_KEY = Deno.env.get("API_KEY") || "";
const API_MODEL = Deno.env.get("API_MODEL") || "";

const CURRENT_DATETIME = new Date().toISOString();

console.log("ADDITION 4");
console.log(CURRENT_DATETIME, API_MODEL);

interface Message {
  role: string;
  content: string;
}

async function getModelResponseStream(messages: Message[]) {
  let isLastMessageAssistant =
    messages[messages.length - 1].role === "assistant";
  while (isLastMessageAssistant) {
    messages.pop();
    isLastMessageAssistant = messages[messages.length - 1].role === "assistant";
  }

  const fetchOptions: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "messages": messages,
      "model": API_MODEL,
      "stream": true,
    }),
  };

  // console.log("body", {
  //   "messages": messages,
  //   "model": API_MODEL,
  //   "stream": true,
  // });
  const response = await fetch(API_URL, fetchOptions);

  if (!response.body) {
    return new Response("Failed to get response body from external API", {
      status: 500,
    });
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
      cancel() {
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

export const handler: Handlers = {
  async POST(req: Request) {
    const payload = await req.json();

    console.log(payload.lang);

    // payload.messages.unshift({
    //   role: "system",
    //   content:
    //     "You are an intelligent and empathetic learning assistant. Always respond empathetically, friendly, curiously and appropriately to the school context. Respond briefly and to the point. Your name is BUD-E and you would be created by LAION. LAION is a non-profit organization for the democratization of open source AI. Try to keep the conversation friendly, educational and entertaining and to keep it running while taking into account previously said information. Respond briefly, concisely and to the point.",
    // });
    payload.messages.unshift({
      role: "system",
      content: chatContent[payload.lang].systemPrompt,
    });

    console.log("Model used: ", API_MODEL);
    console.log("payload messages", payload.messages);
    return getModelResponseStream(payload.messages);
  },
};
