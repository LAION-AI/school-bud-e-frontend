import { useState } from "preact/hooks";
import { BookOpen, X, List } from "lucide-preact";
import CollapsibleSection from "./CollapsibleSection.tsx";
import SidebarLink from "./SidebarLink.tsx";
import { useComputed } from "@preact/signals";
import { graphs, deleteGraph } from "../graph/store.ts";

export default function GraphsSection({ isCollapsed }: { isCollapsed: boolean }) {
  const [expanded, setExpanded] = useState(() => {
    const path = globalThis.location?.pathname;
    return path?.startsWith("/graph");
  });
  const [currentPath, setCurrentPath] = useState("");

	const lastThreeGraphs = useComputed(() => {
		const value = (Array.from(graphs.value.keys()) as string[])
			.sort((a, b) => b?.length - a?.length)
			.slice(0, 59);
		console.log(value);
		return value;
	});


  return (
    <CollapsibleSection
      icon={<BookOpen />}
      title="Graphs"
      isCollapsed={isCollapsed}
      isExpanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      baseRoute="/graph"
      routePattern={/^\/graph(\/.*)?$/}
      onRouteMatch={(match) => setCurrentPath(match?.[0] || "")}
    >
      <div class="space-y-2">
        <button
          type="button"
          onClick={() => {
            globalThis.location.href = "/graph/list";
          }}
          class={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-amber-500 ${
            currentPath === "/graph/list"
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <List size={16} class={currentPath === "/graph/list" ? "text-amber-800" : "text-gray-600"} />
          <span>All Graphs</span>
        </button>

        {lastThreeGraphs.value.length > 0 && (
          <div class="pt-1">
            <h3 class="text-xs font-medium text-gray-500 px-3 mb-2">
              Recent Graphs
            </h3>
            <div class="space-y-1">
              {lastThreeGraphs.value.map((graphId) => (
                <div key={graphId} class="group flex items-center">
                  <SidebarLink
                    href={`/graph/${graphId}`}
                    isActive={currentPath === `/graph/${graphId}`}
                    className="flex-1 truncate"
                  >
                    {graphs.value.get(graphId)?.name || graphId}
                  </SidebarLink>
                  <button
                    type="button"
                    onClick={() => deleteGraph(graphId)}
                    class="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-600 transition-all duration-200 outline-none rounded focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:opacity-100"
                    aria-label={`Delete graph ${graphs.value.get(graphId)?.name || graphId}`}
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