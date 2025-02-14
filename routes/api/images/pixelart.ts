import { Handlers } from "$fresh/server.ts";

interface PixelArtRequest {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  n?: number;
}

interface TogetherAPIResponse {
  data: Array<{
    b64_json: string;
  }>;
}

const TOGETHER_API_URL = "https://api.together.xyz/v1/images/generations";
const TOGETHER_API_KEY = Deno.env.get("TOGETHER_API_KEY") || "";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const handler: Handlers = {
  async POST(req: Request) {
    try {
      if (!TOGETHER_API_KEY) {
        throw new Error("TOGETHER_API_KEY is not configured");
      }

      const payload: PixelArtRequest = await req.json();
      
      if (!payload.prompt) {
        throw new Error("Prompt is required");
      }

      const requestBody = {
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: payload.prompt,
        width: payload.width || 416,
        height: payload.height || 416,
        steps: payload.steps || 7,
        n: payload.n || 1,
        response_format: "b64_json",
        update_at: new Date().toISOString()
      };

      const response = await fetch(TOGETHER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Together API error: ${response.status} ${response.statusText}`);
      }

      const data: TogetherAPIResponse = await response.json();

      return new Response(JSON.stringify({
        images: data.data.map(item => item.b64_json)
      }), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("Error in pixelart API:", error);
      return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};