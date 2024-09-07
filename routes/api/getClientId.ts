import { Handlers } from "$fresh/server.ts";

const STYLE_TTS_SERVER_URL = Deno.env.get("SERVER_URL"); // Replace with your server's IP and port
const SERVER_API_KEY = Deno.env.get("SERVER_API_KEY") || "";

async function getClientId() {
    let client_id: string | null = null;
    try {
        const response = await fetch(
            `${STYLE_TTS_SERVER_URL}/generate_client_id`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": SERVER_API_KEY,
                },
                body: JSON.stringify({
                    LLM_Config: {/* ... */},
                    TTS_Config: {/* ... */},
                    Skills: "# Skills content would go here",
                    Conversation_History: [],
                    Scratchpad: {},
                    System_Prompt: "# System prompt content would go here",
                    API_Key: SERVER_API_KEY,
                }),
            },
        );
        const response_json = await response.json();
        client_id = response_json.client_id;
    } catch (error) {
        console.error(`Error in getClientId: ${error}`);
        return null;
    } finally {
        console.log("Client ID:", client_id);
    }
    return client_id;
}

export const handler: Handlers = {
    async POST() {
        const client_id = await getClientId();

        // save audioData to local file
        // Deno.writeFile("./audio.wav", audioData);

        if (client_id) {
            const response = new Response(JSON.stringify({ "client_id": client_id }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
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
