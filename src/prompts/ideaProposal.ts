import type { ChatMessage } from '@/llm/types';

export const IDEA_PROPOSAL_SYSTEM_PROMPT = `你是一个创意方案撰写专家。你的任务是将一个创意想法扩展成一份完整的实施方案文档。

要求：
1. 输出一份结构完整的方案文档
2. 内容要具体、可执行、有深度
3. 语言要专业但易懂
4. 输出必须是严格的 JSON 格式，不要有任何其他文字

输出格式（直接输出以下 JSON，不要包装）：
{
  "title": "方案标题",
  "summary": "一句话概述（≤50字）",
  "background": "背景与动机，说明为什么需要这个创意",
  "objectives": ["目标1", "目标2", "目标3"],
  "approach": {
    "overview": "方法概述",
    "steps": [
      {"name": "步骤名称", "description": "详细描述", "deliverable": "产出物"}
    ]
  },
  "resources": {
    "time": "预估时间",
    "team": "所需团队/技能",
    "tools": "所需工具/技术"
  },
  "risks": [
    {"risk": "风险描述", "mitigation": "应对策略"}
  ],
  "expectedOutcome": "预期成果与价值",
  "nextSteps": ["下一步行动1", "下一步行动2"]
}`;

export function buildIdeaProposalPrompt(ideaText: string, relatedIdeas?: string[]): ChatMessage[] {
  let contextInfo = '';
  if (relatedIdeas && relatedIdeas.length > 0) {
    contextInfo = `\n\n相关背景信息：\n${relatedIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}`;
  }

  return [
    { role: 'system', content: IDEA_PROPOSAL_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请为以下创意想法生成一份详细的实施方案：

**核心创意**：${ideaText}${contextInfo}

输出 JSON：`,
    },
  ];
}

export interface IdeaProposal {
  title: string;
  summary: string;
  background: string;
  objectives: string[];
  approach: {
    overview: string;
    steps: {
      name: string;
      description: string;
      deliverable: string;
    }[];
  };
  resources: {
    time: string;
    team: string;
    tools: string;
  };
  risks: {
    risk: string;
    mitigation: string;
  }[];
  expectedOutcome: string;
  nextSteps: string[];
}

export function parseIdeaProposalResponse(response: string): IdeaProposal | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return null;
    }
    const p = JSON.parse(jsonMatch[0]);

    return {
      title: p.title || '',
      summary: p.summary || '',
      background: p.background || '',
      objectives: Array.isArray(p.objectives) ? p.objectives : [],
      approach: {
        overview: p.approach?.overview || '',
        steps: Array.isArray(p.approach?.steps)
          ? p.approach.steps.map((s: { name?: string; description?: string; deliverable?: string }) => ({
              name: s.name || '',
              description: s.description || '',
              deliverable: s.deliverable || '',
            }))
          : [],
      },
      resources: {
        time: p.resources?.time || '',
        team: p.resources?.team || '',
        tools: p.resources?.tools || '',
      },
      risks: Array.isArray(p.risks)
        ? p.risks.map((r: { risk?: string; mitigation?: string }) => ({
            risk: r.risk || '',
            mitigation: r.mitigation || '',
          }))
        : [],
      expectedOutcome: p.expectedOutcome || '',
      nextSteps: Array.isArray(p.nextSteps) ? p.nextSteps : [],
    };
  } catch (e) {
    console.error('Failed to parse proposal response:', e);
    return null;
  }
}
