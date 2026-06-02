import { useState } from 'react';
import { Settings, Trash2, Menu, X } from 'lucide-react';
import { IdeaCanvas } from '@/components/canvas/IdeaCanvas';
import { LeftPanel } from '@/components/canvas/LeftPanel';
import { RightPanel } from '@/components/canvas/RightPanel';
import { useCanvasStore } from '@/store/useCanvasStore';
import { cn } from '@/lib/utils';

interface CanvasPageProps {
  onSettings: () => void;
}

export function CanvasPage({ onSettings }: CanvasPageProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const { clearCanvas, nodes, edges } = useCanvasStore();

  return (
    <div className="h-screen flex flex-col bg-ink-900">
      <header className="flex-shrink-0 h-14 border-b border-parchment/10 bg-ink-800/50 backdrop-blur-sm">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl text-parchment">
              Idea <span className="text-amber-gold">Canvas</span>
            </h1>
            <span className="text-parchment/40 text-sm hidden md:inline">
              可视化思维画板
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className={cn(
                'btn-outline px-2 py-1.5 text-xs hidden md:flex items-center gap-1',
                leftPanelOpen && 'border-amber-gold/50'
              )}
            >
              {leftPanelOpen ? <X size={14} /> : <Menu size={14} />}
              <span className="hidden lg:inline">左侧</span>
            </button>
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={cn(
                'btn-outline px-2 py-1.5 text-xs hidden md:flex items-center gap-1',
                rightPanelOpen && 'border-amber-gold/50'
              )}
            >
              {rightPanelOpen ? <X size={14} /> : <Menu size={14} />}
              <span className="hidden lg:inline">右侧</span>
            </button>
            {nodes.length > 0 && (
              <button
                onClick={clearCanvas}
                className="btn-outline px-3 py-1.5 text-xs flex items-center gap-1 text-red-400/70 hover:text-red-400 hover:border-red-400/50"
              >
                <Trash2 size={14} />
                <span className="hidden lg:inline">清空</span>
              </button>
            )}
            <button onClick={onSettings} className="btn-outline px-3 py-1.5 text-xs flex items-center gap-1">
              <Settings size={14} />
              <span className="hidden lg:inline">配置</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {leftPanelOpen && (
          <aside className="flex-shrink-0 w-64 lg:w-72 border-r border-parchment/10 bg-ink-800/30 p-4 overflow-y-auto">
            <LeftPanel />
          </aside>
        )}

        <main className="flex-1 relative overflow-hidden">
          <IdeaCanvas className="absolute inset-0" />
        </main>

        {rightPanelOpen && (
          <aside className="flex-shrink-0 w-64 lg:w-80 border-l border-parchment/10 bg-ink-800/30 p-4 overflow-y-auto">
            <RightPanel />
          </aside>
        )}
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 top-14 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-ink-800/80 backdrop-blur-sm rounded-2xl border border-parchment/10 pointer-events-auto">
            <h2 className="font-display text-2xl text-parchment mb-4">
              开始构建你的思维网络
            </h2>
            <p className="text-parchment/60 font-body text-sm mb-6 max-w-md">
              在左侧面板添加想法节点，然后在画布上拖拽节点、手动连接，
              或让 AI 推荐有意义的连接关系。
            </p>
            <div className="flex items-center justify-center gap-4 text-parchment/40 text-xs">
              <span>💡 添加节点</span>
              <span>→</span>
              <span>🔗 连接节点</span>
              <span>→</span>
              <span>✨ AI 推荐</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
