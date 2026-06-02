import type { LLMProvider } from '@/llm/types';
import type { Concept } from '@/store/useEngineStore';
import { buildExpansionPrompt, parseExpansionResponse } from '@/prompts/expansion';

export interface ExpansionOptions {
  onThinking?: (chunk: string) => void;
}

export async function expandConcepts(
  keywords: string[],
  provider: LLMProvider,
  temperature: number,
  options?: ExpansionOptions
): Promise<Concept[]> {
  const messages = buildExpansionPrompt(keywords);
  const concepts: Concept[] = [];

  const response = await provider.chatStream(
    messages,
    { temperature },
    (chunk) => {
      options?.onThinking?.(chunk);
    }
  );

  const parsed = parseExpansionResponse(response);
  if (!parsed) {
    throw new Error('Failed to parse expansion response');
  }

  for (const result of parsed.results) {
    concepts.push({
      id: `seed-${result.keyword}`,
      label: result.keyword,
      domain: result.domain,
      isSeed: true,
    });

    for (const expansion of result.expansions) {
      const id = `exp-${result.keyword}-${expansion}`;
      if (!concepts.some((c) => c.id === id)) {
        concepts.push({
          id,
          label: expansion,
          domain: result.domain,
          isSeed: false,
        });
      }
    }
  }

  return concepts;
}
