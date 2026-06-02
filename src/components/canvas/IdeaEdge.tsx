import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface IdeaEdgeData {
  type: 'manual' | 'ai-suggested';
  explanation?: string;
}

function IdeaEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as unknown as IdeaEdgeData | undefined;
  const isAISuggested = edgeData?.type === 'ai-suggested';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={cn(
          'transition-all duration-200',
          isAISuggested ? 'stroke-domain-tech' : 'stroke-parchment/50'
        )}
        style={{
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: isAISuggested ? '5 5' : undefined,
        }}
      />
      {isAISuggested && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'absolute transform -translate-x-1/2 -translate-y-1/2',
              'w-5 h-5 rounded-full bg-domain-tech/20 border border-domain-tech/50',
              'flex items-center justify-center',
              'pointer-events-none'
            )}
            style={{
              left: labelX,
              top: labelY,
            }}
          >
            <span className="text-domain-tech text-[10px]">AI</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const IdeaEdge = IdeaEdgeComponent;
