import type { ChatMessage } from '@/llm/types';
import type { IdeaNode } from '@/store/useCanvasStore';

export const SUGGEST_NODES_SYSTEM_PROMPT = `你是一个想法扩展专家。你的任务是基于现有的想法节点，建议新的相关想法。

要求：
1. 新想法应该能与现有想法产生有趣的连接
2. 可以是现有想法的组合、延伸或对比
3. 每个建议要简短有力，不超过10个字
4. 建议 3-5 个新想法
5. 输出必须是严格的 JSON 格式

输出格式：
{
  "nodes": ["新想法1", "新想法2", "新想法3"]
}`;

export function buildSuggestNodesPrompt(nodes: IdeaNode[]): ChatMessage[] {
  const nodeTexts = nodes.map((n) => `- ${n.text}`).join('\n');

  return [
    { role: 'system', content: SUGGEST_NODES_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `以下是画布上现有的想法节点：

${nodeTexts}

请建议一些新的相关想法。输出 JSON：`,
    },
  ];
}

export interface SuggestNodesResponse {
  nodes: string[];
}

export function parseSuggestNodesResponse(response: string): SuggestNodesResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes.filter((n: unknown) => typeof n === 'string') : [],
    };
  } catch {
    return null;
  }
}
