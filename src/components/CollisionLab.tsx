import type { CollisionPair } from '@/store/useEngineStore';
import { Sparkles } from 'lucide-react';

interface CollisionLabProps {
  collisions: CollisionPair[];
}

const DOMAIN_COLORS: Record<string, string> = {
  科技: '#4A6FA5',
  技术: '#4A6FA5',
  历史: '#C84B4B',
  生命科学: '#7A8471',
  生物: '#7A8471',
  艺术: '#9B7BB3',
  社会: '#D4956A',
  社会学: '#D4956A',
  物理: '#5B8C85',
  心理: '#A67C7C',
  心理学: '#A67C7C',
  经济: '#8B9A6D',
  经济学: '#8B9A6D',
};

export function CollisionLab({ collisions }: CollisionLabProps) {
  if (collisions.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="text-amber-gold" size={24} />
        <h2 className="heading-section">概念碰撞</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collisions.map((collision, index) => {
          const colorA = DOMAIN_COLORS[collision.a.domain] || '#D4A574';
          const colorB = DOMAIN_COLORS[collision.b.domain] || '#D4A574';

          return (
            <div
              key={index}
              className="card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div
                  className="px-3 py-1.5 rounded-lg border font-body text-sm"
                  style={{ borderColor: colorA, backgroundColor: `${colorA}20` }}
                >
                  {collision.a.label}
                </div>
                <span className="text-amber-gold font-display text-xl">×</span>
                <div
                  className="px-3 py-1.5 rounded-lg border font-body text-sm"
                  style={{ borderColor: colorB, backgroundColor: `${colorB}20` }}
                >
                  {collision.b.label}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-parchment/50">相似维度：</span>
                  <span className="text-parchment">{collision.dimension}</span>
                </div>
                <div>
                  <span className="text-parchment/50">交叉解释：</span>
                  <span className="text-parchment">{collision.explanation}</span>
                </div>
                <div className="pt-2 border-t border-parchment/10">
                  <span className="text-amber-gold">💡 新想法：</span>
                  <span className="text-parchment">{collision.newIdea}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
