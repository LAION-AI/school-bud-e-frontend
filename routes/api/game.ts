import { Handlers } from "$fresh/server.ts";

interface GameData {
  type: string;
  code: string;
  filename?: string;
}

export const handler: Handlers = {
  async POST(req: Request) {
    try {
      const payload = await req.json() as GameData;

      if (!payload.type || payload.type !== "game" || !payload.code) {
        return new Response("Invalid game data", { status: 400 });
      }

      // Generate a unique filename if not provided
      const filename = payload.filename || `game-${Date.now()}.js`;
      const gamePath = `static/games/${filename}`;

      // Ensure the games directory exists
      try {
        await Deno.mkdir("static/games", { recursive: true });
      } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
          throw error;
        }
      }

      // Write the game code to file
      await Deno.writeTextFile(gamePath, payload.code);

      return new Response(JSON.stringify({
        success: true,
        filename: filename,
        path: gamePath
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("Error creating game file:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};