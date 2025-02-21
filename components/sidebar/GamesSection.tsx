import { useState } from "preact/hooks";
import { GamepadIcon, List, X } from "lucide-preact";
import CollapsibleSection from "./CollapsibleSection.tsx";
import { useComputed } from "@preact/signals";
import { savedGames, deleteGame } from "../games/store.ts";

export default function GamesSection({ isCollapsed }: { isCollapsed: boolean }) {
  const [expanded, setExpanded] = useState(() => {
    const path = globalThis.location?.pathname;
    return path?.startsWith("/games");
  });
  const [currentPath, setCurrentPath] = useState("");

  const recentGames = useComputed(() => {
    return savedGames.value
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  });

  return (
    <CollapsibleSection
      icon={<GamepadIcon />}
      title="Games"
      isCollapsed={isCollapsed}
      isExpanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      baseRoute="/games"
      routePattern={/^\/games(\/.*)?$/}
      onRouteMatch={(match) => setCurrentPath(match?.[0] || "")}
    >
      <div class="space-y-2">
        <button
          type="button"
          onClick={() => {
            globalThis.location.href = "/games/list";
          }}
          class={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentPath === "/games/list"
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <List size={16} class={currentPath === "/games/list" ? "text-amber-800" : "text-gray-600"} />
          <span>All Games</span>
        </button>

        {recentGames.value.length > 0 && (
          <div class="pt-1">
            <h3 class="text-xs font-medium text-gray-500 px-3 mb-2">
              Recent Games
            </h3>
            <div class="space-y-1">
              {recentGames.value.map((game) => (
                <div key={game.id} class="group flex items-center">
                  <a
                    href={`/games/${game.id}`}
                    class={`flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-200 outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      currentPath === `/games/${game.id}`
                        ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div class="flex items-center justify-between">
                      <span class="truncate">{game.name}</span>
                      <span class="text-xs text-gray-500 ml-2">{game.points}p</span>
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteGame(game.id)}
                    class="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-600 transition-all duration-200 outline-none rounded focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:opacity-100"
                    aria-label={`Delete game ${game.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
} 