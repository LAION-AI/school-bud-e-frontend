import { Handlers } from "$fresh/server.ts";
import { Buffer } from "npm:buffer";

const STYLE_TTS_SERVER_URL = Deno.env.get("SERVER_URL") || ""; 
const SERVER_API_KEY = Deno.env.get("SERVER_API_KEY") || "";

async function textToSpeech(text: string, clientId: string, voice: string): Promise<Buffer | null> {
    console.log("textToSpeech", text);
    console.log("clientId", clientId);
    try {
        const startTime = Date.now();
        // Send the text to the server
        const response = await fetch(`${STYLE_TTS_SERVER_URL}/generate_tts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": SERVER_API_KEY,
            },

            //// new endpoint /generate_tts
            body: JSON.stringify({
                sentence: text, // Corresponds to `sentence`
                client_id: clientId, // Replace with the actual client ID
                voice: voice
                // voice: "Stefanie", // Optional: specify the voice, default is "Stefanie"
                // speed: "normal", // Optional: specify the speed, default is "normal"
            }),
        });

        if (response.ok) {
            //// NEW SYNTHESIZE ENDPOINT
            const audioData = await response.arrayBuffer();
            console.log(
                "Audio file received, Latency:",
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
        const { text, clientId, voice } = await req.json();
        // console.log("Text:", text);

        if (!text) {
            return new Response("No text provided", { status: 400 });
        }

        const audioData = await textToSpeech(text, clientId, voice);

        if (audioData) {
            const response = new Response(audioData, {
                status: 200,
                headers: {
                    "Content-Type": "audio/wav",
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