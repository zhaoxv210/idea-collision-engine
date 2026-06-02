import { create } from 'zustand';

export interface Concept {
  id: string;
  label: string;
  domain: string;
  isSeed: boolean;
}

export interface Relation {
  source: string;
  target: string;
  similarity?: string;
  causality?: string;
  metaphor?: string;
  strength: number;
}

export interface CollisionPair {
  a: Concept;
  b: Concept;
  dimension: string;
  explanation: string;
  reinterpretation: string;
  newIdea: string;
}

export interface Idea {
  title: string;
  description: string;
}

export interface SynthesisResult {
  insights: string[];
  ideas: Idea[];
  research: string[];
}

export type EnginePhase = 'idle' | 'expanding' | 'relating' | 'colliding' | 'synthesizing' | 'done' | 'error';

interface EngineState {
  phase: EnginePhase;
  keywords: string[];
  concepts: Concept[];
  relations: Relation[];
  collisions: CollisionPair[];
  synthesis: SynthesisResult | null;
  thinkingStream: string;
  error: string | null;

  setPhase: (phase: EnginePhase) => void;
  setKeywords: (keywords: string[]) => void;
  setConcepts: (concepts: Concept[]) => void;
  addConcepts: (concepts: Concept[]) => void;
  setRelations: (relations: Relation[]) => void;
  setCollisions: (collisions: CollisionPair[]) => void;
  setSynthesis: (synthesis: SynthesisResult) => void;
  appendThinking: (chunk: string) => void;
  clearThinking: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as EnginePhase,
  keywords: [],
  concepts: [],
  relations: [],
  collisions: [],
  synthesis: null,
  thinkingStream: '',
  error: null,
};

export const useEngineStore = create<EngineState>()((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  setKeywords: (keywords) => set({ keywords }),
  setConcepts: (concepts) => set({ concepts }),
  addConcepts: (concepts) =>
    set((state) => ({
      concepts: [...state.concepts, ...concepts],
    })),
  setRelations: (relations) => set({ relations }),
  setCollisions: (collisions) => set({ collisions }),
  setSynthesis: (synthesis) => set({ synthesis }),
  appendThinking: (chunk) =>
    set((state) => ({
      thinkingStream: state.thinkingStream + chunk,
    })),
  clearThinking: () => set({ thinkingStream: '' }),
  setError: (error) => set({ error, phase: error ? 'error' : 'idle' }),
  reset: () => set(initialState),
}));
