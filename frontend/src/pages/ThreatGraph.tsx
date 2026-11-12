import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Network, 
  Filter, 
  Search, 
  Info, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { getThreatGraph } from '../services/api';
import { ThreatGraphResponse, GraphNode, RiskLevel } from '../types';
import { RiskBadge } from '../components/RiskBadge';

const ThreatGraph: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [graphData, setGraphData] = useState<ThreatGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [edgeFilter, setEdgeFilter] = useState<'all' | 'verified' | 'inferred'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scanIdParam = searchParams.get('scan_id');

  const fetchGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { hops: 2 };
      if (scanIdParam) {
        params.scan_id = scanIdParam;
      }
      const data = await getThreatGraph(params);
      setGraphData(data);
      if (data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load threat intelligence graph.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [scanIdParam]);

  // Filter nodes based on type and search query
  const filteredNodes = (graphData?.nodes || []).filter(node => {
    const matchesType = filterType === 'all' || node.type === filterType;
    const matchesSearch = !searchQuery || 
      node.full_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  // Filter edges based on verified/inferred and valid node endpoints
  const filteredEdges = (graphData?.edges || []).filter(edge => {
    const validEndpoints = filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target);
    if (!validEndpoints) return false;
    if (edgeFilter === 'verified') return edge.is_verified;
    if (edgeFilter === 'inferred') return !edge.is_verified;
    return true;
  });

  // Calculate layout coordinates for SVG rendering (radial layout)
  const width = 800;
  const height = 550;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 210;

  const nodePositions = new Map<string, { x: number; y: number }>();
  filteredNodes.forEach((node, index) => {
    if (index === 0) {
      // Place first/seed node in center
      nodePositions.set(node.id, { x: centerX, y: centerY });
    } else {
      const angle = ((index - 1) / Math.max(1, filteredNodes.length - 1)) * 2 * Math.PI;
      const dist = radius * (0.65 + (index % 3) * 0.22);
      nodePositions.set(node.id, {
        x: centerX + dist * Math.cos(angle),
        y: centerY + dist * Math.sin(angle)
      });
    }
  });

  const getNodeColor = (type: string, risk: RiskLevel) => {
    if (risk === 'Critical') return '#dc2626'; // red
    if (risk === 'High') return '#ea580c';     // orange
    if (risk === 'Medium') return '#d97706';   // amber
    if (type === 'domain') return '#2563eb';   // blue
    if (type === 'phone' || type === 'upi') return '#7c3aed'; // purple
    return '#4b5563'; // gray
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-[#1c1a17] text-white p-6 rounded-xl border border-[#2b2823] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Core Innovation 1 • Veriq & CyberTrust 360 Inspired
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#faf8f5] tracking-tight">
              Evidence Relationship Intelligence Graph
            </h1>
            <p className="text-sm text-[#a8a29e] mt-1 max-w-3xl">
              Cross-investigation threat correlation correlating URLs, domains, IPs, phone numbers, UPI identifiers, and scam campaigns. Solid edges represent mathematically verified infrastructure matches; dashed edges represent heuristic pattern inferences.
            </p>
          </div>
          <button
            onClick={fetchGraph}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-[#2b2823] hover:bg-[#3d3830] text-[#faf8f5] text-sm font-semibold rounded-lg border border-[#44403c] transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Graph</span>
          </button>
        </div>

        {/* Graph Stats Bar */}
        {graphData && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[#2b2823] text-xs">
            <div className="bg-[#141210] p-3 rounded-lg border border-[#2b2823]">
              <span className="text-[#a8a29e] block font-medium">Total Entities</span>
              <span className="text-lg font-bold text-[#faf8f5]">{graphData.stats.total_nodes}</span>
            </div>
            <div className="bg-[#141210] p-3 rounded-lg border border-[#2b2823]">
              <span className="text-[#a8a29e] block font-medium">Relationships</span>
              <span className="text-lg font-bold text-[#faf8f5]">{graphData.stats.total_edges}</span>
            </div>
            <div className="bg-[#141210] p-3 rounded-lg border border-[#2b2823]">
              <span className="text-emerald-400 block font-medium">Verified (Solid)</span>
              <span className="text-lg font-bold text-emerald-300">{graphData.stats.verified_edges}</span>
            </div>
            <div className="bg-[#141210] p-3 rounded-lg border border-[#2b2823]">
              <span className="text-amber-400 block font-medium">Inferred (Dashed)</span>
              <span className="text-lg font-bold text-amber-300">{graphData.stats.inferred_edges}</span>
            </div>
            <div className="bg-[#141210] p-3 rounded-lg border border-[#2b2823]">
              <span className="text-red-400 block font-medium">High Risk Nodes</span>
              <span className="text-lg font-bold text-red-300">{graphData.stats.critical_entities}</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-lg font-semibold">
          {error}
        </div>
      )}

      {/* Main Grid: Controls + Visual Graph + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#e5e2dc] shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#52504c]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs font-semibold text-[#1c1a17] bg-[#f5f2eb] border border-[#e5e2dc] rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1c1a17]"
              >
                <option value="all">All Entity Types</option>
                <option value="url">URLs</option>
                <option value="domain">Domains</option>
                <option value="ip">IP Addresses</option>
                <option value="phone">Phones</option>
                <option value="email">Emails</option>
                <option value="upi">UPI VPAs</option>
                <option value="brand">Brands</option>
                <option value="scan">Scan Roots</option>
              </select>

              <select
                value={edgeFilter}
                onChange={(e) => setEdgeFilter(e.target.value as any)}
                className="text-xs font-semibold text-[#1c1a17] bg-[#f5f2eb] border border-[#e5e2dc] rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1c1a17]"
              >
                <option value="all">All Relationship Edges</option>
                <option value="verified">Verified Matches Only (Solid)</option>
                <option value="inferred">Inferred Correlations (Dashed)</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#52504c] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search indicator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 bg-[#f5f2eb] border border-[#e5e2dc] rounded-md text-[#1c1a17] focus:outline-none focus:ring-1 focus:ring-[#1c1a17] w-48"
              />
            </div>
          </div>

          {/* SVG Graph Canvas */}
          <div className="bg-[#141210] rounded-xl border border-[#2b2823] p-4 relative overflow-hidden shadow-inner flex items-center justify-center min-h-[550px]">
            {loading ? (
              <div className="text-center py-20 text-[#a8a29e] flex flex-col items-center">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
                <p className="text-sm font-semibold">Traversing entity relationships...</p>
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="text-center py-20 text-[#a8a29e]">
                <Network className="w-10 h-10 text-[#52504c] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#faf8f5]">No connected threat entities found</p>
                <p className="text-xs text-[#a8a29e] mt-1">Submit a URL or message scan to start building your threat relationship graph.</p>
              </div>
            ) : (
              <svg width="100%" height="550" viewBox={`0 0 ${width} ${height}`} className="cursor-grab active:cursor-grabbing">
                <defs>
                  <marker id="arrow-verified" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
                  </marker>
                  <marker id="arrow-inferred" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
                  </marker>
                </defs>

                {/* Edges */}
                {filteredEdges.map(edge => {
                  const src = nodePositions.get(edge.source);
                  const tgt = nodePositions.get(edge.target);
                  if (!src || !tgt) return null;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={edge.is_verified ? "#10b981" : "#f59e0b"}
                        strokeWidth={edge.is_verified ? 2 : 1.5}
                        strokeDasharray={edge.is_verified ? "none" : "5,4"}
                        opacity={0.65}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map(node => {
                  const pos = nodePositions.get(node.id);
                  if (!pos) return null;
                  const isSelected = selectedNode?.id === node.id;
                  const color = getNodeColor(node.type, node.risk_level);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <circle
                        r={isSelected ? 18 : 14}
                        fill={color}
                        stroke={isSelected ? "#faf8f5" : "#1c1a17"}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                      <text
                        y={24}
                        textAnchor="middle"
                        fill="#e5e2dc"
                        fontSize={10}
                        fontWeight="600"
                        className="select-none pointer-events-none drop-shadow"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Canvas Legend */}
            <div className="absolute bottom-3 left-3 bg-[#1c1a17]/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#2b2823] text-[11px] text-[#e5e2dc] flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-0.5 bg-emerald-500 inline-block"></span>
                <span>Verified Match (Solid)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-0.5 border-b border-dashed border-amber-500 inline-block"></span>
                <span>Inferred Correlation (Dashed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Evidence Inspection Drawer */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm">
            <h2 className="text-base font-bold text-[#1c1a17] mb-4 flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Entity Forensic Details</span>
            </h2>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#52504c] font-semibold block uppercase tracking-wider text-[10px]">Entity Type</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-[#f5f2eb] text-[#1c1a17] border border-[#e5e2dc] mt-1 capitalize">
                    {selectedNode.type}
                  </span>
                </div>

                <div>
                  <span className="text-[#52504c] font-semibold block uppercase tracking-wider text-[10px]">Risk Classification</span>
                  <div className="mt-1">
                    <RiskBadge level={selectedNode.risk_level} size="sm" />
                  </div>
                </div>

                <div>
                  <span className="text-[#52504c] font-semibold block uppercase tracking-wider text-[10px]">Canonical Value</span>
                  <div className="bg-[#f5f2eb] p-2.5 rounded-lg border border-[#e5e2dc] font-mono text-[11px] text-[#1c1a17] break-all select-all mt-1">
                    {selectedNode.full_value}
                  </div>
                </div>

                {selectedNode.scan_id && (
                  <div>
                    <span className="text-[#52504c] font-semibold block uppercase tracking-wider text-[10px]">Source Investigation ID</span>
                    <span className="font-mono text-[#52504c] block mt-1 break-all">
                      {selectedNode.scan_id}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#e5e2dc]">
                  <span className="text-[#1c1a17] font-bold block mb-2">Connected Relationships ({filteredEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length})</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredEdges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map(edge => {
                        const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const otherNode = graphData?.nodes.find(n => n.id === otherId);

                        return (
                          <div key={edge.id} className="p-2 rounded-lg bg-[#f5f2eb] border border-[#e5e2dc] text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#1c1a17]">{edge.relationship}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${edge.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {edge.is_verified ? 'VERIFIED' : 'INFERRED'}
                              </span>
                            </div>
                            <p className="text-[#52504c] mt-1 truncate">
                              Target: <span className="font-mono text-[#1c1a17]">{otherNode?.label || otherId.substring(0, 8)}</span>
                            </p>
                            {edge.evidence && (
                              <p className="text-[#78716c] text-[10px] mt-0.5 italic">"{edge.evidence}"</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#52504c] py-8 text-center">
                Click any node on the graph canvas to inspect technical indicators and campaign links.
              </p>
            )}
          </div>

          {/* Attribution & Principles Card */}
          <div className="bg-[#f5f2eb] p-4 rounded-xl border border-[#e5e2dc] text-xs space-y-2">
            <h3 className="font-bold text-[#1c1a17] flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Graph Correlation Standards</span>
            </h3>
            <p className="text-[#52504c] text-[11px] leading-relaxed">
              <strong>Solid Edges (Verified)</strong>: Strict cryptographic or technical indicator matches (shared registered domain, exact IP address, exact phone number, or matching UPI VPA).
            </p>
            <p className="text-[#52504c] text-[11px] leading-relaxed">
              <strong>Dashed Edges (Inferred)</strong>: Heuristic or behavioral associations (brand impersonation lure, similar text templates). Never presented as criminal attribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatGraph;
