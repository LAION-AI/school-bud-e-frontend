import { useEffect } from "preact/hooks";
import { JSX } from "preact";
import { GraphJson } from "../types/formats.ts";
import { messages } from "../components/chat/store.ts";
import { InteractiveGraph } from "../components/graph/InteractiveGraph.tsx";
import * as graphStore from "../components/graph/store.ts";
import { useSignal, useSignalEffect } from "@preact/signals";

interface LearningPathsGraphProps {
	lang: string;
	name?: string;
}

const sampleGraph: GraphJson = {
	type: "graph",
	items: [],
};

export default function LearningPathsGraph({
	name,
}: LearningPathsGraphProps): JSX.Element {
	const isCollapsed = useSignal(
		(() => {
			if (typeof window === "undefined") return false;
			const urlParams = new URLSearchParams(location.search);
			const collapsed = urlParams.get("rcollapsed");
			return collapsed === "true";
		})(),
	);

	const graph = graphStore.graphs.peek().get(name || "");
	// graph ??= graphStore.graphs.peek().get()

	// Load graph data from localStorage
	const savedGraph = localStorage.getItem("savedGraph");
	if (savedGraph) {
		try {
			const parsedGraph = JSON.parse(savedGraph);
			if (graph) {
				graphStore.graphData.value = graph;
			} else {
				graphStore.graphData.value = parsedGraph;
			}
		} catch (error) {
			console.error("Error loading saved graph:", error);
		}
	} else {
		// Optionally, load a sample graph if no saved data exists
		graphStore.graphData.value = sampleGraph;
	}

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				isCollapsed.value = true;
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [isCollapsed]);

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

	return <InteractiveGraph height="100%" />;
}
