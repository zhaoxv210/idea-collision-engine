import type { ChatMessage } from '@/llm/types';
import type { CollisionPair } from '@/store/useEngineStore';

export const SYNTHESIS_SYSTEM_PROMPT = `你是一个创意综合专家。你的任务是基于概念碰撞结果，生成三类输出：

1. 洞察（Insight）：深度洞察
   - 不是总结，是新理解
   - 要有"原来如此"的感觉
   - 揭示隐藏的模式或原理

2. 创意（Idea）：可执行的点子
   - 新产品、新概念、新应用
   - 要具体，不要太抽象
   - 有可行性

3. 研究方向（Research）：值得深入的方向
   - 可验证的假设
   - 跨学科的研究问题
   - 有学术或商业价值

要求：
- 每条都要有惊喜感
- 避免套话和泛泛而谈
- 输出必须是严格的 JSON 格式

输出格式：
{
  "insights": ["洞察1", "洞察2", "洞察3"],
  "ideas": [
    {"title": "创意标题", "description": "详细描述"},
    ...
  ],
  "research": ["研究方向1", "研究方向2", "研究方向3"]
}`;

export function buildSynthesisPrompt(collisions: CollisionPair[]): ChatMessage[] {
  const collisionText = collisions
    .map((c, i) => {
      return `${i + 1}. 「${c.a.label}」×「${c.b.label}」
   - 相似维度：${c.dimension}
   - 交叉解释：${c.explanation}
   - 新想法：${c.newIdea}`;
    })
    .join('\n\n');

  return [
    { role: 'system', content: SYNTHESIS_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `基于以下概念碰撞结果，生成洞察、创意和研究方向：

${collisionText}

输出 JSON：`,
    },
  ];
}

export interface IdeaResponse {
  title: string;
  description: string;
}

export interface SynthesisResponse {
  insights: string[];
  ideas: IdeaResponse[];
  research: string[];
}

export function parseSynthesisResponse(response: string): SynthesisResponse | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      ideas: Array.isArray(parsed.ideas)
        ? parsed.ideas.map((i: { title?: string; description?: string }) => ({
            title: i.title || '',
            description: i.description || '',
          }))
        : [],
      research: Array.isArray(parsed.research) ? parsed.research : [],
    };
  } catch {
    return null;
  }
}
