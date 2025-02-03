import { useEffect, useRef, useState } from "preact/hooks";
import cytoscape from "cytoscape";
import { Game } from "../components/Game.tsx";

interface WebResult {
  title: string;
  url: string;
  description?: string;
}

interface Connection {
  from: string;
  to: string;
}

export interface GraphNode {
  item: string;
  childItems?: string[];
  connections?: Connection[];
}

type SidebarData =
  | { type: "webResults"; results?: WebResult[] }
  | { type: "graph"; items?: GraphNode[] }
  | { type: "game"; gameUrl: string };

interface RightSidebarProps {
  data?: SidebarData[];
}

/**
 * Converts the full graph data into Cytoscape elements.
 */
function convertGraphData(items: GraphNode[]): cytoscape.ElementDefinition[] {
  const elements: cytoscape.ElementDefinition[] = [];
  const nodeSet = new Set<string>();

  items.forEach((node) => {
    if (!nodeSet.has(node.item)) {
      elements.push({ data: { id: node.item, label: node.item } });
      nodeSet.add(node.item);
    }
    node.childItems?.forEach((child) => {
      if (!nodeSet.has(child)) {
        elements.push({ data: { id: child, label: child } });
        nodeSet.add(child);
      }
      elements.push({ data: { source: node.item, target: child } });
    });
    node.connections?.forEach((connection) => {
      if (!nodeSet.has(connection.from)) {
        elements.push({ data: { id: connection.from, label: connection.from } });
        nodeSet.add(connection.from);
      }
      if (!nodeSet.has(connection.to)) {
        elements.push({ data: { id: connection.to, label: connection.to } });
        nodeSet.add(connection.to);
      }
      elements.push({
        data: { source: connection.from, target: connection.to },
      });
    });
  });
  return elements;
}

/**
 * Builds a drilldown graph from the selected node.
 * The new graph will contain the selected node (marked as "root") and its child items.
 */
function buildDrilldownGraph(
  selectedNode: GraphNode
): cytoscape.ElementDefinition[] {
  const elements: cytoscape.ElementDefinition[] = [];
  // Add the selected node and mark it with an extra data attribute.
  elements.push({
    data: { id: selectedNode.item, label: selectedNode.item, type: "root" },
  });
  selectedNode.childItems?.forEach((child) => {
    elements.push({ data: { id: child, label: child } });
    elements.push({ data: { source: selectedNode.item, target: child } });
  });
  return elements;
}

export default function RightSidebar({ data }: RightSidebarProps) {
  console.log({data});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Graph state: current graph elements, drilldown stack, and currently selected node ID.
  const [graphElements, setGraphElements] = useState<
    cytoscape.ElementDefinition[] | null
  >(null);
  const [graphStack, setGraphStack] = useState<
    cytoscape.ElementDefinition[][] // each element in the stack is a previous graph elements array
  >([]);
  const [currentDrilldown, setCurrentDrilldown] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // When new full graph data is received, initialize graphElements.
  useEffect(() => {
    const lastItem = data?.[data.length - 1];
    if (lastItem?.type === "graph" && lastItem.items) {
      const elements = convertGraphData(lastItem.items);
      setGraphElements(elements);
      setGraphStack([]);
      setCurrentDrilldown(null);
      setSelectedNodeId(null);
    }
  }, [data]);

  // Set up Cytoscape with current graphElements and attach node tap handler.
  useEffect(() => {
    if (graphElements && containerRef.current) {
      // Create the Cytoscape instance.
      const cy = cytoscape({
        container: containerRef.current,
        elements: graphElements,
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#aaa",
              label: "data(label)",
              color: "#000",
              "text-valign": "center",
              "text-halign": "center",
              "font-size": "10px",
              "text-wrap": "wrap",
              "text-max-width": "80px",
              // Default border style.
              "border-width": "1px",
              "border-color": "#555",
            },
          },
          // Style for selected node (when clicked)
          {
            selector: "node.selected",
            style: {
              "border-width": "2px",
              "border-color": "#f00",
            },
          },
          // Style for drilldown root node.
          {
            selector: 'node[type="root"]',
            style: {
              "background-color": "#0a84ff",
              "border-width": "3px",
              "border-color": "#fff",
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#ccc",
              "target-arrow-color": "#ccc",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
            },
          },
        ],
        layout: {
          name: "cose",
          animate: true,
        },
      });

      // Save instance for later use.
      cyRef.current = cy;

      // When a node is tapped, mark it as selected (but do not drill down immediately).
      cy.on("tap", "node", (event) => {
        const node = event.target;
        const nodeId = node.data("id");

        // Remove the 'selected' class from all nodes.
        cy.$("node").removeClass("selected");
        // Add 'selected' class to the tapped node.
        node.addClass("selected");
        setSelectedNodeId(nodeId);
      });

      return () => {
        cy.destroy();
        cyRef.current = null;
      };
    }
  }, [graphElements]);

  // Placeholder: simulate an AI call to generate more detailed items.
  const generateMoreDetails = async (nodeId: string) => {
    // Replace with your actual API call.
    console.log("Generating more details for", nodeId);
    // Simulate by returning additional child items.
    return [];
    //return ["Detail 1", "Detail 2", "Detail 3"];
  };

  // Option 1: Open Detailed – drill down into the selected node.
  const openDetailed = async () => {
    const lastItem = data?.[data.length - 1];
    if (!selectedNodeId || !lastItem || lastItem.type !== "graph" || !lastItem.items) return;

    // Find the selected node in the original data.
    const nodeData = lastItem.items.find((n) => n.item === selectedNodeId);
    if (!nodeData) return;

    // Optionally, generate more items with AI.
    const aiChildItems = await generateMoreDetails(selectedNodeId);
    // Combine existing child items (if any) with AI-generated ones.
    const combinedChildItems = [
      ...(nodeData.childItems || []),
      ...aiChildItems.filter((item) => !(nodeData.childItems || []).includes(item)),
    ];
    const detailedNodeData: GraphNode = {
      ...nodeData,
      childItems: combinedChildItems,
    };

    // Build drilldown elements – note that we keep the selected node as "root".
    const newElements = buildDrilldownGraph(detailedNodeData);
    // Push the current graph onto the stack for "back" functionality.
    if (graphElements) {
      setGraphStack((prev) => [...prev, graphElements]);
    }
    setGraphElements(newElements);
    setCurrentDrilldown(selectedNodeId);
    // Clear the selected node (since we drilled down).
    setSelectedNodeId(null);
  };

  // Option 2: Ask Question – pass the selected node's information to the chat.
  const askQuestion = () => {
    if (!selectedNodeId) return;
    // Replace this with your chat integration.
    console.log("Ask question about", selectedNodeId);
    alert(`Ask question about ${selectedNodeId}`);
  };

  // Option 3: Show Tasks / Generate Task – send a GET request to /tasks with a summary.
  const showTasks = async () => {
    if (!selectedNodeId) return;
    // For example, use the selected node's label as a summary.
    const summary = selectedNodeId;
    try {
      const response = await fetch(`/tasks?summary=${encodeURIComponent(summary)}`);
      const tasks = await response.json();
      console.log("Tasks:", tasks);
      alert(`Tasks: ${JSON.stringify(tasks)}`);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Error fetching tasks");
    }
  };

  // Handle "Back" button: restore the previous graph.
  const goBack = () => {
    if (graphStack.length > 0) {
      const newStack = [...graphStack];
      const previousElements = newStack.pop();
      setGraphStack(newStack);
      if (previousElements) {
        setGraphElements(previousElements);
      }
      // Clear any drilldown state.
      if (newStack.length === 0) {
        setCurrentDrilldown(null);
      }
    }
  };

  return (
    <div class={"bg-savanna border-l border-gray-300 h-full flex flex-col max-w-[30vw]"}>
      <h3 class={"p-4 font-semibold border-b border-gray-300"}>Informationen</h3>
      {/* Display all data elements */}
      {data?.map((item, dataIndex) => {
        // Skip rendering if the item has no results/items
        if ((item.type === "webResults" && (!item.results || item.results.length === 0)) ||
            (item.type === "graph" && (!item.items || item.items.length === 0))) {
          return null;
        }
        return (
          <div key={dataIndex}>
            {/* Display web results if applicable */}
            {item.type === "webResults" && (
              <div class="p-4 overflow-y-auto">
                <div class="space-y-4">
                  {(item.results ?? []).map((result, index) => (
                    <div
                      key={index}
                      class="sidebar-item bg-white/50 p-4 rounded-lg border"
                    >
                      <h3 class="font-medium mb-2">{result.title}</h3>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-500 hover:text-blue-600 block mb-2 text-sm break-all"
                      >
                        {result.url}
                      </a>
                      {result.description && (
                        <p class="text-gray-600 text-sm">{result.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display game */}
            {item.type === "game" && (
              <div class="m-4">
                <Game gameUrl={item.gameUrl} />
              </div>
            )}

            {/* Display graph results */}
            {item.type === "graph" && (
              <>
                <div
                  class="m-4 h-full border"
                  ref={containerRef}
                  style={{ width: "100%", height: "400px" }}
                ></div>
                <div class="p-2 border-t flex justify-between items-center">
                  {/* Show Back button if there is drilldown history */}
                  {graphStack.length > 0 && (
                    <button
                      onClick={goBack}
                      class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                    >
                      Back
                    </button>
                  )}
                  {/* If a node is selected (but not drilled down yet), show option buttons */}
                  {selectedNodeId && (
                    <div class="space-x-2">
                      <button
                        onClick={openDetailed}
                        class="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      >
                        Open Detailed
                      </button>
                      <button
                        onClick={askQuestion}
                        class="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                      >
                        Ask Question
                      </button>
                      <button
                        onClick={showTasks}
                        class="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded"
                      >
                        Explore Quests
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
