import type { LLMProvider } from '@/llm/types';
import type { Concept, CollisionPair } from '@/store/useEngineStore';
import { buildCollisionPrompt, parseCollisionResponse } from '@/prompts/collision';

export interface CollisionOptions {
  onThinking?: (chunk: string) => void;
}

function filterCrossDomain(concepts: Concept[]): [Concept, Concept][] {
  const pairs: [Concept, Concept][] = [];
  const seedConcepts = concepts.filter((c) => c.isSeed);

  for (let i = 0; i < seedConcepts.length; i++) {
    for (let j = i + 1; j < seedConcepts.length; j++) {
      if (seedConcepts[i].domain !== seedConcepts[j].domain) {
        pairs.push([seedConcepts[i], seedConcepts[j]]);
      }
    }
  }

  return pairs;
}

export async function collide(
  concepts: Concept[],
  provider: LLMProvider,
  temperature: number,
  options?: CollisionOptions
): Promise<CollisionPair[]> {
  const pairs = filterCrossDomain(concepts);
  const collisions: CollisionPair[] = [];

  for (const [a, b] of pairs) {
    const messages = buildCollisionPrompt(a, b);

    try {
      const response = await provider.chatStream(
        messages,
        { temperature },
        (chunk) => {
          options?.onThinking?.(chunk);
        }
      );

      const parsed = parseCollisionResponse(response);
      if (parsed) {
        collisions.push({
          a,
          b,
          dimension: parsed.dimension,
          explanation: parsed.explanation,
          reinterpretation: parsed.reinterpretation,
          newIdea: parsed.newIdea,
        });
      }
    } catch (error) {
      console.error(`Failed to collide ${a.label} and ${b.label}:`, error);
    }
  }

  return collisions;
}
