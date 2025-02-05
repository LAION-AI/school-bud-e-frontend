import { PageProps } from "$fresh/server.ts";
import { useEffect, useState } from "preact/hooks";
import { Game } from "../components/Game.tsx";

interface SavedGame {
  id: string;
  name: string;
  code: string;
  timestamp: string;
  totalPoints: number;
}

export default function SavedGames() {
  const [savedGames, setSavedGames] = useState([]);

  useEffect(() => {
    fetchGames();
  },[]);

  const fetchGames = async () => {
    let savedGames: SavedGame[] = [];
    try {
      const response = await fetch(`/api/game`);
      const data = await response.json();
      savedGames = data || [];
      setSavedGames(savedGames);
    } catch (error) {
      console.error('Error fetching saved games:', error);
    }
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Saved Games</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedGames.map((game) => (
          <a 
            key={game.id} 
            href={`/games/${game.id}/?id=${game.id}`}
            class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <h2 class="text-xl font-semibold mb-2">{game.name}</h2>
            <p class="text-gray-600 mb-2">Created: {new Date(game.timestamp).toLocaleDateString()}</p>
            <p class="text-green-600 font-medium mb-4">Total Points: {game.totalPoints}</p>
          </a>
        ))}
      </div>
      {savedGames.length === 0 && (
        <p class="text-gray-500 text-center mt-8">No saved games found. Create and save a game to see it here!</p>
      )}
    </div>
  );
}