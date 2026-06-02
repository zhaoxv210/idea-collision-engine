import type { SynthesisResult } from '@/store/useEngineStore';
import { Lightbulb, Rocket, Microscope } from 'lucide-react';

interface SynthesisPanelProps {
  synthesis: SynthesisResult;
}

export function SynthesisPanel({ synthesis }: SynthesisPanelProps) {
  if (!synthesis || (synthesis.insights.length === 0 && synthesis.ideas.length === 0 && synthesis.research.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-amber-gold" size={20} />
            <h3 className="font-display text-xl text-parchment">洞察</h3>
          </div>
          <div className="space-y-3">
            {synthesis.insights.map((insight, index) => (
              <div
                key={index}
                className="card p-4 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-3">
                  <span className="text-amber-gold font-mono text-sm">{index + 1}</span>
                  <p className="text-parchment/80 font-body text-sm leading-relaxed">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="text-amber-gold" size={20} />
            <h3 className="font-display text-xl text-parchment">创意</h3>
          </div>
          <div className="space-y-3">
            {synthesis.ideas.map((idea, index) => (
              <div
                key={index}
                className="card p-4 animate-slide-up"
                style={{ animationDelay: `${(synthesis.insights.length + index) * 100}ms` }}
              >
                <div className="flex gap-3">
                  <span className="text-amber-gold font-mono text-sm">{index + 1}</span>
                  <div>
                    <h4 className="font-body font-medium text-parchment mb-1">{idea.title}</h4>
                    <p className="text-parchment/60 font-body text-sm leading-relaxed">{idea.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Microscope className="text-amber-gold" size={20} />
            <h3 className="font-display text-xl text-parchment">研究方向</h3>
          </div>
          <div className="space-y-3">
            {synthesis.research.map((research, index) => (
              <div
                key={index}
                className="card p-4 animate-slide-up"
                style={{ animationDelay: `${(synthesis.insights.length + synthesis.ideas.length + index) * 100}ms` }}
              >
                <div className="flex gap-3">
                  <span className="text-amber-gold font-mono text-sm">{index + 1}</span>
                  <p className="text-parchment/80 font-body text-sm leading-relaxed">{research}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
