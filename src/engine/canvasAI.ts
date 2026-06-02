import type { LLMProvider } from '@/llm/types';
import type { IdeaNode, AISuggestion } from '@/store/useCanvasStore';
import { buildSuggestConnectionsPrompt, parseSuggestConnectionsResponse } from '@/prompts/suggestConnections';
import { buildExplainConnectionPrompt, parseExplainConnectionResponse } from '@/prompts/explainConnection';
import { buildSuggestNodesPrompt, parseSuggestNodesResponse } from '@/prompts/suggestNodes';
import {
  buildIdeaSparkPrompt,
  parseIdeaSparkResponse,
  buildSparkDetailPrompt,
  parseSparkDetailResponse,
  type SparkIdea,
} from '@/prompts/ideaSpark';
import {
  buildIdeaProposalPrompt,
  parseIdeaProposalResponse,
  type IdeaProposal,
} from '@/prompts/ideaProposal';

export interface AIOptions {
  onThinking?: (chunk: string) => void;
}

export async function suggestConnections(
  nodes: IdeaNode[],
  provider: LLMProvider,
  temperature: number,
  options?: AIOptions
): Promise<AISuggestion[]> {
  if (nodes.length < 2) return [];

  const messages = buildSuggestConnectionsPrompt(nodes);

  const response = await provider.chatStream(messages, { temperature }, (chunk) => {
    options?.onThinking?.(chunk);
  });

  const parsed = parseSuggestConnectionsResponse(response);
  if (!parsed) return [];

  return parsed.suggestions.map((s) => ({
    from: nodes.find((n) => n.text === s.from)?.id || '',
    to: nodes.find((n) => n.text === s.to)?.id || '',
    reason: s.reason,
  })).filter((s) => s.from && s.to);
}

export async function explainConnection(
  nodeA: string,
  nodeB: string,
  provider: LLMProvider,
  temperature: number,
  options?: AIOptions
): Promise<string> {
  const messages = buildExplainConnectionPrompt(nodeA, nodeB);

  const response = await provider.chatStream(messages, { temperature }, (chunk) => {
    options?.onThinking?.(chunk);
  });

  const parsed = parseExplainConnectionResponse(response);
  return parsed?.explanation || '';
}

export async function suggestNewNodes(
  nodes: IdeaNode[],
  provider: LLMProvider,
  temperature: number,
  options?: AIOptions
): Promise<string[]> {
  if (nodes.length === 0) return [];

  const messages = buildSuggestNodesPrompt(nodes);

  const response = await provider.chatStream(messages, { temperature }, (chunk) => {
    options?.onThinking?.(chunk);
  });

  const parsed = parseSuggestNodesResponse(response);
  return parsed?.nodes || [];
}

export async function ideaSpark(
  nodeTexts: string[],
  provider: LLMProvider,
  temperature: number,
  options?: AIOptions
): Promise<string[]> {
  if (nodeTexts.length < 2) return [];

  const messages = buildIdeaSparkPrompt(nodeTexts);

  const response = await provider.chatStream(messages, { temperature }, (chunk) => {
    options?.onThinking?.(chunk);
  });

  const parsed = parseIdeaSparkResponse(response);
  return parsed?.sparks || [];
}

export async function sparkDetail(
  spark: string,
  provider: LLMProvider,
  temperature: number,
  options?: AIOptions
): Promise<SparkIdea[]> {
  const messages = buildSparkDetailPrompt(spark);

  const response = await provider.chatStream(messages, { temperature }, (chunk) => {
    options?.onThinking?.(chunk);
  });

  const parsed = parseSparkDetailResponse(response);
  return parsed?.ideas || [];
}

export async function generateProposal(
  ideaText: string,
  provider: LLMProvider,
  temperature: number,
  relatedIdeas?: string[],
  options?: AIOptions
): Promise<IdeaProposal | null> {
  const messages = buildIdeaProposalPrompt(ideaText, relatedIdeas);

  const response = await provider.chatStream(messages, { temperature }, (chunk) => {
    options?.onThinking?.(chunk);
  });

  console.log('Proposal response:', response);
  const parsed = parseIdeaProposalResponse(response);
  return parsed;
}

export type { SparkIdea, IdeaProposal };
