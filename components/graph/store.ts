// store.ts
import { signal } from "@preact/signals";
import { GraphJson } from "../../types/formats.ts";

// Graph management signals
export const graphs = signal<Map<string, GraphJson>>(new Map());
export const currentGraphId = signal<string | null>(null);
export const graphData = signal<GraphJson | null>(null);
export const recentGraphs = signal<GraphJson[]>([]);

// Node selection signals
export const selectedNode = signal<string | null>(null);
export const secondarySelectedNode = signal<string | null>(null);
export const isConnectingNodes = signal<boolean>(false);

// Graph operation states
export const isAddingNode = signal<boolean>(false);
export const isRenamingNode = signal<boolean>(false);
export const newNodeName = signal<string>("");

// Load saved graphs from localStorage
export function loadSavedGraphs() {
  if (typeof window === "undefined") return;
  
  const savedGraphsJson = localStorage.getItem("savedGraphs");
  if (savedGraphsJson) {
    try {
      const savedGraphs = JSON.parse(savedGraphsJson);
      graphs.value = new Map(Object.entries(savedGraphs));
    } catch (e) {
      console.error("Error loading saved graphs:", e);
    }
  }
}

// Save graphs to localStorage
export function saveGraphs() {
  if (typeof window === "undefined") return;
  
  const graphsObj = Object.fromEntries(graphs.value);
  localStorage.setItem("savedGraphs", JSON.stringify(graphsObj));
}


export function saveGraph(name: string, items = []) {
  if (!name || typeof name !== 'string') {
    throw new Error('Graph name must be a non-empty string');
  }

  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  const newGraph: GraphJson = {
    type: "graph",
    items: [...items], // Create a copy to prevent mutation
    name,
  };

  const id = crypto.randomUUID();
  graphs.value.set(id, newGraph);
  saveGraphs();
  return id;
}

// Create a new graph
export function createGraph(name: string) {
    return saveGraph(name, [])
}

// Delete a graph
export function deleteGraph(id: string) {
  if (currentGraphId.value === id) {
    currentGraphId.value = null;
    graphData.value = null;
  }
  graphs.value.delete(id);
  // Remove from recent graphs if present
  const existingIndex = recentGraphs.value.findIndex(g => g === graphs.value.get(id));
  if (existingIndex !== -1) {
    recentGraphs.value.splice(existingIndex, 1);
  }
  saveGraphs();
}

// Load a specific graph
export function loadGraph(id: string) {
  const graph = graphs.value.get(id);
  if (graph) {
    currentGraphId.value = id;
    graphData.value = graph;
    
    // Update recent graphs (move the loaded graph to the front)
    const existingIndex = recentGraphs.value.findIndex(g => g === graph);
    if (existingIndex !== -1) {
      recentGraphs.value.splice(existingIndex, 1);
    }
    recentGraphs.value = [graph, ...recentGraphs.value.slice(0, 4)];
  }
}

// Save current graph (update the graphs Map and persist it)
export function saveCurrentGraph() {
  if (currentGraphId.value && graphData.value) {
    graphs.value.set(currentGraphId.value, graphData.value);
    saveGraphs();
  }
}

// Graph collapse state
export const isGraphCollapsed = signal<boolean>(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(location.search);
    const collapsed = urlParams.get("rcollapsed");
    return collapsed === "true";
});

// Graph operations
export function handleNodeSelect(nodeId: string, isAltPressed: boolean = false) {
    if (isAltPressed && nodeId !== selectedNode.value) {
        secondarySelectedNode.value = nodeId;
        isConnectingNodes.value = true;
    } else {
        if (nodeId !== selectedNode.value) {
            selectedNode.value = nodeId;
            secondarySelectedNode.value = null;
            isConnectingNodes.value = false;
        }
    }
}

export function handleConnectNodes() {
    console.log('Connect');
    if (!selectedNode.value || !secondarySelectedNode.value || !isConnectingNodes.value) return;

    const updatedGraph = { ...graphData.value || { type: "graph", items: [] } };
    const sourceNode = updatedGraph.items.find(item => item.item === selectedNode.value);
    const targetNode = updatedGraph.items.find(item => item.item === secondarySelectedNode.value);
    
    if (sourceNode && targetNode) {
        // Initialize connections arrays if they don't exist
        if (!sourceNode.connections) sourceNode.connections = [];
        if (!targetNode.connections) targetNode.connections = [];
        
        // Check if connection already exists in either direction
        const connectionExists = sourceNode.connections.some(
            conn => (conn.from === selectedNode.value && conn.to === secondarySelectedNode.value) ||
                   (conn.from === secondarySelectedNode.value && conn.to === selectedNode.value)
        ) || targetNode.connections.some(
            conn => (conn.from === selectedNode.value && conn.to === secondarySelectedNode.value) ||
                   (conn.from === secondarySelectedNode.value && conn.to === selectedNode.value)
        );
        
        if (!connectionExists) {
            const newConnection = {
                from: selectedNode.value,
                to: secondarySelectedNode.value
            };
            sourceNode.connections.push(newConnection);
            
            graphData.value = updatedGraph;
            saveCurrentGraph();
            
            // Award points for creating a connection
            gameScore(2);
        }
    }
    
    // Reset connection state
    secondarySelectedNode.value = null;
    isConnectingNodes.value = false;
}

// Function to initiate renaming with the current node's name prefilled
export function initiateRenameNode() {
    if (selectedNode.value) {
        newNodeName.value = selectedNode.value;
        isRenamingNode.value = true;
    }
}

// Game score functionality
export function gameScore(points: number) {
    fetch("/api/game", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: "df30d10a-48bb-4f56-a32f-b60954bfaf04",
            points,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Score updated:", data);
            // Emit a custom event with the updated score data
            const scoreUpdateEvent = new CustomEvent("gameScoreUpdate", {
                detail: { id: "df30d10a-48bb-4f56-a32f-b60954bfaf04", points },
            });
            window.dispatchEvent(scoreUpdateEvent);
            return data.totalPoints;
        });
}

// Update graph operations to include scoring
export function handleAddNode() {
    if (!selectedNode.value || !newNodeName.value.trim()) return;

    const updatedGraph = { ...graphData.value || { type: "graph", items: [] } };
    const newNode = {
        item: newNodeName.value.trim(),
        childItems: [],
        notes: "", // Initialize notes property as an empty string
    };

    // Add the new node and connect it to the selected node.
    updatedGraph.items = [...(updatedGraph.items || []), newNode];
    const selectedNodeData = updatedGraph.items.find((item) =>
        item.item === selectedNode.value
    );
    if (selectedNodeData) {
        selectedNodeData.childItems = [
            ...(selectedNodeData.childItems || []),
            newNode.item,
        ];
    }

    graphData.value = updatedGraph;
    saveCurrentGraph();
    newNodeName.value = "";
    isAddingNode.value = false;

    // Award points for adding a node
    gameScore(3);
}

export function handleRenameNode() {
    if (!selectedNode.value || !newNodeName.value.trim()) return;

    const updatedGraph = { ...graphData.value || { type: "graph", items: [] } };
    const newName = newNodeName.value.trim();
    const oldName = selectedNode.value;

    updatedGraph.items = updatedGraph.items.map((item) => {
        const updatedItem = { ...item };

        if (item.item === oldName) {
            updatedItem.item = newName;
        }

        if (item.childItems) {
            updatedItem.childItems = item.childItems.map((child) =>
                child === oldName ? newName : child
            );
        }

        if (item.connections) {
            updatedItem.connections = item.connections.map((conn) => ({
                from: conn.from === oldName ? newName : conn.from,
                to: conn.to === oldName ? newName : conn.to,
            }));
        }

        return updatedItem;
    });

    graphData.value = updatedGraph;
    saveCurrentGraph();
    newNodeName.value = "";
    isRenamingNode.value = false;
    selectedNode.value = newName;

    // Award points for renaming a node
    gameScore(5);
}

export function handleDeleteNode() {
    if (!selectedNode.value) return;

    const updatedGraph = { ...graphData.value || { type: "graph", items: [] } };
    const nodeToDelete = selectedNode.value;

    updatedGraph.items = updatedGraph.items.filter((item) =>
        item.item !== nodeToDelete
    );

    updatedGraph.items = updatedGraph.items.map((item) => {
        const updatedItem = { ...item };

        if (item.childItems) {
            updatedItem.childItems = item.childItems.filter((child) =>
                child !== nodeToDelete
            );
        }

        if (item.connections) {
            updatedItem.connections = item.connections.filter(
                (conn) =>
                    conn.from !== nodeToDelete && conn.to !== nodeToDelete,
            );
        }

        return updatedItem;
    });

    graphData.value = updatedGraph;
    saveCurrentGraph();
    selectedNode.value = null;

    // Award points for deleting a node
    gameScore(5);
}

// Load initial graphs data
if (typeof window !== "undefined") {
    loadSavedGraphs();
    if (graphs.value.size === 0) {
        // Create a default graph if none exist.
        const defaultGraphId = createGraph("Untitled Graph");
        loadGraph(defaultGraphId);
    } else if (!currentGraphId.value) {
        // Optionally load the first graph from the Map.
        const [firstGraphId] = graphs.value.keys();
        loadGraph(firstGraphId);
    }
}
