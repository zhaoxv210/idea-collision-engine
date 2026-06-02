import { Loader2 } from 'lucide-react';
import type { EnginePhase } from '@/store/useEngineStore';
import { cn } from '@/lib/utils';

interface EngineProgressProps {
  phase: EnginePhase;
}

const PHASES = [
  { id: 'expanding', label: '概念扩展', icon: '📚' },
  { id: 'relating', label: '关系推理', icon: '🔗' },
  { id: 'colliding', label: '概念碰撞', icon: '💥' },
  { id: 'synthesizing', label: '综合生成', icon: '✨' },
] as const;

export function EngineProgress({ phase }: EngineProgressProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === phase);
  const isActive = phase !== 'idle' && phase !== 'done' && phase !== 'error';

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-4 py-4">
      {PHASES.map((p, index) => {
        const isCompleted = currentIndex > index;
        const isCurrent = currentIndex === index;

        return (
          <div key={p.id} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                isCompleted && 'border-amber-gold bg-amber-gold/20',
                isCurrent && 'border-amber-gold bg-amber-gold/10 animate-pulse-glow',
                !isCompleted && !isCurrent && 'border-parchment/20'
              )}
            >
              {isCurrent ? (
                <Loader2 className="text-amber-gold animate-spin" size={20} />
              ) : (
                <span className={cn(isCompleted ? 'text-amber-gold' : 'text-parchment/40')}>
                  {p.icon}
                </span>
              )}
            </div>
            <span
              className={cn(
                'font-body text-sm',
                isCurrent && 'text-amber-gold',
                isCompleted && 'text-parchment',
                !isCompleted && !isCurrent && 'text-parchment/40'
              )}
            >
              {p.label}
            </span>
            {index < PHASES.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-2 transition-colors',
                  isCompleted ? 'bg-amber-gold' : 'bg-parchment/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
