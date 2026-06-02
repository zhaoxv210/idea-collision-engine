import { useMemo, useState, useEffect, useRef } from 'react';
import type { Concept, Relation } from '@/store/useEngineStore';

interface ConceptGraphProps {
  concepts: Concept[];
  relations: Relation[];
}

const DOMAIN_COLORS: Record<string, string> = {
  科技: '#4A6FA5',
  技术: '#4A6FA5',
  历史: '#C84B4B',
  生命科学: '#7A8471',
  生物: '#7A8471',
  艺术: '#9B7BB3',
  社会: '#D4956A',
  社会学: '#D4956A',
  物理: '#5B8C85',
  心理: '#A67C7C',
  心理学: '#A67C7C',
  经济: '#8B9A6D',
  经济学: '#8B9A6D',
};

interface Node {
  id: string;
  label: string;
  domain: string;
  isSeed: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  source: Node;
  target: Node;
  strength: number;
  similarity?: string;
  metaphor?: string;
}

function isEdge(e: { source: Node; target: Node; strength: number; similarity?: string; metaphor?: string } | null): e is Edge {
  return e !== null;
}

export function ConceptGraph({ concepts, relations }: ConceptGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: Math.max(400, rect.height) });
    }
  }, []);

  const { nodes, edges } = useMemo(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35;

    const nodes: Node[] = concepts.map((c, i) => {
      const angle = (2 * Math.PI * i) / concepts.length;
      const r = c.isSeed ? radius * 0.6 : radius;
      return {
        ...c,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const edges: Edge[] = relations
      .map((r) => {
        const source = nodeMap.get(r.source);
        const target = nodeMap.get(r.target);
        if (!source || !target) return null;
        return {
          source,
          target,
          strength: r.strength,
          similarity: r.similarity,
          metaphor: r.metaphor,
        };
      })
      .filter(isEdge);

    for (let iter = 0; iter < 100; iter++) {
      for (const node of nodes) {
        for (const other of nodes) {
          if (node.id === other.id) continue;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = 60;
          if (dist < minDist) {
            const force = (minDist - dist) / dist;
            node.vx -= dx * force * 0.1;
            node.vy -= dy * force * 0.1;
          }
        }
      }

      for (const edge of edges) {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 120;
        const force = (dist - targetDist) / dist;
        edge.source.vx += dx * force * 0.05;
        edge.source.vy += dy * force * 0.05;
        edge.target.vx -= dx * force * 0.05;
        edge.target.vy -= dy * force * 0.05;
      }

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x = Math.max(40, Math.min(dimensions.width - 40, node.x));
        node.y = Math.max(40, Math.min(dimensions.height - 40, node.y));
      }
    }

    return { nodes, edges };
  }, [concepts, relations, dimensions]);

  if (concepts.length === 0) return null;

  const getNodeColor = (domain: string) => DOMAIN_COLORS[domain] || '#D4A574';

  return (
    <div ref={containerRef} className="relative w-full h-[500px]">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      >
        <defs>
          {Object.entries(DOMAIN_COLORS).map(([domain, color]) => (
            <radialGradient key={domain} id={`glow-${domain}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {edges.map((edge, i) => {
          const midX = (edge.source.x + edge.target.x) / 2;
          const midY = (edge.source.y + edge.target.y) / 2;
          const isHovered = hoveredEdge === edge;

          return (
            <g key={i}>
              <line
                x1={edge.source.x}
                y1={edge.source.y}
                x2={edge.target.x}
                y2={edge.target.y}
                stroke={isHovered ? '#D4A574' : '#E8DCC4'}
                strokeOpacity={isHovered ? 0.8 : edge.strength * 0.5}
                strokeWidth={isHovered ? 2 : 1}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEdge(edge)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {isHovered && edge.metaphor && (
                <text
                  x={midX}
                  y={midY - 10}
                  textAnchor="middle"
                  className="fill-parchment font-body text-xs pointer-events-none"
                >
                  {edge.metaphor.slice(0, 30)}...
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((node) => {
          const color = getNodeColor(node.domain);
          const isHovered = hoveredNode === node;
          const radius = node.isSeed ? 20 : 12;

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={radius + 10}
                fill={`url(#glow-${node.domain})`}
                opacity={isHovered ? 1 : 0.5}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={color}
                stroke={isHovered ? '#D4A574' : color}
                strokeWidth={isHovered ? 2 : 1}
              />
              <text
                x={node.x}
                y={node.y + radius + 16}
                textAnchor="middle"
                className={`font-body text-xs ${isHovered ? 'fill-amber-gold' : 'fill-parchment/70'}`}
              >
                {node.label.length > 8 ? node.label.slice(0, 8) + '...' : node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredNode && (
        <div
          className="absolute bottom-4 left-4 card p-3 max-w-xs animate-fade-in"
          style={{ borderColor: getNodeColor(hoveredNode.domain) }}
        >
          <div className="font-body font-medium text-parchment">{hoveredNode.label}</div>
          <div className="text-xs text-parchment/50 mt-1">
            {hoveredNode.domain} · {hoveredNode.isSeed ? '种子概念' : '扩展概念'}
          </div>
        </div>
      )}
    </div>
  );
}
