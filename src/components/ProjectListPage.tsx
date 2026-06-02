import { useState } from 'react';
import { FolderOpen, Plus, Trash2, Edit2, Check, X, Calendar, Layers } from 'lucide-react';
import { useProjectStore, type Project } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';

interface ProjectListPageProps {
  onOpenProject: (projectId: string) => void;
}

export function ProjectListPage({ onOpenProject }: ProjectListPageProps) {
  const { projects, createProject, deleteProject, renameProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createProject(newName.trim(), newDescription.trim() || undefined);
    setNewName('');
    setNewDescription('');
    setIsCreating(false);
    onOpenProject(id);
  };

  const handleStartEdit = (project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) return;
    renameProject(editingId, editingName.trim());
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen grid-bg noise-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FolderOpen className="text-amber-gold" size={32} />
            <h1 className="heading-page">我的项目</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>新建项目</span>
          </button>
        </div>

        {isCreating && (
          <div className="card p-6 mb-6 border-amber-gold/30 animate-fade-in">
            <h2 className="text-parchment font-body font-medium mb-4">创建新项目</h2>
            <div className="space-y-4">
              <div>
                <label className="label-text">项目名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="输入项目名称..."
                  className="input-field"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="label-text">描述（可选）</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="简短描述..."
                  className="input-field"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="btn-primary">
                  创建并打开
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewName('');
                    setNewDescription('');
                  }}
                  className="btn-outline"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {projects.length === 0 && !isCreating ? (
          <div className="text-center py-20">
            <FolderOpen className="mx-auto text-parchment/20 mb-4" size={64} />
            <p className="text-parchment/40 font-body text-lg mb-2">还没有任何项目</p>
            <p className="text-parchment/30 text-sm mb-6">创建一个新项目开始你的创意之旅</p>
            <button onClick={() => setIsCreating(true)} className="btn-primary">
              创建第一个项目
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="card p-5 hover:border-amber-gold/40 transition-all cursor-pointer group"
              >
                {editingId === project.id ? (
                  <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="input-field flex-1 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <button onClick={handleSaveEdit} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded">
                      <Check size={16} />
                    </button>
                    <button onClick={handleCancelEdit} className="p-1.5 text-parchment/40 hover:bg-parchment/10 rounded">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-parchment font-body font-medium text-lg group-hover:text-amber-gold transition-colors"
                      onClick={() => onOpenProject(project.id)}
                    >
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(project);
                        }}
                        className="p-1.5 text-parchment/40 hover:text-parchment hover:bg-parchment/10 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定删除项目 "${project.name}"？此操作不可撤销。`)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {project.description && (
                  <p
                    className="text-parchment/50 text-sm mb-3 line-clamp-2"
                    onClick={() => onOpenProject(project.id)}
                  >
                    {project.description}
                  </p>
                )}

                <div
                  className="flex items-center gap-4 text-parchment/30 text-xs"
                  onClick={() => onOpenProject(project.id)}
                >
                  <div className="flex items-center gap-1">
                    <Layers size={12} />
                    <span>{project.nodes.length} 节点</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
