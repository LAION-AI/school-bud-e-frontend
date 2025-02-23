import { useEffect, useRef } from "preact/hooks";
import cytoscape from "cytoscape";
import { GraphNode } from "../islands/RightSidebar.tsx";

interface GraphProps {
  graphData: GraphNode[];
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  isRoot?: boolean;
  height?: string;
  zoomingEnabled?: boolean;
}

export function Graph({ graphData, onNodeSelect, selectedNodeId, isRoot = false, height = "400px", zoomingEnabled = true}: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Convert graph data to Cytoscape format
  const convertGraphData = (items: GraphNode[]): cytoscape.ElementDefinition[] => {
    const elements: cytoscape.ElementDefinition[] = [];
    const nodeSet = new Set<string>();

    items.forEach((node) => {
      if (!nodeSet.has(node.item)) {
        elements.push({
          data: {
            id: node.item,
            label: node.item,
            ...(isRoot && { type: "root" })
          }
        });
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
  };

  useEffect(() => {
    if (containerRef.current) {
      const elements = convertGraphData(graphData);

      // Create Cytoscape instance
      const cy = cytoscape({
        zoomingEnabled,
        container: containerRef.current,
        elements,
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
              "border-width": "1px",
              "border-color": "#555",
            },
          },
          {
            selector: "node.selected",
            style: {
              "border-width": "2px",
              "border-color": "#f00",
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

      // Save instance for cleanup
      cyRef.current = cy;

      // Handle node selection
      cy.on("tap", "node", (event) => {
        const node = event.target;
        const nodeId = node.data("id");

        cy.$("node").removeClass("selected");
        node.addClass("selected");
        onNodeSelect?.(nodeId);
      });

      // Update selected node if provided externally
      if (selectedNodeId) {
        cy.$(`node[id="${selectedNodeId}"]`).addClass("selected");
      }

      return () => {
        cy.destroy();
        cyRef.current = null;
      };
    }
  }, [graphData, selectedNodeId, isRoot]);

  return (
    <div
      ref={containerRef}
      class="border rounded bg-gray-50"
      style={{ width: "100%", height }}
    />
  );
}