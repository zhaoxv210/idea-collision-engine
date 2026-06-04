export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  operation?: string;
}

export interface LLMProvider {
  name: string;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  chatStream(
    messages: ChatMessage[],
    options: ChatOptions | undefined,
    onChunk: (chunk: string) => void
  ): Promise<string>;
  testConnection(): Promise<boolean>;
}

export interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export interface CustomConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export type ProviderType = 'openai' | 'ollama' | 'custom';

export interface LLMConfig {
  providerType: ProviderType;
  openai: OpenAIConfig;
  ollama: OllamaConfig;
  custom: CustomConfig;
  temperature: number;
}
