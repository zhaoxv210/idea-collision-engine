import { useState, useEffect } from 'react';
import { CanvasPage } from '@/pages/CanvasPage';
import { SettingsPage } from '@/components/SettingsPage';
import { ProjectListPage } from '@/components/ProjectListPage';
import { useProjectStore } from '@/store/useProjectStore';
import { useCanvasStore } from '@/store/useCanvasStore';

type View = 'projects' | 'canvas' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('projects');
  const { currentProjectId, projects, getCurrentProject, switchProject } = useProjectStore();
  const { setNodes, setEdges, nodes, edges } = useCanvasStore();

  const currentProject = getCurrentProject();

  useEffect(() => {
    if (currentProjectId && view === 'canvas') {
      const project = getCurrentProject();
      if (project) {
        setNodes(project.nodes);
        setEdges(project.edges);
      }
    }
  }, [currentProjectId, view]);

  useEffect(() => {
    if (!currentProjectId && projects.length > 0) {
      switchProject(projects[0].id);
    }
  }, [currentProjectId, projects.length]);

  const handleOpenProject = (projectId: string) => {
    switchProject(projectId);
    setView('canvas');
  };

  const handleSaveProject = () => {
    if (currentProjectId) {
      useProjectStore.getState().saveCurrentProject(nodes, edges);
    }
  };

  useEffect(() => {
    if (view === 'canvas' && currentProjectId) {
      const interval = setInterval(() => {
        useProjectStore.getState().saveCurrentProject(
          useCanvasStore.getState().nodes,
          useCanvasStore.getState().edges
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [view, currentProjectId]);

  if (view === 'settings') {
    return <SettingsPage onBack={() => setView('canvas')} />;
  }

  if (view === 'projects' || !currentProjectId) {
    return <ProjectListPage onOpenProject={handleOpenProject} />;
  }

  return (
    <CanvasPage
      onSettings={() => setView('settings')}
      onProjects={() => {
        handleSaveProject();
        setView('projects');
      }}
      projectName={currentProject?.name || '未命名项目'}
    />
  );
}
