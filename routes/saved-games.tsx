import type { PageProps } from "$fresh/server.ts";
import Header from "../islands/Header.tsx";
import SavedGames from "../islands/saved-games.tsx";

export default function Home(req: Request, _ctx: PageProps) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") as string !== undefined &&
    url.searchParams.get("lang") !== null
    ? url.searchParams.get("lang")
    : "de";

  return (
    <div class="flex h-screen overflow-hidden">
      {/* Main Chat Area */}
      <div class="flex-1 flex flex-col overflow-auto">
        <Header lang={lang as string} />
        <SavedGames />
      </div>
    </div>
  );
}
