import type { LLMProvider } from '@/llm/types';
import type { CollisionPair, SynthesisResult } from '@/store/useEngineStore';
import { buildSynthesisPrompt, parseSynthesisResponse } from '@/prompts/synthesis';

export interface SynthesisOptions {
  onThinking?: (chunk: string) => void;
}

export async function synthesize(
  collisions: CollisionPair[],
  provider: LLMProvider,
  temperature: number,
  options?: SynthesisOptions
): Promise<SynthesisResult> {
  const messages = buildSynthesisPrompt(collisions);

  const response = await provider.chatStream(
    messages,
    { temperature },
    (chunk) => {
      options?.onThinking?.(chunk);
    }
  );

  const parsed = parseSynthesisResponse(response);
  if (!parsed) {
    throw new Error('Failed to parse synthesis response');
  }

  return {
    insights: parsed.insights,
    ideas: parsed.ideas,
    research: parsed.research,
  };
}
