import { Game as GameComponent } from "./Game.tsx";
import type { Game as GameType } from "../types/formats.ts";

interface GamePageProps {
  game: GameType;
}

export default function GamePage({ game }: GamePageProps) {
  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
          <h1 class="text-3xl font-bold text-white mb-2">{game.title}</h1>
          <div class="flex space-x-4">
            <button
              type="button"
              onClick={async () => {
                const newName = prompt("Enter new name for the game:", game.title);
                if (newName && newName !== game.title) {
                  try {
                    const response = await fetch(`/api/game/${game.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newName })
                    });
                    if (response.ok) {
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error('Error renaming game:', error);
                    alert('Failed to rename game');
                  }
                }
              }}
              class="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-label="Edit icon">
                <title>Edit game name</title>
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>Rename</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this game?")) {
                  try {
                    const response = await fetch(`/api/game/${game.id}`, {
                      method: 'DELETE'
                    });
                    if (response.ok) {
                      window.location.href = '/games';
                    }
                  } catch (error) {
                    console.error('Error deleting game:', error);
                    alert('Failed to delete game');
                  }
                }
              }}
              class="px-4 py-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-label="Delete icon">
                <title>Delete game</title>
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <GameComponent gameUrl={{ code: game.description, name: game.title }} />
        </div>
      </div>
    </div>
  );
}
