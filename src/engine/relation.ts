import type { LLMProvider } from '@/llm/types';
import type { Concept, Relation } from '@/store/useEngineStore';
import { buildRelationPrompt, parseRelationResponse } from '@/prompts/relation';

export interface RelationOptions {
  onThinking?: (chunk: string) => void;
}

function generatePairs(concepts: Concept[]): [Concept, Concept][] {
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

export async function inferRelations(
  concepts: Concept[],
  provider: LLMProvider,
  temperature: number,
  options?: RelationOptions
): Promise<Relation[]> {
  const pairs = generatePairs(concepts);
  const relations: Relation[] = [];

  for (const [a, b] of pairs) {
    const messages = buildRelationPrompt(a, b);

    try {
      const response = await provider.chatStream(
        messages,
        { temperature },
        (chunk) => {
          options?.onThinking?.(chunk);
        }
      );

      const parsed = parseRelationResponse(response);
      if (parsed && parsed.strength > 0.3) {
        relations.push({
          source: a.id,
          target: b.id,
          similarity: parsed.similarity,
          causality: parsed.causality,
          metaphor: parsed.metaphor,
          strength: parsed.strength,
        });
      }
    } catch (error) {
      console.error(`Failed to infer relation between ${a.label} and ${b.label}:`, error);
    }
  }

  return relations;
}
