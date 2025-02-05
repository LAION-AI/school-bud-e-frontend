import { Handlers } from "$fresh/server.ts";
import { join } from "https://deno.land/std@0.201.0/path/mod.ts";

interface GameData {
  code: string;
  name?: string;
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

export const handler: Handlers = {
  async PUT(req: Request) {
    try {
      const payload = await req.json();
      if (!payload.id || !payload.code) {
        return new Response(JSON.stringify({
          success: false,
          error: "Game ID and code are required"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const savedGamesPath = join(Deno.cwd(), "static", "saved-games.json");
      let savedGames: SavedGamesData;

      try {
        const savedGamesContent = await Deno.readTextFile(savedGamesPath);
        savedGames = JSON.parse(savedGamesContent);
      } catch (error) {
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

      savedGames.games[gameIndex].code = payload.code;
      await Deno.writeTextFile(savedGamesPath, JSON.stringify(savedGames, null, 2));

      return new Response(JSON.stringify({
        success: true,
        game: savedGames.games[gameIndex]
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("Error updating game name:", error);
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

      const savedGamesPath = join(Deno.cwd(), "static", "saved-games.json");
      let savedGames: SavedGamesData;

      try {
        const savedGamesContent = await Deno.readTextFile(savedGamesPath);
        savedGames = JSON.parse(savedGamesContent);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          savedGames = { games: [] };
        } else {
          throw error;
        }
      }

      const newGame: SavedGame = {
        id: crypto.randomUUID(),
        name: payload.name,
        code: payload.code,
        timestamp: new Date().toISOString(),
        totalPoints: 0
      };

      savedGames.games.push(newGame);
      await Deno.writeTextFile(savedGamesPath, JSON.stringify(savedGames, null, 2));

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
      const games = await Deno.readFile("static/saved-games.json");
      const list = JSON.parse(new TextDecoder().decode(games));

      return new Response(JSON.stringify(Object.values(list.games)), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error listing games:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error? error.message : String(error)
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
      const savedGamesPath = join(Deno.cwd(), "static", "saved-games.json"); 
      let savedGames: SavedGamesData;
      try {
        const savedGamesContent = await Deno.readTextFile(savedGamesPath);
        savedGames = JSON.parse(savedGamesContent);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          savedGames = { games: [] };
        } else {
          throw error;
        }
      }
      const updatedGames = savedGames.games.filter(game => game.id !== gameId);
      savedGames.games = updatedGames;
      await Deno.writeTextFile(savedGamesPath, JSON.stringify(savedGames, null, 2));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error deleting game:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};