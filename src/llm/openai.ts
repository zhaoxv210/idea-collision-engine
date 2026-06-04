import type { ChatMessage, ChatOptions, LLMProvider, OpenAIConfig } from './types';
import { useTokenUsageStore } from '@/store/useTokenUsageStore';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const usage = data.usage;
    if (usage) {
      useTokenUsageStore.getState().addUsage({
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        model: this.model,
        operation: options?.operation || 'chat',
      });
    }

    return content;
  }

  async chatStream(
    messages: ChatMessage[],
    options: ChatOptions | undefined,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const promptText = messages.map((m) => m.content).join('');
    const estimatedPromptTokens = estimateTokens(promptText);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    const estimatedCompletionTokens = estimateTokens(fullContent);
    useTokenUsageStore.getState().addUsage({
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
      model: this.model,
      operation: options?.operation || 'chat',
    });

    return fullContent;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.chat([{ role: 'user', content: 'Hello' }], { maxTokens: 10, operation: 'test' });
      return true;
    } catch {
      return false;
    }
  }
}
