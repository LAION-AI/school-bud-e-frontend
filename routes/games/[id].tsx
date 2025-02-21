import { Handlers, PageProps } from "$fresh/server.ts";
import GameDetail from "../../islands/GameDetail.tsx";
import { Game } from "../../types/formats.ts";

interface Data {
  game: Game | null;
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const id = ctx.params.id;
    try {
      const game = await fetchGame(id);
      return ctx.render({ game });
    } catch (err) {
      return ctx.render({ game: null });
    }
  },
};

async function fetchGame(id: string): Promise<Game> {
  // In a real app, fetch from your database
  return {
    id,
    title: "Sample Game",
    description: "This is a sample game",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function GamePage(props: PageProps<Data>) {
  const { game } = props.data;
  
  if (!game) {
    return <div>Game not found</div>;
  }

  return (
    <div>
      <GameDetail id={game.id} initialGame={game} />
    </div>
  );
}
