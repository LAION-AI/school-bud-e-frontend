import { Handlers } from "$fresh/server.ts";

const PAPERS_API_URL = "https://api.ask.orkg.org/index/search";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const handler: Handlers = {
  async GET(req: Request) {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("query");
      const limit = parseInt(url.searchParams.get("limit") || "5", 10);

      if (!query) {
        throw new Error("Query parameter is required");
      }

      const response = await fetch(
        `${PAPERS_API_URL}?query=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: { "accept": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in papers API:", error);
      return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  async POST(req: Request) {
    try {
      const payload = await req.json();
      if (!payload.query) {
        throw new Error("Query parameter is required");
      }

      const top_n = payload.limit || 5;

      const response = await fetch(
        `${PAPERS_API_URL}?query=${encodeURIComponent(payload.query)}&limit=${
          top_n * 4
        }`,
        {
          headers: { "accept": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.payload) {
        throw new Error("Invalid response from papers API");
      }

      data.payload.items = data.payload.items.filter((item: PapersItem) => {
        return item.abstract && item.title && item.doi && item.date_published;
      });

      data.payload.items = data.payload.items.slice(0, top_n);

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in papers API:", error);
      return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
