// import React, { useEffect, useRef, useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
//   Maximize2,
//   Download,
//   Settings,
//   Eye,
//   EyeOff,
//   Info
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';
// import { Slider } from '@/components/ui/slider';
// import { cn } from '@/lib/utils';

// // Dynamic import for Cytoscape to avoid SSR issues
// let cytoscape: any = null;
// let coseBilkent: any = null;

// interface GraphNode {
//   id: string;
//   label: string;
//   type: string;
//   color?: string;
// }

// interface GraphEdge {
//   id: string;
//   source: string;
//   target: string;
//   label?: string;
// }

// interface GraphVisualizationProps {
//   nodes: GraphNode[];
//   edges: GraphEdge[];
//   onNodeClick?: (node: GraphNode) => void;
//   onNodeExpand?: (nodeId: string) => void;
//   height?: number;
//   className?: string;
// }

// export function GraphVisualization({
//   nodes,
//   edges,
//   onNodeClick,
//   onNodeExpand,
//   height = 500,
//   className
// }: GraphVisualizationProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const cyRef = useRef<any>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showLabels, setShowLabels] = useState(true);
//   const [nodeSize, setNodeSize] = useState([30]);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showControls, setShowControls] = useState(true);

//   // Initialize Cytoscape
//   useEffect(() => {
//     const initCytoscape = async () => {
//       try {
//         if (!cytoscape) {
//           cytoscape = (await import('cytoscape')).default;
//           // @ts-ignore - Ignore type checking for cytoscape-cose-bilkent module
//           coseBilkent = (await import('cytoscape-cose-bilkent')).default;
//           cytoscape.use(coseBilkent);
//         }

//         if (containerRef.current && nodes.length > 0) {
//           // Destroy existing instance
//           if (cyRef.current) {
//             cyRef.current.destroy();
//           }

//           // Convert data to Cytoscape format
//           const elements = [
//             ...nodes.map(node => ({
//               data: {
//                 id: node.id,
//                 label: node.label,
//                 type: node.type,
//                 color: node.color || getNodeColor(node.type)
//               }
//             })),
//             ...edges.map(edge => ({
//               data: {
//                 id: edge.id,
//                 source: edge.source,
//                 target: edge.target,
//                 label: edge.label || ''
//               }
//             }))
//           ];

//           // Initialize Cytoscape
//           cyRef.current = cytoscape({
//             container: containerRef.current,
//             elements,
//             style: [
//               {
//                 selector: 'node',
//                 style: {
//                   'background-color': 'data(color)',
//                   'label': showLabels ? 'data(label)' : '',
//                   'width': nodeSize[0],
//                   'height': nodeSize[0],
//                   'text-valign': 'center',
//                   'text-halign': 'center',
//                   'font-size': '12px',
//                   'font-weight': 'bold',
//                   'color': '#333',
//                   'text-outline-width': 2,
//                   'text-outline-color': '#fff',
//                   'border-width': 2,
//                   'border-color': '#fff',
//                   'cursor': 'pointer'
//                 }
//               },
//               {
//                 selector: 'edge',
//                 style: {
//                   'width': 2,
//                   'line-color': '#ccc',
//                   'target-arrow-color': '#ccc',
//                   'target-arrow-shape': 'triangle',
//                   'curve-style': 'bezier',
//                   'label': 'data(label)',
//                   'font-size': '10px',
//                   'text-rotation': 'autorotate',
//                   'text-margin-y': -10
//                 }
//               },
//               {
//                 selector: 'node:hover',
//                 style: {
//                   'border-width': 4,
//                   'border-color': '#007bff'
//                 }
//               }
//             ],
//             layout: {
//               name: 'cose-bilkent',
//               animate: true,
//               animationDuration: 1000,
//               fit: true,
//               padding: 50,
//               nodeRepulsion: 4500,
//               idealEdgeLength: 100,
//               edgeElasticity: 0.45,
//               nestingFactor: 0.1,
//               gravity: 0.25,
//               numIter: 2500,
//               tile: true,
//               tilingPaddingVertical: 10,
//               tilingPaddingHorizontal: 10
//             }
//           });

//           // Add event listeners
//           cyRef.current.on('tap', 'node', (evt: any) => {
//             const node = evt.target.data();
//             onNodeClick?.(node);
//           });

//           cyRef.current.on('dbltap', 'node', (evt: any) => {
//             const node = evt.target.data();
//             onNodeExpand?.(node.id);
//           });

//           setIsLoading(false);
//         }
//       } catch (error) {
//         console.error('Failed to initialize Cytoscape:', error);
//         setIsLoading(false);
//       }
//     };

//     initCytoscape();

//     return () => {
//       if (cyRef.current) {
//         cyRef.current.destroy();
//         cyRef.current = null;
//       }
//     };
//   }, [nodes, edges, onNodeClick, onNodeExpand]);

//   // Update node labels
//   useEffect(() => {
//     if (cyRef.current) {
//       cyRef.current.style()
//         .selector('node')
//         .style('label', showLabels ? 'data(label)' : '')
//         .update();
//     }
//   }, [showLabels]);

//   // Update node size
//   useEffect(() => {
//     if (cyRef.current) {
//       cyRef.current.style()
//         .selector('node')
//         .style({
//           'width': nodeSize[0],
//           'height': nodeSize[0]
//         })
//         .update();
//     }
//   }, [nodeSize]);

//   const getNodeColor = (type: string): string => {
//     const colors: Record<string, string> = {
//       skill: '#8B5CF6',
//       jobrole: '#F59E0B',
//       department: '#14B8A6',
//       industry: '#3B82F6',
//       default: '#6B7280'
//     };
//     return colors[type] || colors.default;
//   };

//   const handleZoomIn = () => {
//     if (cyRef.current) {
//       cyRef.current.zoom(cyRef.current.zoom() * 1.2);
//       cyRef.current.center();
//     }
//   };

//   const handleZoomOut = () => {
//     if (cyRef.current) {
//       cyRef.current.zoom(cyRef.current.zoom() * 0.8);
//       cyRef.current.center();
//     }
//   };

//   const handleReset = () => {
//     if (cyRef.current) {
//       cyRef.current.fit();
//       cyRef.current.center();
//     }
//   };

//   const handleFullscreen = () => {
//     setIsFullscreen(!isFullscreen);
//   };

//   const handleDownload = () => {
//     if (cyRef.current) {
//       const png = cyRef.current.png({
//         output: 'blob',
//         bg: 'white',
//         full: true,
//         scale: 2
//       });

//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(png);
//       link.download = 'graph-visualization.png';
//       link.click();
//     }
//   };

//   const nodeTypes = Array.from(new Set(nodes.map((node) => node.type)));
//   const nodeStats = nodeTypes.map(type => ({
//     type,
//     count: nodes.filter(n => n.type === type).length,
//     color: getNodeColor(type)
//   }));

//   return (
//     <Card className={cn("relative", className)}>
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center gap-2">
//             Graph Visualization
//             <Badge variant="secondary">{nodes.length} nodes, {edges.length} edges</Badge>
//           </CardTitle>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowControls(!showControls)}
//           >
//             <Settings className="w-4 h-4" />
//           </Button>
//         </div>
//       </CardHeader>

//       <CardContent className="p-0">
//         <div className="relative">
//           {/* Graph Container */}
//           <div
//             ref={containerRef}
//             className={cn(
//               "border rounded-lg bg-gray-50",
//               isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
//             )}
//             style={{ height: isFullscreen ? '100vh' : height }}
//           >
//             {isLoading && (
//               <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
//                   <p className="text-sm text-gray-600">Loading graph...</p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Controls Panel */}
//           {showControls && (
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-4 min-w-[200px]"
//             >
//               {/* Zoom Controls */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-sm">Controls</h4>
//                 <div className="flex gap-1">
//                   <Button size="sm" variant="outline" onClick={handleZoomIn}>
//                     <ZoomIn className="w-3 h-3" />
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={handleZoomOut}>
//                     <ZoomOut className="w-3 h-3" />
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={handleReset}>
//                     <RotateCcw className="w-3 h-3" />
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={handleFullscreen}>
//                     <Maximize2 className="w-3 h-3" />
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={handleDownload}>
//                     <Download className="w-3 h-3" />
//                   </Button>
//                 </div>
//               </div>

//               {/* Display Options */}
//               <div className="space-y-3">
//                 <h4 className="font-medium text-sm">Display</h4>

//                 <div className="flex items-center justify-between">
//                   <span className="text-xs">Show Labels</span>
//                   <Switch
//                     checked={showLabels}
//                     onCheckedChange={setShowLabels}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <span className="text-xs">Node Size</span>
//                   <Slider
//                     value={nodeSize}
//                     onValueChange={setNodeSize}
//                     max={60}
//                     min={20}
//                     step={5}
//                     className="w-full"
//                   />
//                 </div>
//               </div>

//               {/* Legend */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-sm">Legend</h4>
//                 <div className="space-y-1">
//                   {nodeStats.map(stat => (
//                     <div key={stat.type} className="flex items-center gap-2 text-xs">
//                       <div
//                         className="w-3 h-3 rounded-full"
//                         style={{ backgroundColor: stat.color }}
//                       />
//                       <span className="capitalize">{stat.type}</span>
//                       <span className="text-gray-500">({stat.count})</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Instructions */}
//               <div className="space-y-2 pt-2 border-t">
//                 <h4 className="font-medium text-sm flex items-center gap-1">
//                   <Info className="w-3 h-3" />
//                   Instructions
//                 </h4>
//                 <div className="text-xs text-gray-600 space-y-1">
//                   <p>• Click node to view details</p>
//                   <p>• Double-click to expand</p>
//                   <p>• Drag to pan around</p>
//                   <p>• Scroll to zoom</p>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  Settings,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Dynamic import for Cytoscape to avoid SSR issues
let cytoscape: any = null;
let coseBilkent: any = null;

interface GraphNode {
  id: string;
  label: string;
  type: string;
  color?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface GraphVisualizationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  onNodeExpand?: (nodeId: string) => void;
  height?: number;
  className?: string;
}

export function GraphVisualization({
  nodes,
  edges,
  onNodeClick,
  onNodeExpand,
  height = 500,
  className,
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSize, setNodeSize] = useState([30]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // ✅ Initialize Cytoscape ONCE
  useEffect(() => {
    const initCytoscape = async () => {
      if (!cytoscape) {
        cytoscape = (await import("cytoscape")).default;
        // @ts-ignore - Ignore type checking for cytoscape-cose-bilkent module
        coseBilkent = (await import("cytoscape-cose-bilkent")).default;
        cytoscape.use(coseBilkent);
      }

      if (containerRef.current && !cyRef.current) {
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: [],
          style: [
            {
              selector: "node",
              style: {
                "background-color": "data(color)",
                label: showLabels ? "data(label)" : "",
                width: nodeSize[0],
                height: nodeSize[0],
                "text-valign": "center",
                "text-halign": "center",
                "font-size": "12px",
                "font-weight": "bold",
                color: "#333",
                "text-outline-width": 2,
                "text-outline-color": "#fff",
                "border-width": 2,
                "border-color": "#fff",
                cursor: "pointer",
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
                label: "data(label)",
                "font-size": "10px",
                "text-rotation": "autorotate",
                "text-margin-y": -10,
              },
            },
            {
              selector: "node:hover",
              style: {
                "border-width": 4,
                "border-color": "#007bff",
              },
            },
          ],
          layout: {
            name: "cose-bilkent",
            animate: true,
            fit: true,
            padding: 50,
          },
        });

        // Add event listeners
        cyRef.current.on("tap", "node", (evt: any) => {
          const node = evt.target.data();
          onNodeClick?.(node);
        });

        cyRef.current.on("dbltap", "node", (evt: any) => {
          const node = evt.target.data();
          onNodeExpand?.(node.id);
        });

        setIsLoading(false);
      }
    };

    initCytoscape();

    // Cleanup only once, when component unmounts
    return () => {
      if (cyRef.current) {
        try {
          cyRef.current.destroy();
          console.warn("Cytoscape destroyed");
        } catch (e) {
          console.warn("Cytoscape destroy failed:", e);
        }
        cyRef.current = null;
      }
    };
  }, []);

  // ✅ Update elements whenever nodes/edges change
  useEffect(() => {
    if (!cyRef.current) return;

    const elements = [
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          color: node.color || getNodeColor(node.type),
        },
      })),
      ...edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label || "",
        },
      })),
    ];

    cyRef.current.json({ elements });
    cyRef.current.layout({ name: "cose-bilkent", animate: true }).run();
  }, [nodes, edges]);

  // ✅ Update labels toggle
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current
        .style()
        .selector("node")
        .style("label", showLabels ? "data(label)" : "")
        .update();
    }
  }, [showLabels]);

  // ✅ Update node size
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current
        .style()
        .selector("node")
        .style({
          width: nodeSize[0],
          height: nodeSize[0],
        })
        .update();
    }
  }, [nodeSize]);

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      skill: "#8B5CF6",
      jobrole: "#F59E0B",
      department: "#14B8A6",
      industry: "#3B82F6",
      default: "#6B7280",
    };
    return colors[type] || colors.default;
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      cyRef.current.center();
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      cyRef.current.center();
    }
  };

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({
        output: "blob",
        bg: "white",
        full: true,
        scale: 2,
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(png);
      link.download = "graph-visualization.png";
      link.click();
    }
  };

  const nodeTypes = Array.from(new Set(nodes.map((node) => node.type)));
  const nodeStats = nodeTypes.map((type) => ({
    type,
    count: nodes.filter((n) => n.type === type).length,
    color: getNodeColor(type),
  }));

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Graph Visualization
            <Badge variant="secondary">
              {nodes.length} nodes, {edges.length} edges
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowControls(!showControls)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {/* Graph Container */}
          <div
            ref={containerRef}
            className={cn(
              "border rounded-lg bg-gray-50",
              isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
            )}
            style={{ height: isFullscreen ? "100vh" : height }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading graph...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          {showControls && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-4 min-w-[200px]"
            >
              {/* Zoom Controls */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Controls</h4>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={handleZoomIn}>
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleZoomOut}>
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleFullscreen}>
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Display</h4>

                <div className="flex items-center justify-between">
                  <span className="text-xs">Show Labels</span>
                  <Switch checked={showLabels} onCheckedChange={setShowLabels} />
                </div>

                <div className="space-y-2">
                  <span className="text-xs">Node Size</span>
                  <Slider
                    value={nodeSize}
                    onValueChange={setNodeSize}
                    max={60}
                    min={20}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Legend</h4>
                <div className="space-y-1">
                  {nodeStats.map((stat) => (
                    <div
                      key={stat.type}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="capitalize">{stat.type}</span>
                      <span className="text-gray-500">({stat.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="font-medium text-sm flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Instructions
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Click node to view details</p>
                  <p>• Double-click to expand</p>
                  <p>• Drag to pan around</p>
                  <p>• Scroll to zoom</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
