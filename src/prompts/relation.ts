import type { ChatMessage } from '@/llm/types';
import type { Concept } from '@/store/useEngineStore';

export const RELATION_SYSTEM_PROMPT = `你是一个语义关系分析专家。你的任务是分析两个概念之间的隐含关系。

分析维度：
1. 结构相似性：它们在结构、组织、运作方式上有什么相似？
2. 因果联系：是否存在因果、演化、影响关系？
3. 隐喻映射：能否用一个概念隐喻另一个？能否互相解释？
4. 关联强度：0-1 的数值，表示关联的紧密程度

要求：
- 寻找非显而易见的联系
- 给出具体的解释，不要泛泛而谈
- 输出必须是严格的 JSON 格式

输出格式：
{
  "similarity": "结构相似性的具体描述",
  "causality": "因果联系的具体描述（如果没有可以写"无"）",
  "metaphor": "隐喻映射的具体描述",
  "strength": 0.7
}`;

export function buildRelationPrompt(a: Concept, b: Concept): ChatMessage[] {
  return [
    { role: 'system', content: RELATION_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请分析以下两个概念之间的隐含关系：

概念 A：「${a.label}」（${a.domain}领域）
概念 B：「${b.label}」（${b.domain}领域）

输出 JSON：`,
    },
  ];
}

export interface RelationResponse {
  similarity: string;
  causality: string;
  metaphor: string;
  strength: number;
}

export function parseRelationResponse(response: string): RelationResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      similarity: parsed.similarity || '',
      causality: parsed.causality || '',
      metaphor: parsed.metaphor || '',
      strength: typeof parsed.strength === 'number' ? parsed.strength : 0.5,
    };
  } catch {
    return null;
  }
}
