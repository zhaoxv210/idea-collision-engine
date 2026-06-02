import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type OnConnect,
  SelectionMode,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { IdeaNode } from './IdeaNode';
import { IdeaEdge } from './IdeaEdge';
import { useCanvasStore } from '@/store/useCanvasStore';
import { cn } from '@/lib/utils';

const nodeTypes = { ideaNode: IdeaNode };
const edgeTypes = { ideaEdge: IdeaEdge };

interface IdeaCanvasProps {
  className?: string;
}

export function IdeaCanvas({ className }: IdeaCanvasProps) {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNodeIds,
    selectedEdgeId,
    setNodes,
    setEdges,
    selectNode,
    selectEdge,
    addEdge: addStoreEdge,
    removeNode,
  } = useCanvasStore();

  const handleDeleteNode = useCallback(
    (id: string) => {
      removeNode(id);
    },
    [removeNode]
  );

  const [nodes, setLocalNodes, onNodesChange] = useNodesState(
    storeNodes.map((n) => ({
      id: n.id,
      type: 'ideaNode',
      position: { x: n.x, y: n.y },
      data: {
        text: n.text,
        type: n.type,
        onDelete: handleDeleteNode,
        selected: selectedNodeIds.includes(n.id),
      },
    }))
  );

  const [edges, setLocalEdges, onEdgesChange] = useEdgesState(
    storeEdges.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      type: 'ideaEdge',
      data: { type: e.type, explanation: e.explanation },
    }))
  );

  useEffect(() => {
    setLocalNodes(
      storeNodes.map((n) => ({
        id: n.id,
        type: 'ideaNode',
        position: { x: n.x, y: n.y },
        data: {
          text: n.text,
          type: n.type,
          onDelete: handleDeleteNode,
          selected: selectedNodeIds.includes(n.id),
        },
      }))
    );
  }, [storeNodes, selectedNodeIds, setLocalNodes, handleDeleteNode]);

  useEffect(() => {
    setLocalEdges(
      storeEdges.map((e) => ({
        id: e.id,
        source: e.from,
        target: e.to,
        type: 'ideaEdge',
        data: { type: e.type, explanation: e.explanation },
      }))
    );
  }, [storeEdges, setLocalEdges]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        addStoreEdge({
          from: connection.source,
          to: connection.target,
          type: 'manual',
        });
      }
    },
    [addStoreEdge]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const multi = event.shiftKey || event.ctrlKey || event.metaKey;
      selectNode(node.id, multi);
    },
    [selectNode]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onNodeDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event: any, node: Node) => {
      setNodes(
        storeNodes.map((n) =>
          n.id === node.id
            ? { ...n, x: node.position.x, y: node.position.y }
            : n
        )
      );
    },
    [storeNodes, setNodes]
  );

  return (
    <div className={cn('w-full h-full', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-ink-900"
        defaultEdgeOptions={{
          type: 'ideaEdge',
        }}
        connectionMode={ConnectionMode.Strict}
        snapToGrid
        snapGrid={[15, 15]}
        selectionOnDrag
        panOnDrag={[1]}
        selectionMode={SelectionMode.Partial}
      >
        <Background
          color="#E8DCC4"
          gap={40}
          size={1}
          className="!opacity-10"
        />
        <Controls
          className="!bg-ink-800 !border-parchment/20 !rounded-lg"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-ink-800 !border-parchment/20 !rounded-lg"
          nodeColor="#D4A574"
          maskColor="rgba(10, 11, 14, 0.8)"
        />
        <Panel position="top-left" className="!m-0">
          <div className="bg-ink-800/80 backdrop-blur-sm border border-parchment/10 rounded-lg px-3 py-2">
            <span className="text-parchment/60 font-body text-xs">
              节点: {storeNodes.length} | 连接: {storeEdges.length}
              {selectedNodeIds.length > 0 && ` | 选中: ${selectedNodeIds.length}`}
            </span>
          </div>
        </Panel>
        <Panel position="top-right" className="!m-0">
          <div className="bg-ink-800/80 backdrop-blur-sm border border-parchment/10 rounded-lg px-3 py-2">
            <span className="text-parchment/40 font-body text-xs">
              按住 Shift/Ctrl 多选节点
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
