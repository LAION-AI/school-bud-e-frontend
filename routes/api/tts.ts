import { Handlers } from "$fresh/server.ts";
import { Buffer } from "npm:buffer";

const TTS_KEY = Deno.env.get("TTS_KEY") || "";
const TTS_URL = Deno.env.get("TTS_URL") || "";
const TTS_MODEL = Deno.env.get("TTS_MODEL") || "";

async function textToSpeech(
  text: string,
  textPosition: string,
  ttsUrl: string,
  ttsKey: string,
  ttsModel: string,
): Promise<Buffer | null> {
  const boldTextRegex = /\*\*(.*?)\*\*/g;
  text = String(text).replace(boldTextRegex, "$1");

  const buddyRegex = /bud-e/gi;
  text = text.replace(buddyRegex, "buddy");

  console.log("textToSpeech", text);
  console.log("textPosition", textPosition);
  console.log("ttsUrl", ttsUrl);
  console.log("ttsKey", ttsKey);
  console.log("ttsModel", ttsModel);

  const useThisTttsUrl = ttsUrl != '' ? ttsUrl : TTS_URL;
  const useThisTtsKey = ttsKey != '' ? ttsKey : TTS_KEY;
  const useThisTtsModel = ttsModel != '' ? ttsModel : TTS_MODEL;

  try {
    const startTime = Date.now();
    const response = await fetch(useThisTttsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${useThisTtsKey}`,
      },
      body: JSON.stringify({
        text: text,
        normalize: true,
        format: "mp3",
        reference_id: useThisTtsModel,
        mp3_bitrate: 64,
        opus_bitrate: -1000,
        latency: "normal",
      }),
    });

    if (response.ok) {
      const audioData = await response.arrayBuffer();
      console.log(
        `Audio file received for ${textPosition}, Latency:`,
        Date.now() - startTime,
      );
      return Buffer.from(audioData);
    } else {
      console.error(
        `Failed to synthesize speech. Status code: ${response.status}: ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(`Error in textToSpeech: ${error}`);
  }
  return null;
}

export const handler: Handlers = {
  async POST(req) {
    const { text, textPosition, ttsUrl, ttsKey, ttsModel } = await req.json();
    // console.log("Text:", text);

    if (!text) {
      return new Response("No text provided", { status: 400 });
    }

    const audioData = await textToSpeech(text, textPosition, ttsUrl, ttsKey, ttsModel);

    if (audioData) {
      const response = new Response(audioData, {
        status: 200,
        headers: {
          "Content-Type": "audio/mp3", // Changed from audio/wav to audio/mp3
        },
      });
      return response;
    } else {
      return new Response("Failed to synthesize speech", {
        status: 500,
      });
    }
  },
};
