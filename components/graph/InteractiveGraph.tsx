import { useEffect, useRef } from "preact/hooks";
import cytoscape from "cytoscape";
import { GraphNode } from "../../islands/RightSidebar.tsx";
import * as graphStore from "./store.ts";
import automove from "cytoscape-automove";

interface InteractiveGraphProps {
  height?: string;
  isRoot?: boolean;
}

export function InteractiveGraph({
  height = "400px",
  isRoot = false,
}: InteractiveGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const nodeMap = useRef(new Map<string, GraphNode>());

  // Create Cytoscape elements from graph data (used only during the initial mount)
  const createGraphElements = (
    items: GraphNode[]
  ): cytoscape.ElementDefinition[] => {
    const elements: cytoscape.ElementDefinition[] = [];
    nodeMap.current.clear();

    // Build a map for quick lookup
    items.forEach((node) => {
      nodeMap.current.set(node.item, node);
    });

    const addNode = (id: string) => {
      // If the node is already added, skip it.
      if (elements.some((el) => el.data && el.data.id === id)) return;
      // Look up the saved position
      const saved = nodeMap.current.get(id);
      const nodeDef: cytoscape.ElementDefinition = {
        data: {
          id: id,
          label: id,
        },
        ...(saved?.position && { position: saved.position }),
      };
      elements.push(nodeDef);
    };

    items.forEach((node) => {
      // Add the main node
      addNode(node.item);

      // Process child items
      node.childItems?.forEach((child) => {
        addNode(child);
        elements.push({ data: { source: node.item, target: child } });
      });

      // Process other connections
      node.connections?.forEach((connection) => {
        addNode(connection.from);
        addNode(connection.to);
        elements.push({
          data: { source: connection.from, target: connection.to },
        });
      });
    });
    return elements;
  };

  // --- Cytoscape instance creation ---
  useEffect(() => {
    if (containerRef.current && graphStore.graphData.value?.items) {
      const elements = createGraphElements(graphStore.graphData.value.items);
      const cy = cytoscape({
        container: containerRef.current,
        maxZoom: 3,
        minZoom: 0.75,
        boxSelectionEnabled: true,
        elements,
        style: [
          {
            selector: "node",
            style: {
              shape: "ellipse",
              "background-color": (ele) => {
                const nodeData = nodeMap.current.get(ele.data("id"));
                return nodeData?.image ? "#ffffff" : "#7AC70C";
              },
              label: "data(label)",
              "text-valign": "bottom",
              "text-halign": "center",
              "text-margin-y": "10px",
              "text-wrap": "wrap",
              "text-max-width": "100px",
              "font-size": "8px",
              "font-family": "'Poppins', sans-serif",
              "background-image": (ele) => {
                const nodeData = nodeMap.current.get(ele.data("id"));
                return nodeData?.image ? `url(${nodeData.image})` : "none";
              },
              "background-fit": "cover",
              "border-width": "3px",
              "border-color": "#fff",
              "border-style": "solid",
              "shadow-blur": "10px",
              "shadow-color": "rgba(0, 0, 0, 0.3)",
              "shadow-offset-x": "0px",
              "shadow-offset-y": "2px",
            },
          },
          {
            selector: "node:selected",
            style: {
              "border-width": "4px",
              "border-color": "#ffd700", // Gold border on selection
            },
          },
          {
            selector: "node.secondary-selected",
            style: {
              "border-width": "3px",
              "border-color": "#00f",
            },
          },
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
              "line-color": "#ddd",
              "target-arrow-color": "#ddd",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
            },
          },
        ],
        layout: elements.some((el) => el.position)
          ? { name: "preset" }
          : {
              name: "cose",
              animate: true,
              animationDuration: 500,
              animationThreshold: 1000,
            },
      });

      // Event listener to verify box selection
      cy.on("boxend", () => {
        const selectedNodes = cy.$("node:selected");
        console.log(
          "Currently selected nodes:",
          selectedNodes.map((n) => n.id())
        );
      });

      // Save positions when nodes are moved
      cy.on("position", "node", (evt) => {
        const node = evt.target;
        const nodeId = node.id();
        const position = node.position();

        if (graphStore.graphData.value?.items) {
          const nodeData = graphStore.graphData.value.items.find(
            (item) => item.item === nodeId
          );
          if (nodeData) {
            nodeData.position = position;
          } else {
            const newNode: GraphNode = {
              item: nodeId,
              childItems: [],
              position,
            };
            console.log(newNode);
            graphStore.graphData.value.items.push(newNode);
          }
          // Save the updated current graph
          graphStore.saveCurrentGraph();
        }
      });

      // Handle node selection and Alt key events
      cy.on("tap", "node", (event) => {
        const node = event.target;
        const nodeId = node.data("id");
        const isAltPressed = event.originalEvent?.ctrlKey || false;

        if (isAltPressed) {
          // If Alt is pressed, handle secondary selection
          if (nodeId !== graphStore.selectedNode.value) {
            cy.$("node").removeClass("secondary-selected");
            node.addClass("secondary-selected");
          }
        } else {
          // Regular selection
          cy.$("node").removeClass("selected secondary-selected");
          node.addClass("selected");
        }
        graphStore.handleNodeSelect(nodeId, isAltPressed);
      });

      // Handle Alt+C keyboard shortcut for connecting nodes
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key.toLowerCase() === "c") {
          graphStore.handleConnectNodes();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      cyRef.current = cy;

      // Cleanup on component unmount
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        cy.destroy();
        cyRef.current = null;
      };
    }
  }, [isRoot]);

  // --- Helper functions for direct Cytoscape updates ---

  // Update a node's label (rename) without reloading the whole graph.
  const updateNodeLabel = (oldId: string, newLabel: string) => {
    const cy = cyRef.current;
    if (cy) {
      const node = cy.$(`node[id="${oldId}"]`);
      if (node) {
        node.data({ id: newLabel, label: newLabel });
      }
    }
  };

  // Remove a node directly from Cytoscape.
  const removeNodeFromCy = (nodeId: string) => {
    const cy = cyRef.current;
    if (cy) {
      const node = cy.$(`node[id="${nodeId}"]`);
      if (node) {
        node.remove();
      }
    }
  };

  // Add a node directly to Cytoscape.
  const addNodeToCy = (node: GraphNode) => {
    const cy = cyRef.current;
    if (cy) {
      if (cy.$(`node[id="${node.item}"]`).empty()) {
        cy.add({
          data: {
            id: node.item,
            label: node.item,
            ...(isRoot && { type: "root" }),
          },
        });
      }
    }
  };

  // --- Event Handlers ---

  const handleRename = () => {
    const oldId = graphStore.selectedNode.value;
    const newLabel = graphStore.newNodeName.value.trim();
    if (!oldId || !newLabel) return;

    // Update Cytoscape directly.
    updateNodeLabel(oldId, newLabel);

    // Update the store in place.
    if (graphStore.graphData.value?.items) {
      graphStore.graphData.value.items.forEach((item) => {
        if (item.item === oldId) {
          item.item = newLabel;
          item.childItems = item.childItems?.map((child) =>
            child === oldId ? newLabel : child
          );
          if (item.connections) {
            item.connections = item.connections.map((conn) => ({
              from: conn.from === oldId ? newLabel : conn.from,
              to: conn.to === oldId ? newLabel : conn.to,
            }));
          }
        }
      });
    }
    graphStore.saveCurrentGraph();
    graphStore.newNodeName.value = "";
    graphStore.isRenamingNode.value = false;
    graphStore.selectedNode.value = newLabel;
  };

  const handleDelete = () => {
    const nodeId = graphStore.selectedNode.value;
    if (!nodeId) return;

    // Remove the node from Cytoscape directly.
    removeNodeFromCy(nodeId);

    // Update the store in place.
    if (graphStore.graphData.value?.items) {
      graphStore.graphData.value.items = graphStore.graphData.value.items.filter(
        (item) => item.item !== nodeId
      );
      graphStore.graphData.value.items.forEach((item) => {
        if (item.childItems) {
          item.childItems = item.childItems.filter((child) => child !== nodeId);
        }
        if (item.connections) {
          item.connections = item.connections.filter(
            (conn) => conn.from !== nodeId && conn.to !== nodeId
          );
        }
      });
    }
    graphStore.saveCurrentGraph();
    graphStore.selectedNode.value = null;
  };

  const handleAdd = () => {
    const selected = graphStore.selectedNode.value;
    const newName = graphStore.newNodeName.value.trim();
    if (!selected || !newName) return;

    const newNode: GraphNode = {
      item: newName,
      childItems: [],
    };

    // Add the new node directly to Cytoscape.
    addNodeToCy(newNode);

    // Also add the edge connecting the selected node to the new node.
    const cy = cyRef.current;
    if (cy) {
      if (cy.$(`edge[source="${selected}"][target="${newName}"]`).empty()) {
        cy.add({ data: { source: selected, target: newName } });
      }
    }

    // Update the store in place.
    if (graphStore.graphData.value?.items) {
      graphStore.graphData.value.items.push(newNode);
      const selectedNodeData = graphStore.graphData.value.items.find(
        (item) => item.item === selected
      );
      if (selectedNodeData) {
        selectedNodeData.childItems = [
          ...(selectedNodeData.childItems || []),
          newName,
        ];
      }
    }
    graphStore.saveCurrentGraph();
    graphStore.newNodeName.value = "";
    graphStore.isAddingNode.value = false;
  };

  // --- New Feature: Spread Nodes ---
  const handleSpreadNodes = () => {
    const cy = cyRef.current;
    if (cy) {
      const layout = cy.layout({
        name: "cose",
        animate: true,
        animationDuration: 500,
      });
      layout.run();
    }
  };

  // --- Rendering ---
  return (
    <div class="relative" style={{ width: "100%", height }}>
      <div
        ref={containerRef}
        class="border rounded bg-gray-50"
        style={{ width: "100%", height }}
      />
      {graphStore.selectedNode.value && (
        <div class="absolute left-2 top-2 p-2 bg-white shadow-md rounded-lg z-10">
          <div class="flex gap-2 mb-2">
            <button
              onClick={() => (graphStore.isAddingNode.value = true)}
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Connected Node
            </button>
            <button
              onClick={() => graphStore.initiateRenameNode()}
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Rename Node
            </button>
            <button
              onClick={handleDelete}
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Node
            </button>
            <button
              onClick={handleSpreadNodes}
              class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Spread Nodes
            </button>
            <button
              onClick={async () => {
                const nodeData = graphStore.graphData.value?.items.find(
                  (item) => item.item === graphStore.selectedNode.value
                );
                if (nodeData) {
                  try {
                    const response = await fetch("/api/images/pixelart", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prompt:
                          "\"" +
                          nodeData.item +
                          "\" icon kurzgesagt inspired, no text",
                      }),
                    });
                    if (response.ok) {
                      const data = await response.json();
                      nodeData.image =
                        "data:image/png;base64," + data.images[0];
                      // Update the nodeMap with the new image
                      nodeMap.current.set(nodeData.item, nodeData);
                      // Immediately update the node's image
                      const cy = cyRef.current;
                      if (cy) {
                        const node = cy.$(`node[id="${nodeData.item}"]`);
                        if (node) {
                          node.style(
                            "background-image",
                            `url(${nodeData.image})`
                          );
                        }
                      }
                      // Save the updated graph with the new image
                      graphStore.saveCurrentGraph();
                    } else {
                      console.error("Failed to generate image");
                    }
                  } catch (error) {
                    console.error("Error generating image:", error);
                  }
                }
              }}
              class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Image
            </button>
            <button
              onClick={() =>
                (window.location.href = `/games/${graphStore.selectedNode.value}?name=${graphStore.selectedNode.value}`)
              }
              class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Open Game
            </button>
          </div>
          {(graphStore.isAddingNode.value ||
            graphStore.isRenamingNode.value) && (
            <div class="flex gap-2">
              <input
                type="text"
                value={graphStore.newNodeName.value}
                onChange={(e) =>
                  (graphStore.newNodeName.value = (
                    e.target as HTMLInputElement
                  ).value)
                }
                placeholder={
                  graphStore.isAddingNode.value
                    ? "New node name"
                    : "New name for node"
                }
                class="px-2 py-1 border rounded"
              />
              <button
                onClick={
                  graphStore.isAddingNode.value ? handleAdd : handleRename
                }
                class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {graphStore.isAddingNode.value ? "Add" : "Rename"}
              </button>
              <button
                onClick={() => {
                  graphStore.isAddingNode.value = false;
                  graphStore.isRenamingNode.value = false;
                  graphStore.newNodeName.value = "";
                }}
                class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
