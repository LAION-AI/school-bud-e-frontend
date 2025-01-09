import { Handlers } from "$fresh/server.ts";

const STT_KEY = Deno.env.get("STT_KEY") || "";
const STT_MODEL = Deno.env.get("STT_MODEL") || "";
const STT_URL = Deno.env.get("STT_URL") || "";

export const handler: Handlers = {
  async POST(req) {
    try {
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File;
      let sttUrl = formData.get("sttUrl") as string || STT_URL;
      const sttKey = formData.get("sttKey") as string || STT_KEY;
      let sttModel = formData.get("sttModel") as string || STT_MODEL;

      if (sttKey.startsWith("gsk_")) {
        sttUrl = sttUrl == "" ? "https://api.groq.com/openai/v1/audio/transcriptions" : sttUrl;
        sttModel = sttModel == "" ? "whisper-large-v3-turbo" : sttModel;
      }

      if (!audioFile) {
        return new Response("No audio file uploaded", { status: 400 });
      }

      if (!sttKey) {
        return new Response("Missing STT API key", { status: 400 });
      }

      // Create new FormData for the STT API request
      const sttFormData = new FormData();
      sttFormData.append("file", audioFile);
      sttFormData.append("model", sttModel);

      // Make the fetch request to STT API
      const response = await fetch(sttUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sttKey}`,
        },
        body: sttFormData,
      });

      if (!response.ok) {
        throw new Error(`STT API responded with status: ${response.status}`);
      }

      const transcription = await response.json();

      return new Response(transcription.text, {
        status: 200,
        headers: { "Content-Type": "application/text" },
      });
    } catch (error) {
      console.error("Error transcribing audio file:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
