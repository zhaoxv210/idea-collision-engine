import { useState } from 'react';
import { Settings, Zap, RotateCcw, AlertCircle } from 'lucide-react';
import { KeywordInput } from '@/components/KeywordInput';
import { EngineProgress } from '@/components/EngineProgress';
import { ThinkingStream } from '@/components/ThinkingStream';
import { ConceptGraph } from '@/components/ConceptGraph';
import { CollisionLab } from '@/components/CollisionLab';
import { SynthesisPanel } from '@/components/SynthesisPanel';
import { useEngineStore } from '@/store/useEngineStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { createProvider } from '@/llm';
import { runEngine } from '@/engine';

interface HomePageProps {
  onSettings: () => void;
}

export function HomePage({ onSettings }: HomePageProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const {
    phase,
    concepts,
    relations,
    collisions,
    synthesis,
    thinkingStream,
    error,
    setPhase,
    setConcepts,
    setRelations,
    setCollisions,
    setSynthesis,
    appendThinking,
    clearThinking,
    setError,
    reset,
  } = useEngineStore();

  const temperature = useSettingsStore((s) => s.temperature);

  const handleCollide = async () => {
    if (keywords.length < 2) return;

    reset();
    clearThinking();

    try {
      const config = useSettingsStore.getState();
      const provider = createProvider(config);

      await runEngine(keywords, provider, temperature, {
        onPhaseChange: setPhase,
        onThinking: appendThinking,
        onConcepts: setConcepts,
        onRelations: setRelations,
        onCollisions: setCollisions,
        onSynthesis: setSynthesis,
        onError: setError,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleReset = () => {
    reset();
    setKeywords([]);
    clearThinking();
  };

  const isRunning = phase !== 'idle' && phase !== 'done' && phase !== 'error';
  const canStart = keywords.length >= 2 && !isRunning;
  const hasResults = concepts.length > 0 || collisions.length > 0 || synthesis;

  return (
    <div className="min-h-screen grid-bg noise-bg">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="heading-display mb-2">
              AI 想法<span className="text-gradient-gold">碰撞</span>引擎
            </h1>
            <p className="text-body">
              输入跨领域关键词，让 LLM 进行语义碰撞，生成新洞察、新创意、新研究方向
            </p>
          </div>
          <button onClick={onSettings} className="btn-outline flex items-center gap-2">
            <Settings size={18} />
            <span>配置</span>
          </button>
        </header>

        <section className="mb-8">
          <label className="label-text">输入关键词（2-6 个）</label>
          <KeywordInput keywords={keywords} onChange={setKeywords} disabled={isRunning} />
        </section>

        <section className="flex items-center gap-4 mb-8">
          <button onClick={handleCollide} disabled={!canStart} className="btn-primary flex items-center gap-2">
            <Zap size={20} />
            <span>{isRunning ? '碰撞中...' : '开始碰撞'}</span>
          </button>
          {hasResults && (
            <button onClick={handleReset} className="btn-outline flex items-center gap-2">
              <RotateCcw size={18} />
              <span>重置</span>
            </button>
          )}
        </section>

        {isRunning && (
          <section className="mb-8">
            <EngineProgress phase={phase} />
            <ThinkingStream content={thinkingStream} />
          </section>
        )}

        {error && (
          <section className="mb-8">
            <div className="card border-red-500/30 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-body font-medium text-red-400 mb-1">发生错误</h4>
                <p className="text-parchment/60 font-body text-sm">{error}</p>
              </div>
            </div>
          </section>
        )}

        {phase === 'done' && hasResults && (
          <div className="space-y-12 animate-fade-in">
            {concepts.length > 0 && (
              <section>
                <h2 className="heading-section mb-6">概念图谱</h2>
                <div className="card">
                  <ConceptGraph concepts={concepts} relations={relations} />
                </div>
              </section>
            )}

            {collisions.length > 0 && (
              <section>
                <CollisionLab collisions={collisions} />
              </section>
            )}

            {synthesis && (
              <section>
                <SynthesisPanel synthesis={synthesis} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
