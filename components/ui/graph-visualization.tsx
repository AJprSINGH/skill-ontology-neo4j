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



import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  Settings,
  Eye,
  EyeOff,
  Info,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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
  onPathFind?: (sourceId: string, targetId: string) => void;
}

export function GraphVisualization({
  nodes,
  edges,
  onNodeClick,
  onNodeExpand,
  height = 500,
  className,
  onPathFind
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSize, setNodeSize] = useState([30]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [showPathfinder, setShowPathfinder] = useState(false);
  const [sourceNode, setSourceNode] = useState<string>('');
  const [targetNode, setTargetNode] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    let isMounted = true;

    const initCytoscape = async () => {
      try {
        if (!cytoscape) {
          const [cyto, bilkent] = await Promise.all([
            import('cytoscape'),
            import('cytoscape-cose-bilkent'),
          ]);
          cytoscape = cyto.default;
          coseBilkent = bilkent.default;
          cytoscape.use(coseBilkent);
        }

        // 🧠 Wait two animation frames to ensure DOM + React update complete
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        if (!isMounted || !containerRef.current) return;
        if (nodes.length === 0) return;

        // 💥 Always destroy previous instance BEFORE creating new one
        if (cyRef.current) {
          cyRef.current.destroy();
          cyRef.current = null;
        }

        // Prepare graph data
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
              label: edge.label || '',
            },
          })),
        ];

        // 🧩 Create new Cytoscape instance
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements,
          style: [
            {
              selector: 'node',
              style: {
                'background-color': 'data(color)',
                'label': showLabels ? 'data(label)' : '',
                'width': nodeSize[0],
                'height': nodeSize[0],
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '11px',
                'font-weight': 'bold',
                'color': '#333',
                'text-outline-width': 2,
                'text-outline-color': '#fff',
                'border-width': 2,
                'border-color': '#fff',
                'cursor': 'pointer',
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#aaa',
                'target-arrow-color': '#aaa',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '9px',
                'text-rotation': 'autorotate',
                'text-margin-y': -8,
              },
            },
          ],
        });

        // Layout
        const layout = cyRef.current.layout({
          name: 'cose-bilkent',
          animate: true,
          fit: true,
          padding: 100,
          nodeRepulsion: 8000,
          idealEdgeLength: 150,
          edgeElasticity: 0.5,
          gravity: 0.25,
        });

        layout.run();

        layout.on('layoutstop', () => {
          if (cyRef.current) {
            cyRef.current.fit();
            cyRef.current.center();
            setIsLoading(false);
          }
        });

        // Node click handler
        cyRef.current.on('tap', 'node', (evt: any) => {
          const node = evt.target.data();
          setSelectedNode(node);
          setShowNodeDetails(true);
          onNodeClick?.(node);
        });
      } catch (err) {
        console.error('Cytoscape initialization failed:', err);
        setIsLoading(false);
      }
    };

    initCytoscape();

    return () => {
      isMounted = false;
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [nodes, edges]);


  // Update node labels
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style()
        .selector('node')
        .style('label', showLabels ? 'data(label)' : '')
        .update();
    }
  }, [showLabels]);

  // Update node size
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style()
        .selector('node')
        .style({
          'width': nodeSize[0],
          'height': nodeSize[0]
        })
        .update();
    }
  }, [nodeSize]);

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      skill: '#8B5CF6',
      jobrole: '#F59E0B',
      department: '#14B8A6',
      industry: '#3B82F6',
      default: '#6B7280'
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
        output: 'blob',
        bg: 'white',
        full: true,
        scale: 2
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(png);
      link.download = 'graph-visualization.png';
      link.click();
    }
  };

  const handlePathFind = () => {
    if (sourceNode && targetNode && onPathFind) {
      console.log(`Finding path from ${sourceNode} to ${targetNode}`);
      onPathFind(sourceNode, targetNode);
      setShowPathfinder(false);
    }
  };

  const availableNodes = nodes;

  const nodeTypes = Array.from(new Set(nodes.map(n => n.type)));
  const nodeStats = nodeTypes.map(type => ({
    type,
    count: nodes.filter(n => n.type === type).length,
    color: getNodeColor(type)
  }));

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Graph Visualization
            <Badge variant="secondary">{nodes.length} nodes, {edges.length} edges</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowPathfinder(true)}
              variant="outline"
              size="sm"
              title="Find Path"
            >
              <Route className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {/* Hover Tooltip */}
          {hoveredNode && (
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-2 rounded-lg text-sm z-20 pointer-events-none">
              <div className="font-semibold">{hoveredNode.label}</div>
              <div className="text-xs opacity-75">{hoveredNode.type}</div>
            </div>
          )}

          {/* Graph Container */}
          <div
            ref={containerRef}
            className={cn(
              "border rounded-lg bg-gray-50",
              isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
            )}
            style={{ height: isFullscreen ? '100vh' : height }}
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
                  <Switch
                    checked={showLabels}
                    onCheckedChange={setShowLabels}
                  />
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
                  {nodeStats.map(stat => (
                    <div key={stat.type} className="flex items-center gap-2 text-xs">
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

      {/* Node Details Dialog */}
      <Dialog open={showNodeDetails} onOpenChange={setShowNodeDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Node Details
            </DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedNode.label}</h3>
                <Badge variant="secondary" className="mt-1">
                  {selectedNode.type}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-mono">{selectedNode.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span>{selectedNode.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Color:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: selectedNode.color }}
                    />
                    <span className="font-mono text-xs">{selectedNode.color}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    if (onNodeExpand) {
                      onNodeExpand(selectedNode.id);
                    }
                    setShowNodeDetails(false);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Expand Relationships
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pathfinder Dialog */}
      <Dialog open={showPathfinder} onOpenChange={setShowPathfinder}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Find Shortest Path
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Source Node</label>
              <Select value={sourceNode} onValueChange={setSourceNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {availableNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: node.color }}
                        />
                        {node.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Target Node</label>
              <Select value={targetNode} onValueChange={setTargetNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {availableNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: node.color }}
                        />
                        {node.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handlePathFind}
                disabled={!sourceNode || !targetNode || sourceNode === targetNode}
                className="flex-1"
              >
                Find Path
              </Button>
              <Button
                onClick={() => setShowPathfinder(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
