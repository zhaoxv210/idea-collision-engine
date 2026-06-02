import type { LLMProvider } from '@/llm/types';
import type { Concept, Relation, CollisionPair, SynthesisResult } from '@/store/useEngineStore';
import { expandConcepts } from './expansion';
import { inferRelations } from './relation';
import { collide } from './collider';
import { synthesize } from './synthesizer';

export interface EngineCallbacks {
  onPhaseChange?: (phase: 'expanding' | 'relating' | 'colliding' | 'synthesizing' | 'done' | 'error') => void;
  onThinking?: (chunk: string) => void;
  onConcepts?: (concepts: Concept[]) => void;
  onRelations?: (relations: Relation[]) => void;
  onCollisions?: (collisions: CollisionPair[]) => void;
  onSynthesis?: (synthesis: SynthesisResult) => void;
  onError?: (error: string) => void;
}

export async function runEngine(
  keywords: string[],
  provider: LLMProvider,
  temperature: number,
  callbacks: EngineCallbacks
): Promise<void> {
  try {
    callbacks.onPhaseChange?.('expanding');
    callbacks.onThinking?.('\n📚 正在扩展概念...\n');
    const concepts = await expandConcepts(keywords, provider, temperature, {
      onThinking: callbacks.onThinking,
    });
    callbacks.onConcepts?.(concepts);

    callbacks.onPhaseChange?.('relating');
    callbacks.onThinking?.('\n\n🔗 正在推理关系...\n');
    const relations = await inferRelations(concepts, provider, temperature, {
      onThinking: callbacks.onThinking,
    });
    callbacks.onRelations?.(relations);

    callbacks.onPhaseChange?.('colliding');
    callbacks.onThinking?.('\n\n💥 正在进行概念碰撞...\n');
    const collisions = await collide(concepts, provider, temperature, {
      onThinking: callbacks.onThinking,
    });
    callbacks.onCollisions?.(collisions);

    callbacks.onPhaseChange?.('synthesizing');
    callbacks.onThinking?.('\n\n✨ 正在生成综合结果...\n');
    const synthesis = await synthesize(collisions, provider, temperature, {
      onThinking: callbacks.onThinking,
    });
    callbacks.onSynthesis?.(synthesis);

    callbacks.onPhaseChange?.('done');
    callbacks.onThinking?.('\n\n✅ 完成！');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    callbacks.onError?.(message);
    callbacks.onPhaseChange?.('error');
  }
}

export { expandConcepts } from './expansion';
export { inferRelations } from './relation';
export { collide } from './collider';
export { synthesize } from './synthesizer';
