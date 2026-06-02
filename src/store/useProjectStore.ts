import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IdeaNode, IdeaEdge } from './useCanvasStore';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  nodes: IdeaNode[];
  edges: IdeaEdge[];
}

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;

  createProject: (name: string, description?: string) => string;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  updateProjectDescription: (id: string, description: string) => void;
  switchProject: (id: string) => void;
  saveCurrentProject: (nodes: IdeaNode[], edges: IdeaEdge[]) => void;
  getCurrentProject: () => Project | null;
  getProjectById: (id: string) => Project | undefined;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      createProject: (name, description) => {
        const id = generateId();
        const now = Date.now();
        const newProject: Project = {
          id,
          name,
          description,
          createdAt: now,
          updatedAt: now,
          nodes: [],
          edges: [],
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: id,
        }));
        return id;
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);
          const newCurrentId =
            state.currentProjectId === id
              ? newProjects.length > 0
                ? newProjects[0].id
                : null
              : state.currentProjectId;
          return {
            projects: newProjects,
            currentProjectId: newCurrentId,
          };
        });
      },

      renameProject: (id, name) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p
          ),
        }));
      },

      updateProjectDescription: (id, description) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, description, updatedAt: Date.now() } : p
          ),
        }));
      },

      switchProject: (id) => {
        set({ currentProjectId: id });
      },

      saveCurrentProject: (nodes, edges) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === currentProjectId
              ? { ...p, nodes, edges, updatedAt: Date.now() }
              : p
          ),
        }));
      },

      getCurrentProject: () => {
        const { projects, currentProjectId } = get();
        return projects.find((p) => p.id === currentProjectId) || null;
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },
    }),
    {
      name: 'idea-projects-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);
