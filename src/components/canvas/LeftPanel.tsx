import { useState } from 'react';
import { Plus, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { createProvider } from '@/llm';
import { suggestNewNodes } from '@/engine/canvasAI';
import { cn } from '@/lib/utils';

interface LeftPanelProps {
  className?: string;
}

export function LeftPanel({ className }: LeftPanelProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { nodes, addNode, isProcessing, setIsProcessing } = useCanvasStore();
  const temperature = useSettingsStore((s) => s.temperature);

  const handleAddNode = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const existingPositions = nodes.map((n) => ({ x: n.x, y: n.y }));
    let newX = 100;
    let newY = 100;

    if (existingPositions.length > 0) {
      const lastPos = existingPositions[existingPositions.length - 1];
      newX = lastPos.x + 250;
      newY = lastPos.y;
      if (newX > 800) {
        newX = 100;
        newY = lastPos.y + 150;
      }
    }

    addNode({
      text: trimmed,
      type: 'user',
      x: newX,
      y: newY,
    });

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNode();
    }
  };

  const handleSuggestNodes = async () => {
    if (nodes.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsGenerating(true);

    try {
      const config = useSettingsStore.getState();
      const provider = createProvider(config);

      const suggestions = await suggestNewNodes(nodes, provider, temperature);

      const baseX = Math.max(...nodes.map((n) => n.x)) + 250;
      const baseY = nodes.length > 0 ? nodes[0].y : 100;

      suggestions.slice(0, 5).forEach((text, i) => {
        addNode({
          text,
          type: 'ai-generated',
          x: baseX,
          y: baseY + i * 120,
        });
      });
    } catch (error) {
      console.error('Failed to suggest nodes:', error);
    } finally {
      setIsProcessing(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="space-y-2">
        <label className="text-parchment/60 font-body text-sm">添加想法节点</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入想法..."
            className="input-field flex-1"
            disabled={isProcessing}
          />
          <button
            onClick={handleAddNode}
            disabled={!input.trim() || isProcessing}
            className="btn-primary px-3"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="border-t border-parchment/10 pt-4">
        <button
          onClick={handleSuggestNodes}
          disabled={nodes.length === 0 || isProcessing}
          className={cn(
            'w-full btn-outline flex items-center justify-center gap-2',
            isGenerating && 'animate-pulse'
          )}
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{isGenerating ? 'AI 思考中...' : 'AI 建议新节点'}</span>
        </button>
        <p className="text-parchment/40 text-xs mt-2 text-center">
          基于现有节点，AI 会建议相关的新想法
        </p>
      </div>

      {nodes.length > 0 && (
        <div className="border-t border-parchment/10 pt-4">
          <label className="text-parchment/60 font-body text-sm mb-2 block">
            现有节点 ({nodes.length})
          </label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-ink-800/50 rounded-lg border border-parchment/10"
              >
                <span className="text-parchment text-sm truncate flex-1">
                  {node.text}
                </span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded',
                    node.type === 'user'
                      ? 'bg-amber-gold/20 text-amber-gold'
                      : 'bg-domain-tech/20 text-domain-tech'
                  )}
                >
                  {node.type === 'user' ? '用户' : 'AI'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
