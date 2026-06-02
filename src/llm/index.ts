import type { LLMConfig, LLMProvider } from './types';
import { OpenAIProvider } from './openai';
import { OllamaProvider } from './ollama';

export function createProvider(config: LLMConfig): LLMProvider {
  switch (config.providerType) {
    case 'openai':
      return new OpenAIProvider(config.openai);
    case 'ollama':
      return new OllamaProvider(config.ollama);
    case 'custom':
      return new OpenAIProvider(config.custom);
    default:
      throw new Error(`Unknown provider type: ${config.providerType}`);
  }
}

export { OpenAIProvider } from './openai';
export { OllamaProvider } from './ollama';
export * from './types';
