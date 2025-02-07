import { computed, signal } from "@preact/signals";

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

// Game state signals
export const currentGame = signal<SavedGame | null>(null);
export const savedGames = signal<SavedGame[]>([]);
export const isLoading = signal(false);
export const error = signal<string | null>(null);

// Computed signals
export const hasGames = computed(() => savedGames.value.length > 0);
export const totalPoints = computed(() => currentGame.value?.totalPoints ?? 0);
export const totalPointsAcrossAllGames = computed(() => {
  return savedGames.value.reduce((total, game) => total + game.totalPoints, 0);
});

// Game progress computation
export const getGameProgress = (gameName: string) => {
  const game = savedGames.value.find(g => g.name === gameName);
  if (!game) return 0;
  // Assuming 100 points is full progress
  return Math.min(game.totalPoints / 100, 1);
};

// API functions
export async function fetchGames() {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch("/api/game");
    const data = await response.json();

    if (Array.isArray(data)) {
      savedGames.value = data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to fetch games";
    console.error("Error fetching games:", err);
  } finally {
    isLoading.value = false;
  }
}

export async function saveGame(gameData: GameData) {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gameData),
    });

    const data = await response.json();
    if (data.success && data.game) {
      savedGames.value = [...savedGames.value, data.game];
      return data.game;
    } else {
      throw new Error(data.error || "Failed to save game");
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to save game";
    console.error("Error saving game:", err);
    return null;
  } finally {
    isLoading.value = false;
  }
}

export async function updateGame(id: string, code: string) {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch("/api/game", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, code }),
    });

    const data = await response.json();
    if (data.success && data.game) {
      savedGames.value = savedGames.value.map((game) =>
        game.id === id ? data.game : game
      );
      if (currentGame.value?.id === id) {
        currentGame.value = data.game;
      }
      return data.game;
    } else {
      throw new Error(data.error || "Failed to update game");
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to update game";
    console.error("Error updating game:", err);
    return null;
  } finally {
    isLoading.value = false;
  }
}

export async function deleteGame(id: string) {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/game?id=${id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (data.success) {
      savedGames.value = savedGames.value.filter((game) => game.id !== id);
      if (currentGame.value?.id === id) {
        currentGame.value = null;
      }
      return true;
    } else {
      throw new Error(data.error || "Failed to delete game");
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to delete game";
    console.error("Error deleting game:", err);
    return false;
  } finally {
    isLoading.value = false;
  }
}

export async function loadGame(id: string) {
  let game = savedGames.value.find((g) => g.id === id);
  if (!game) {
    await fetchGames();
    game = savedGames.value.find((g) => g.id === id);
  }
  if (game) {
    currentGame.value = game;
    return game;
  }
  return null;
}

// Initialize games list and set up event listener
if (typeof window !== "undefined") {
  fetchGames().catch(console.error);

  const audio = new Audio("/games/confirmation_003.ogg");

  // Listen for game score updates
  window.addEventListener(
    "gameScoreUpdate",
    ((event: CustomEvent) => {
      const { id, points } = event.detail;

      // Update the game in savedGames
      savedGames.value = savedGames.value.map((game) =>
        game.id === id
          ? { ...game, totalPoints: game.totalPoints + points }
          : game
      );

      // Update currentGame if it's the one being modified
      if (currentGame.value?.id === id) {
        currentGame.value = {
          ...currentGame.value,
          totalPoints: currentGame.value?.totalPoints + points,
        };
      }
      // Play a sound
      audio.volume = 1
      audio.play();
    }) as EventListener,
  );
}
