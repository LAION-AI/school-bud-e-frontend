import { signal } from "@preact/signals";
import { GraphJson } from "../../types/formats.ts";

// Graph data signal
export const graphData = signal<GraphJson | null>(null);

// Node selection signals
export const selectedNode = signal<string | null>(null);
export const secondarySelectedNode = signal<string | null>(null);
export const isConnectingNodes = signal<boolean>(false);

// Graph operation states
export const isAddingNode = signal<boolean>(false);
export const isRenamingNode = signal<boolean>(false);
export const newNodeName = signal<string>("");

// Recent graphs signal
export const recentGraphs = signal<GraphJson[]>([]);

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
    console.log('Connect')
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
            // Add connection to both nodes
            const newConnection = {
                from: selectedNode.value,
                to: secondarySelectedNode.value
            };
            sourceNode.connections.push(newConnection);
            
            graphData.value = updatedGraph;
            localStorage.setItem("savedGraph", JSON.stringify(updatedGraph));
            
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

    // Add the new node and connect it to the selected node
    updatedGraph.items = [...(updatedGraph.items || []), newNode];
    const selectedNodeData = updatedGraph.items.find((item) =>
        item.item === selectedNode.value
    );
    if (selectedNodeData) {
        selectedNodeData.childItems = [
            ...(selectedNodeData.childItems || []),
            newNodeName.value.trim(),
        ];
    }

    graphData.value = updatedGraph;
    localStorage.setItem("savedGraph", JSON.stringify(updatedGraph));
    newNodeName.value = "";
    isAddingNode.value = false;

    // Award points for adding a node
    gameScore(3);
}

export function handleRenameNode() {
    if (!selectedNode.value || !newNodeName.value.trim()) return;

    const updatedGraph = { ...graphData.value || { type: "graph", items: [] } };
    const newNodeNameValue = newNodeName.value.trim();
    const oldNodeName = selectedNode.value;

    updatedGraph.items = updatedGraph.items.map((item) => {
        const updatedItem = { ...item };

        if (item.item === oldNodeName) {
            updatedItem.item = newNodeNameValue;
        }

        if (item.childItems) {
            updatedItem.childItems = item.childItems.map((child) =>
                child === oldNodeName ? newNodeNameValue : child
            );
        }

        if (item.connections) {
            updatedItem.connections = item.connections.map((conn) => ({
                from: conn.from === oldNodeName ? newNodeNameValue : conn.from,
                to: conn.to === oldNodeName ? newNodeNameValue : conn.to,
            }));
        }

        return updatedItem;
    });

    graphData.value = updatedGraph;
    localStorage.setItem("savedGraph", JSON.stringify(updatedGraph));
    newNodeName.value = "";
    isRenamingNode.value = false;
    selectedNode.value = newNodeNameValue;

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
    localStorage.setItem("savedGraph", JSON.stringify(updatedGraph));
    selectedNode.value = null;

    // Award points for deleting a node
    gameScore(5);
}

// Load initial graph data
if (typeof window !== "undefined") {
    const savedGraph = localStorage.getItem("savedGraph");
    if (savedGraph) {
        try {
            graphData.value = JSON.parse(savedGraph);
        } catch (error) {
            console.error("Error loading saved graph:", error);
        }
    }
}
