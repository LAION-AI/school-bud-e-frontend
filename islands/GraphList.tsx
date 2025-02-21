import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { graphs } from "../components/graph/store.ts";

export default function GraphList() {
  const isClient = useSignal(false);

  useEffect(() => {
    isClient.value = true;
  }, []);

  // Don't render anything during SSR
  if (!isClient.value) {
    return (
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-full text-center py-8 text-gray-500">
          Loading graphs...
        </div>
      </div>
    );
  }

  const graphEntries = Array.from(graphs.value.entries());

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {graphEntries.length > 0 ? (
        graphEntries.map(([id, graph]) => (
          <a
            key={id}
            href={`/graph/${id}`}
            class="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 class="text-xl font-semibold mb-2">{graph.name || "Untitled Graph"}</h2>
            <p class="text-gray-600">
              {graph.items.length} {graph.items.length === 1 ? "node" : "nodes"}
            </p>
          </a>
        ))
      ) : (
        <div class="col-span-full text-center py-8 text-gray-500">
          No graphs found. Create a new graph to get started.
        </div>
      )}
    </div>
  );
} 