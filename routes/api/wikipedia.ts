import { Handlers } from "$fresh/server.ts";

const WIKIPEDIA_API_URL = "http://37.27.128.150:9999/search";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const handler: Handlers = {
  async GET(req: Request) {
    try {
      const url = new URL(req.url);
      const text = url.searchParams.get("text");
      const collection = url.searchParams.get("collection") || "English-ConcatX-Abstract";
      const n = parseInt(url.searchParams.get("n") || "2", 10);

      if (!text) {
        throw new Error("Text parameter is required");
      }

      const response = await fetch(WIKIPEDIA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, collection, n }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in wikipedia API:", error);
      return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  async POST(req: Request) {
    try {
      const payload = await req.json();
      if (!payload.text) {
        throw new Error("Text parameter is required");
      }

      console.log("Payload:", payload);

      const response = await fetch(WIKIPEDIA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payload.text,
          collection: payload.collection || "English-ConcatX-Abstract",
          n: payload.n || 2,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in wikipedia API:", error);
      return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};