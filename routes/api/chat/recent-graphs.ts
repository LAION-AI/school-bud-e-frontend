import { HandlerContext } from "$fresh/server.ts";

export const handler = async (_req: Request, _ctx: HandlerContext): Promise<Response> => {
  try {
    // TODO: Implement actual chat history retrieval and graph extraction
    // For now, return an empty array as placeholder
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error retrieving recent graphs:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve recent graphs' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};