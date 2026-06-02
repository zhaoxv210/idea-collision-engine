import type { ChatMessage } from '@/llm/types';
import type { IdeaNode } from '@/store/useCanvasStore';

export const SUGGEST_CONNECTIONS_SYSTEM_PROMPT = `你是一个想法连接专家。你的任务是分析用户提供的想法节点，并推荐它们之间可能存在的有意义的连接。

要求：
1. 只推荐真正有意义的连接，不要强行关联
2. 每个连接都要有简短的理由（1-2句话）
3. 寻找跨领域的有趣联系
4. 输出必须是严格的 JSON 格式

输出格式：
{
  "suggestions": [
    {
      "from": "节点文本A",
      "to": "节点文本B",
      "reason": "为什么它们有关系"
    }
  ]
}`;

export function buildSuggestConnectionsPrompt(nodes: IdeaNode[]): ChatMessage[] {
  const nodeTexts = nodes.map((n) => `- ${n.text}`).join('\n');

  return [
    { role: 'system', content: SUGGEST_CONNECTIONS_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `以下是画布上的想法节点：

${nodeTexts}

请推荐它们之间可能存在的有意义的连接。输出 JSON：`,
    },
  ];
}

export interface SuggestedConnection {
  from: string;
  to: string;
  reason: string;
}

export interface SuggestConnectionsResponse {
  suggestions: SuggestedConnection[];
}

export function parseSuggestConnectionsResponse(response: string): SuggestConnectionsResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map((s: { from?: string; to?: string; reason?: string }) => ({
            from: s.from || '',
            to: s.to || '',
            reason: s.reason || '',
          }))
        : [],
    };
  } catch {
    return null;
  }
}
