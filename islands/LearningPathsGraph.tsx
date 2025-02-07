import { useEffect } from "preact/hooks";
import { JSX } from "preact";
import { GraphJson } from "../types/formats.ts";
import { messages } from "../components/chat/store.ts";
import { InteractiveGraph } from "../components/graph/InteractiveGraph.tsx";
import * as graphStore from "../components/graph/store.ts";
import { useSignal, useSignalEffect } from "@preact/signals";
import { Graph } from "../components/Graph.tsx";

interface LearningPathsGraphProps {
    lang: string;
}

const sampleGraph: GraphJson = {
    type: 'graph',
    items: [],
};

export default function LearningPathsGraph({ lang }: LearningPathsGraphProps): JSX.Element {
    const isCollapsed = useSignal((() => {
        if (typeof window === "undefined") return false;
        const urlParams = new URLSearchParams(location.search);
        const collapsed = urlParams.get("rcollapsed");
        return collapsed === "true";
    })());

    useEffect(() => {
        // Load graph data from localStorage
        const savedGraph = localStorage.getItem("savedGraph");
        if (savedGraph) {
            try {
                const parsedGraph = JSON.parse(savedGraph);
                graphStore.graphData.value = parsedGraph;
            } catch (error) {
                console.error("Error loading saved graph:", error);
            }
        } else {
            // Optionally, load a sample graph if no saved data exists
            graphStore.graphData.value = sampleGraph;
        }
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                isCollapsed.value = true;
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    useSignalEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(location.search);
            urlParams.set("rcollapsed", "" + isCollapsed.value);
            const newUrl = `${location.origin}${location.pathname}?${urlParams.toString()}`;
            history.replaceState(null, "", newUrl);
        }
    });

    useSignalEffect(() => {
        // Extract graphs from chat messages
        const graphs: GraphJson[] = [];
        messages.value.forEach((message) => {
            if (message.role === "assistant") {
                const content = Array.isArray(message.content)
                    ? message.content.join("")
                    : message.content;

                try {
                    const jsonMatch = content.match(/```(json)\n([\s\S]*?)\n```/);
                    if (jsonMatch) {
                        const jsonData = JSON.parse(jsonMatch[2]);
                        if (jsonData.type === "graph") {
                            graphs.push(jsonData);
                        }
                    }
                } catch (error) {
                    console.error("Error parsing graph JSON:", error);
                }
            }
        });
        graphStore.recentGraphs.value = graphs;
    });

    return (
        <div class="">
            <div class="">
                <div class="bg-white shadow-sm p-6">
                    <h2 class="text-xl font-semibold mb-4">
                        {lang === "de" ? "Beispiel Lernpfad" : "Sample Learning Path"}
                    </h2>
                    <div class="h-[calc(100vh-2rem)] relative">
                        {graphStore.graphData.value && (
                            <button
                                onClick={() => (graphStore.graphData.value = null)}
                                class="absolute right-2 top-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors z-10"
                                aria-label="Close graph"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        )}
                        <InteractiveGraph height="100%" />
                    </div>
                </div>
            </div>

            <div
                class={`fixed right-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${isCollapsed.value ? "w-0 overflow-hidden" : "w-96"
                    }`}
            >
                <button
                    onClick={() => (isCollapsed.value = !isCollapsed.value)}
                    class="absolute -left-10 top-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                    aria-label={isCollapsed.value ? "Show recent graphs" : "Hide recent graphs"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class={`h-5 w-5 transition-transform duration-300 ${isCollapsed.value ? "rotate-180" : ""
                            }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {graphStore.recentGraphs.value.length > 0 && (
                    <div class="h-full overflow-y-auto p-4">
                        <h2 class="text-xl font-semibold mb-4 sticky top-0 py-2">
                            {lang === "de"
                                ? "Kürzlich erstellte Graphen"
                                : "Recently Created Graphs"}
                        </h2>
                        <div class="space-y-4">
                            {graphStore.recentGraphs.value
                                .filter((graph) => graph?.items?.length)
                                .map((graph, index) => (
                                    <div
                                        key={index}
                                        class="border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => (graphStore.graphData.value = graph)}
                                    >
                                        <Graph
                                            zoomingEnabled={false}
                                            key={index}
                                            graphData={graph.items}
                                            height="300px"
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
