import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IdeaNodeType = 'user' | 'ai-generated';

export interface IdeaNode {
  id: string;
  text: string;
  type: IdeaNodeType;
  x: number;
  y: number;
}

export type EdgeType = 'manual' | 'ai-suggested';

export interface IdeaEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  explanation?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface AISuggestion {
  from: string;
  to: string;
  reason: string;
}

interface CanvasState {
  nodes: IdeaNode[];
  edges: IdeaEdge[];
  selectedNodeIds: string[];
  selectedEdgeId: string | null;
  aiSuggestions: AISuggestion[];
  isProcessing: boolean;

  addNode: (node: Omit<IdeaNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<IdeaNode>) => void;
  removeNode: (id: string) => void;
  setNodes: (nodes: IdeaNode[]) => void;

  addEdge: (edge: Omit<IdeaEdge, 'id'>) => string;
  updateEdge: (id: string, updates: Partial<IdeaEdge>) => void;
  removeEdge: (id: string) => void;
  setEdges: (edges: IdeaEdge[]) => void;

  selectNode: (id: string | null, multi?: boolean) => void;
  selectEdge: (id: string | null) => void;
  clearSelection: () => void;

  setAISuggestions: (suggestions: AISuggestion[]) => void;
  clearAISuggestions: () => void;

  setIsProcessing: (processing: boolean) => void;

  clearCanvas: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeIds: [],
      selectedEdgeId: null,
      aiSuggestions: [],
      isProcessing: false,

      addNode: (node) => {
        const id = generateId();
        set((state) => ({
          nodes: [...state.nodes, { ...node, id }],
        }));
        return id;
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        }));
      },

      removeNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.from !== id && e.to !== id),
          selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
        }));
      },

      setNodes: (nodes) => set({ nodes }),

      addEdge: (edge) => {
        const id = generateId();
        set((state) => ({
          edges: [...state.edges, { ...edge, id }],
        }));
        return id;
      },

      updateEdge: (id, updates) => {
        set((state) => ({
          edges: state.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      removeEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== id),
          selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
        }));
      },

      setEdges: (edges) => set({ edges }),

      selectNode: (id, multi = false) => {
        if (id === null) {
          set({ selectedNodeIds: [], selectedEdgeId: null });
          return;
        }

        set((state) => {
          if (multi) {
            const isSelected = state.selectedNodeIds.includes(id);
            return {
              selectedNodeIds: isSelected
                ? state.selectedNodeIds.filter((nid) => nid !== id)
                : [...state.selectedNodeIds, id],
              selectedEdgeId: null,
            };
          } else {
            return {
              selectedNodeIds: [id],
              selectedEdgeId: null,
            };
          }
        });
      },

      selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeIds: [] }),

      clearSelection: () => set({ selectedNodeIds: [], selectedEdgeId: null }),

      setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
      clearAISuggestions: () => set({ aiSuggestions: [] }),

      setIsProcessing: (processing) => set({ isProcessing: processing }),

      clearCanvas: () =>
        set({
          nodes: [],
          edges: [],
          selectedNodeIds: [],
          selectedEdgeId: null,
          aiSuggestions: [],
        }),
    }),
    {
      name: 'idea-canvas-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
