import { useEffect, useRef } from "preact/hooks";
import cytoscape from "cytoscape";
import { GraphNode } from "../../islands/RightSidebar.tsx";
import * as graphStore from "./store.ts";
import automove from 'cytoscape-automove';
import { getGameProgress } from "../games/store.ts";

interface InteractiveGraphProps {
  height?: string;
  isRoot?: boolean;
}

export function InteractiveGraph({ height = "400px", isRoot = false }: InteractiveGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Create Cytoscape elements from graph data (used only during initial mount)
  const createGraphElements = (items: GraphNode[]): cytoscape.ElementDefinition[] => {
    const elements: cytoscape.ElementDefinition[] = [];
    const nodeMap = new Map<string, GraphNode>();
  
    // Build a map for quick lookup
    items.forEach(node => {
      nodeMap.set(node.item, node);
    });
  
    const addNode = (id: string) => {
      // If the node is already added, skip it
      if (elements.some(el => el.data && el.data.id === id)) return;
      // Look up saved position
      const saved = nodeMap.get(id);
      const nodeDef: cytoscape.ElementDefinition = {
        data: {
          id: id,
          label: id
        },
        ...(saved?.position && { position: saved.position })
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
        elements.push({ data: { source: connection.from, target: connection.to } });
      });
    });
    return elements;
  };


  // --- Cytoscape instance creation ---
  useEffect(() => {
    if (containerRef.current && graphStore.graphData.value?.items) {
      const elements = createGraphElements(graphStore.graphData.value.items);
      cytoscape.use(automove);
      const cy = cytoscape({
        container: containerRef.current,
        maxZoom: 2,
        minZoom: 0.75,
        elements,
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#888",
              label: "data(label)",
              color: "#000",
              "text-valign": "bottom",
              "text-halign": "center",
              "font-size": "10px",
              "text-wrap": "wrap",
              "text-max-width": "80px",
              "border-width": "3px",
              "border-color": "#4CAF50",
              "background-image": "url(/games/currency.png)",
              "background-image-smoothing": "no",
              "border-dash-pattern": (ele) => {
                const progress = getGameProgress(ele.data('id'));
                const dashLength = Math.floor(progress * 100);
                return [dashLength, 100 - dashLength];
              },
              "border-style": "dashed",
            },
          },
          {
            selector: "node.selected",
            style: {
              "border-width": "1px",
              "border-color": "#000",
              "border-dash-pattern": [5, 5],
              "border-style": "dashed"
            },
          },
          {
            selector: "node.secondary-selected",
            style: {
              "border-width": "1px",
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
              width: 1,
              "line-color": "#ddd",
              "target-arrow-color": "#ddd",
              "target-arrow-shape": "triangle-backcurve",
              "curve-style": "bezier",
            },
          },
        ],
        layout: elements.some(el => el.position) ? { name: 'preset' } : {
          name: 'cose',
          animate: true,
          animationDuration: 500,
          animationThreshold: 1000,
        }
      });

      cyRef.current = cy;

      // Save positions when nodes are moved
      cy.on('position', 'node', (evt) => {
        const node = evt.target;
        const nodeId = node.id();
        const position = node.position();
      
        if (graphStore.graphData.value?.items) {
          const nodeData = graphStore.graphData.value.items.find(item => item.item === nodeId);
          if (nodeData) {
            nodeData.position = position;
            localStorage.setItem('savedGraph', JSON.stringify(graphStore.graphData.value));
          }
        }
      });
      

      // Event listener for node drag start
      cy.on('grab', 'node', function (evt) {
        const node = evt.target;
        cy.automove({
          nodesMatching: node.neighborhood().nodes(),
          reposition: 'drag',
          dragWith: node
        });
      });

      // Event listener for node drag end to remove automove behavior
      cy.on('free', 'node', function (evt) {
        cy.automove('destroy');
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

      // Handle Alt+C keyboard shortcut
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'c') {
          graphStore.handleConnectNodes();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
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
        // Update the node's data in place.
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
          item.childItems = item.childItems?.map(child => (child === oldId ? newLabel : child));
          if (item.connections) {
            item.connections = item.connections.map(conn => ({
              from: conn.from === oldId ? newLabel : conn.from,
              to: conn.to === oldId ? newLabel : conn.to,
            }));
          }
        }
      });
    }
    localStorage.setItem("savedGraph", JSON.stringify(graphStore.graphData.value));
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
      graphStore.graphData.value.items = graphStore.graphData.value.items.filter(item => item.item !== nodeId);
      graphStore.graphData.value.items.forEach(item => {
        if (item.childItems) {
          item.childItems = item.childItems.filter(child => child !== nodeId);
        }
        if (item.connections) {
          item.connections = item.connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId);
        }
      });
    }
    localStorage.setItem("savedGraph", JSON.stringify(graphStore.graphData.value));
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
      const selectedNodeData = graphStore.graphData.value.items.find(item => item.item === selected);
      if (selectedNodeData) {
        selectedNodeData.childItems = [...(selectedNodeData.childItems || []), newName];
      }
    }
    localStorage.setItem("savedGraph", JSON.stringify(graphStore.graphData.value));
    graphStore.newNodeName.value = "";
    graphStore.isAddingNode.value = false;
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
              onClick={() => window.location.href = `/games/${graphStore.selectedNode.value}?name=${graphStore.selectedNode.value}`}
              class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Open Game
            </button>
          </div>
          {(graphStore.isAddingNode.value || graphStore.isRenamingNode.value) && (
            <div class="flex gap-2">
              <input
                type="text"
                value={graphStore.newNodeName.value}
                onChange={(e) =>
                  (graphStore.newNodeName.value = (e.target as HTMLInputElement).value)
                }
                placeholder={
                  graphStore.isAddingNode.value
                    ? "New node name"
                    : "New name for node"
                }
                class="px-2 py-1 border rounded"
              />
              <button
                onClick={graphStore.isAddingNode.value ? handleAdd : handleRename}
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
