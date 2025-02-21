import { type ComponentProps } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { Game } from "../types/formats.ts";

interface GameDetailProps {
  id: string;
  initialGame?: Game;
}

interface GameState {
  title: string;
  description: string;
  imageUrl: string;
  isEditing: boolean;
}

export default function GameDetail({ id, initialGame }: GameDetailProps) {
  const [game, setGame] = useState<GameState>({
    title: initialGame?.title || "",
    description: initialGame?.description || "",
    imageUrl: initialGame?.imageUrl || "",
    isEditing: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initialGame && IS_BROWSER) {
      fetchGame();
    }
  }, [id, initialGame]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${id}`);
      if (!response.ok) throw new Error("Failed to fetch game");
      const data = await response.json();
      setGame({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isEditing: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: game.title,
          description: game.description,
          imageUrl: game.imageUrl,
        }),
      });
      if (!response.ok) throw new Error("Failed to save changes");
      setGame({ ...game, isEditing: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return <div class="text-red-500">{error}</div>;
  }

  return (
    <div class="p-4">
      {game.isEditing ? (
        <div class="space-y-4">
          <input
            type="text"
            value={game.title}
            onChange={(e) => setGame({ ...game, title: e.currentTarget.value })}
            class="w-full p-2 border rounded"
          />
          <textarea
            value={game.description}
            onChange={(e) => setGame({ ...game, description: e.currentTarget.value })}
            class="w-full p-2 border rounded h-32"
          />
          <div class="flex gap-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              onClick={() => setGame({ ...game, isEditing: false })}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div class="space-y-4">
          <h1 class="text-2xl font-bold">{game.title}</h1>
          <p class="text-gray-700">{game.description}</p>
          {game.imageUrl && (
            <img
              src={game.imageUrl}
              alt={game.title}
              class="max-w-full h-auto rounded"
            />
          )}
          <Button
            type="button"
            onClick={() => setGame({ ...game, isEditing: true })}
            disabled={!IS_BROWSER}
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
