import { Handlers } from "$fresh/server.ts";
import { join } from "https://deno.land/std@0.201.0/path/mod.ts";
import KvStorage from "../../utils/kv_storage.ts"; // Modified import

interface GameData {
  code: string;
  name?: string;
  points?: number;
}

interface SavedGame {
  id: string;
  name: string;
  code: string;
  timestamp: string;
  totalPoints: number;
}

interface SavedGamesData {
  games: SavedGame[];
}

// const savedGamesPath = join(Deno.cwd(), "static", "saved-games.json"); // No longer needed
// const kvStorage = new KvStorage<SavedGamesData>(savedGamesPath); // No longer needed
const kvStorage = new KvStorage(); // Initialize KvStorage without path

export const handler: Handlers = {
  async PUT(req: Request) {
    try {
      const payload = await req.json();
      if (!payload.id) {
        return new Response(JSON.stringify({
          success: false,
          error: "Game ID is required"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      let savedGames: SavedGamesData | null = await kvStorage.read();
      if (!savedGames) {
        return new Response(JSON.stringify({
          success: false,
          error: "Could not read saved games file"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      const gameIndex = savedGames.games.findIndex(game => game.id === payload.id);
      if (gameIndex === -1) {
        return new Response(JSON.stringify({
          success: false,
          error: "Game not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Update code if provided
      if (payload.code) {
        savedGames.games[gameIndex].code = payload.code;
      }

      // Update points if provided
      if (typeof payload.points === 'number') {
        savedGames.games[gameIndex].totalPoints += payload.points;
      }
      await kvStorage.write(savedGames);

      return new Response(JSON.stringify({
        success: true,
        game: savedGames.games[gameIndex]
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("Error updating game:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  async POST(req: Request) {
    try {
      const payload = await req.json() as GameData;

      if (!payload.code || !payload.name) {
        return new Response("Invalid game data", { status: 400 });
      }

      let savedGames: SavedGamesData | null = await kvStorage.read();
      if (!savedGames) {
        savedGames = { games: [] }; // Initialize if file doesn't exist or is empty
      }

      const newGame: SavedGame = {
        id: crypto.randomUUID(),
        name: payload.name,
        code: payload.code,
        timestamp: new Date().toISOString(),
        totalPoints: payload.points || 0
      };

      savedGames.games.push(newGame);
      await kvStorage.write(savedGames);

      return new Response(JSON.stringify({
        success: true,
        game: newGame
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
  },
  async GET(_req) {
    try {
      const savedGames = await kvStorage.read();
      if (!savedGames || !savedGames.games) {
        return new Response(JSON.stringify([]), { // Return empty array if no games
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify(Object.values(savedGames.games)), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error listing games:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  async DELETE(req) {
    try {
      const url = new URL(req.url);
      const gameId = url.searchParams.get("id");
      if (!gameId) {
        return new Response("Invalid game ID", { status: 400 });
      }

      let savedGames: SavedGamesData | null = await kvStorage.read();
      if (!savedGames) {
        return new Response(JSON.stringify({ success: false, error: "No games data found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      const updatedGames = savedGames.games.filter(game => game.id !== gameId);
      savedGames.games = updatedGames;
      await kvStorage.write(savedGames);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error deleting game:", error);
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
