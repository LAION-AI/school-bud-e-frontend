import GameDetail from "../../islands/GameDetail.tsx";

interface SavedGame {
  id: string;
  name: string;
  code: string;
  timestamp: string;
  totalPoints: number;
}

export default async function GameDetailRoute(req) {
  let id = '';
  try {
    const url = new URL(req.url);
    id = url.searchParams.get("id") || "343b3e02-d9f7-43e0-80db-abd6c517e295"
  } catch {}

  return (
    <GameDetail id={id} />
  );
}