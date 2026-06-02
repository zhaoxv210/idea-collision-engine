import type { ChatMessage } from '@/llm/types';
import type { Concept } from '@/store/useEngineStore';

export const COLLISION_SYSTEM_PROMPT = `你是一个创意碰撞专家。你的任务是让两个不同领域的概念进行"碰撞"，产生新的洞察和想法。

碰撞方法：
1. 寻找相似维度：它们在什么维度上相似？（结构、功能、演化、组织等）
2. 交叉解释：能否用概念 A 解释概念 B 的某个现象？
3. 重新理解：能否用概念 B 重新理解概念 A？
4. 生成新想法：这种碰撞能产生什么新的产品、概念或研究方向？

要求：
- 不要套话，要有具体的洞察
- 尝试发现非显而易见的联系
- 输出要有惊喜感
- 输出必须是严格的 JSON 格式

输出格式：
{
  "dimension": "相似的维度",
  "explanation": "用A解释B的具体内容",
  "reinterpretation": "用B重新理解A的具体内容",
  "newIdea": "碰撞产生的新想法"
}`;

export function buildCollisionPrompt(a: Concept, b: Concept): ChatMessage[] {
  return [
    { role: 'system', content: COLLISION_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `让以下两个概念进行碰撞：

概念 A：「${a.label}」（${a.domain}领域）
概念 B：「${b.label}」（${b.domain}领域）

输出 JSON：`,
    },
  ];
}

export interface CollisionResponse {
  dimension: string;
  explanation: string;
  reinterpretation: string;
  newIdea: string;
}

export function parseCollisionResponse(response: string): CollisionResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      dimension: parsed.dimension || '',
      explanation: parsed.explanation || '',
      reinterpretation: parsed.reinterpretation || '',
      newIdea: parsed.newIdea || '',
    };
  } catch {
    return null;
  }
}
