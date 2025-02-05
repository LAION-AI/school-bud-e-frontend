import { Handlers } from "$fresh/server.ts";
import { join } from "https://deno.land/std@0.201.0/path/mod.ts";

interface GameScore {
  gameName: string;
  points: number;
  timestamp: string;
}

interface ScoreDatabase {
  scores: GameScore[];
  totalPoints: number;
}

// Initialize empty database structure
const defaultDb: ScoreDatabase = {
  scores: [],
  totalPoints: 0
};

// File path for the score database
const dbPath = join(Deno.cwd(), "static", "game-scores.json");

// Helper function to read the current database
async function readScoreDb(): Promise<ScoreDatabase> {
  try {
    const data = await Deno.readTextFile(dbPath);
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // If file doesn't exist, create it with default structure
      await Deno.writeTextFile(dbPath, JSON.stringify(defaultDb));
      return defaultDb;
    }
    throw error;
  }
}

// Helper function to write to the database
async function writeScoreDb(data: ScoreDatabase): Promise<void> {
  await Deno.writeTextFile(dbPath, JSON.stringify(data, null, 2));
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      console.log('Hey')
      
      // Validate request body
      if (!body.gameName || typeof body.points !== 'number') {
        return new Response(JSON.stringify({
          error: 'Invalid request body. Required fields: gameName (string) and points (number)'
        }), { status: 400 });
      }

      // Read current database
      const db = await readScoreDb();

      // Create new score entry
      const newScore: GameScore = {
        gameName: body.gameName,
        points: body.points,
        timestamp: new Date().toISOString()
      };

      // Update database
      db.scores.push(newScore);
      db.totalPoints += body.points;

      // Write updated data back to file
      await writeScoreDb(db);

      return new Response(JSON.stringify({
        success: true,
        totalPoints: db.totalPoints,
        message: `Added ${body.points} points for ${body.gameName}`
      }));

    } catch (error) {
      console.error('Error processing game score:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error'
      }), { status: 500 });
    }
  },

  async GET(_req) {
    try {
      const db = await readScoreDb();
      return new Response(JSON.stringify(db));
    } catch (error) {
      console.error('Error reading game scores:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error'
      }), { status: 500 });
    }
  }
};