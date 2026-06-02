import type { ChatMessage } from '@/llm/types';

export const EXPANSION_SYSTEM_PROMPT = `你是一个概念扩展专家。你的任务是将给定的关键词扩展成相关概念网络。

要求：
1. 每个关键词扩展 5-8 个相关概念
2. 扩展要包含多种类型：
   - 同领域概念（专业术语、相关理论）
   - 跨领域隐喻（其他领域中相似的概念）
   - 历史类比（历史上的相似现象）
   - 结构相似物（结构上相似的事物）
3. 判断每个关键词所属的领域
4. 输出必须是严格的 JSON 格式

输出格式：
{
  "results": [
    {
      "keyword": "原关键词",
      "domain": "所属领域",
      "expansions": ["扩展概念1", "扩展概念2", ...]
    }
  ]
}`;

export function buildExpansionPrompt(keywords: string[]): ChatMessage[] {
  return [
    { role: 'system', content: EXPANSION_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请扩展以下关键词：

${keywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}

输出 JSON：`,
    },
  ];
}

export interface ExpansionResult {
  keyword: string;
  domain: string;
  expansions: string[];
}

export interface ExpansionResponse {
  results: ExpansionResult[];
}

export function parseExpansionResponse(response: string): ExpansionResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as ExpansionResponse;
  } catch {
    return null;
  }
}
