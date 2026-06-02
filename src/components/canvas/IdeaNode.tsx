import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Lightbulb, Sparkles, X } from 'lucide-react';

interface IdeaNodeData {
  text: string;
  type: 'user' | 'ai-generated';
  selected?: boolean;
  onDelete?: (id: string) => void;
}

function IdeaNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as IdeaNodeData;
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selected || nodeData.selected;

  return (
    <div
      className={cn(
        'relative px-4 py-3 rounded-xl border-2 min-w-[120px] max-w-[200px]',
        'bg-ink-800/90 backdrop-blur-sm',
        'transition-all duration-200',
        isSelected
          ? 'border-amber-gold shadow-[0_0_20px_rgba(212,165,116,0.4)]'
          : 'border-parchment/20 hover:border-parchment/40'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-amber-gold/50 !border-2 !border-amber-gold"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-amber-gold/50 !border-2 !border-amber-gold"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-amber-gold/50 !border-2 !border-amber-gold"
      />

      {isHovered && nodeData.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            nodeData.onDelete?.(id);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 border border-red-400 flex items-center justify-center hover:bg-red-500 transition-colors z-10"
        >
          <X size={10} className="text-white" />
        </button>
      )}

      <div className="flex items-start gap-2">
        {nodeData.type === 'user' ? (
          <Lightbulb className="text-amber-gold flex-shrink-0 mt-0.5" size={14} />
        ) : (
          <Sparkles className="text-domain-tech flex-shrink-0 mt-0.5" size={14} />
        )}
        <span className="text-parchment font-body text-sm leading-tight break-words">
          {nodeData.text}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-amber-gold/50 !border-2 !border-amber-gold"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-amber-gold/50 !border-2 !border-amber-gold"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-amber-gold/50 !border-2 !border-amber-gold"
      />
    </div>
  );
}

export const IdeaNode = memo(IdeaNodeComponent);
