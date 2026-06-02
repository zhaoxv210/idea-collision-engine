import type { ChatMessage } from '@/llm/types';

export const EXPLAIN_CONNECTION_SYSTEM_PROMPT = `你是一个想法连接解释专家。你的任务是解释两个想法之间为什么存在联系。

要求：
1. 解释要简洁有力，1-3句话
2. 寻找非显而易见的联系
3. 可以从结构、功能、历史、隐喻等角度解释
4. 不要泛泛而谈，要具体

输出格式：
{
  "explanation": "解释内容"
}`;

export function buildExplainConnectionPrompt(nodeA: string, nodeB: string): ChatMessage[] {
  return [
    { role: 'system', content: EXPLAIN_CONNECTION_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请解释以下两个想法之间的联系：

想法 A：「${nodeA}」
想法 B：「${nodeB}」

输出 JSON：`,
    },
  ];
}

export interface ExplainConnectionResponse {
  explanation: string;
}

export function parseExplainConnectionResponse(response: string): ExplainConnectionResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      explanation: parsed.explanation || '',
    };
  } catch {
    return null;
  }
}
