import type { PageProps } from "$fresh/server.ts";
import SavedGames from "../islands/saved-games.tsx";

export default function Home(req: Request, _ctx: PageProps) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") as string !== undefined &&
    url.searchParams.get("lang") !== null
    ? url.searchParams.get("lang")
    : "de";

  return (
    <div class="flex h-screen overflow-hidden px-4">
        <SavedGames lang={lang}/>
    </div>
  );
}
