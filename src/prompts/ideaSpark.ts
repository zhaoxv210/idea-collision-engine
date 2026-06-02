import type { ChatMessage } from '@/llm/types';

export const IDEA_SPARK_SYSTEM_PROMPT_2 = `你是一个创意火花生成器。你的任务是基于两个想法的组合，生成极短的创意火花。

要求：
1. 输出 5-10 条极短创意
2. 每条必须 ≤ 15 个字
3. 使用 "A × B → C" 结构
4. 不允许解释，只输出创意
5. 高密度发散，寻找非显而易见的组合
6. C 必须是新的概念或想法，不能只是 A 或 B 的重复
7. 输出必须是严格的 JSON 格式

输出格式：
{
  "sparks": ["A × B → C", "A × B → D", ...]
}`;

export const IDEA_SPARK_SYSTEM_PROMPT_MULTI = `你是一个创意火花生成器。你的任务是基于多个想法的组合碰撞，生成极短的创意火花。

要求：
1. 输出 5-10 条极短创意
2. 每条必须 ≤ 20 个字
3. 必须使用所有输入节点的组合，格式为 "A × B × C → D"
4. 不允许解释，只输出创意
5. 高密度发散，寻找非显而易见的组合
6. D 必须是新的概念或想法，不能只是输入的重复
7. 输出必须是严格的 JSON 格式

输出格式：
{
  "sparks": ["A × B × C → D", "A × B × C → E", ...]
}`;

export function buildIdeaSparkPrompt(nodeTexts: string[]): ChatMessage[] {
  const isMulti = nodeTexts.length >= 3;
  const systemPrompt = isMulti ? IDEA_SPARK_SYSTEM_PROMPT_MULTI : IDEA_SPARK_SYSTEM_PROMPT_2;

  return [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `基于以下想法${isMulti ? '的组合碰撞' : ''}，生成创意火花：

${nodeTexts.map((t, i) => `${i + 1}. ${t}`).join('\n')}

输出 JSON：`,
    },
  ];
}

export interface IdeaSparkResponse {
  sparks: string[];
}

export function parseIdeaSparkResponse(response: string): IdeaSparkResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      sparks: Array.isArray(parsed.sparks)
        ? parsed.sparks.filter((s: unknown) => typeof s === 'string' && s.length <= 35)
        : [],
    };
  } catch {
    return null;
  }
}

export const SPARK_DETAIL_SYSTEM_PROMPT = `你是一个创意扩展专家。你的任务是将一个创意火花扩展成简略的创意方案。

要求：
1. 输出 2-3 个简略方案
2. 每个方案包含：名称（≤10字）+ 简短描述（≤30字）
3. 方案要具体可执行，不要太抽象
4. 输出必须是严格的 JSON 格式

输出格式：
{
  "ideas": [
    {"name": "方案名称", "description": "简短描述"},
    ...
  ]
}`;

export function buildSparkDetailPrompt(spark: string): ChatMessage[] {
  return [
    { role: 'system', content: SPARK_DETAIL_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `将这个创意火花扩展成简略方案：

${spark}

输出 JSON：`,
    },
  ];
}

export interface SparkIdea {
  name: string;
  description: string;
}

export interface SparkDetailResponse {
  ideas: SparkIdea[];
}

export function parseSparkDetailResponse(response: string): SparkDetailResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ideas: Array.isArray(parsed.ideas)
        ? parsed.ideas.map((i: { name?: string; description?: string }) => ({
            name: i.name || '',
            description: i.description || '',
          }))
        : [],
    };
  } catch {
    return null;
  }
}
