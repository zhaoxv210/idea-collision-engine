import { useState } from 'react';
import { Link2, Sparkles, Loader2, Check, Zap, Plus, Trash2, FileText } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { createProvider } from '@/llm';
import { suggestConnections, explainConnection, ideaSpark, sparkDetail, generateProposal } from '@/engine/canvasAI';
import type { SparkIdea } from '@/engine/canvasAI';
import { cn } from '@/lib/utils';

interface RightPanelProps {
  className?: string;
}

export function RightPanel({ className }: RightPanelProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSparking, setIsSparking] = useState(false);
  const [sparks, setSparks] = useState<string[]>([]);
  const [selectedSpark, setSelectedSpark] = useState<string | null>(null);
  const [sparkIdeas, setSparkIdeas] = useState<SparkIdea[]>([]);
  const [isExpandingSpark, setIsExpandingSpark] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  const {
    nodes,
    edges,
    selectedNodeIds,
    selectedEdgeId,
    aiSuggestions,
    isProcessing,
    selectNode,
    selectEdge,
    addEdge,
    addNode,
    updateEdge,
    removeEdge,
    setAISuggestions,
    clearAISuggestions,
    setIsProcessing,
    clearSelection,
  } = useCanvasStore();

  const temperature = useSettingsStore((s) => s.temperature);

  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const handleSuggestConnections = async () => {
    if (nodes.length < 2 || isProcessing) return;

    setIsProcessing(true);
    setIsSuggesting(true);

    try {
      const config = useSettingsStore.getState();
      const provider = createProvider(config);

      const suggestions = await suggestConnections(nodes, provider, temperature);
      setAISuggestions(suggestions);
    } catch (error) {
      console.error('Failed to suggest connections:', error);
    } finally {
      setIsProcessing(false);
      setIsSuggesting(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: { from: string; to: string; reason: string }) => {
    addEdge({
      from: suggestion.from,
      to: suggestion.to,
      type: 'ai-suggested',
      explanation: suggestion.reason,
    });
    clearAISuggestions();
  };

  const handleExplainEdge = async () => {
    if (!selectedEdge || isProcessing) return;

    const fromNode = nodes.find((n) => n.id === selectedEdge.from);
    const toNode = nodes.find((n) => n.id === selectedEdge.to);
    if (!fromNode || !toNode) return;

    setIsProcessing(true);
    setIsExplaining(true);

    try {
      const config = useSettingsStore.getState();
      const provider = createProvider(config);

      const explanation = await explainConnection(
        fromNode.text,
        toNode.text,
        provider,
        temperature
      );

      updateEdge(selectedEdge.id, { explanation });
    } catch (error) {
      console.error('Failed to explain connection:', error);
    } finally {
      setIsProcessing(false);
      setIsExplaining(false);
    }
  };

  const handleDeleteEdge = () => {
    if (!selectedEdge) return;
    removeEdge(selectedEdge.id);
  };

  const handleIdeaSpark = async () => {
    if (isProcessing) return;

    let targetNodes: { text: string }[] = [];

    if (selectedNodes.length >= 2) {
      targetNodes = selectedNodes;
    } else if (selectedEdge) {
      const fromNode = nodes.find((n) => n.id === selectedEdge.from);
      const toNode = nodes.find((n) => n.id === selectedEdge.to);
      if (fromNode && toNode) {
        targetNodes = [fromNode, toNode];
      }
    }

    if (targetNodes.length < 2) return;

    setIsProcessing(true);
    setIsSparking(true);
    setSparks([]);
    setSelectedSpark(null);
    setSparkIdeas([]);

    try {
      const config = useSettingsStore.getState();
      const provider = createProvider(config);

      const nodeTexts = targetNodes.map((n) => n.text);
      const result = await ideaSpark(nodeTexts, provider, temperature);
      setSparks(result);
    } catch (error) {
      console.error('Failed to generate idea sparks:', error);
    } finally {
      setIsProcessing(false);
      setIsSparking(false);
    }
  };

  const handleSparkClick = async (spark: string) => {
    if (isProcessing) return;

    setSelectedSpark(spark);
    setSparkIdeas([]);
    setIsProcessing(true);
    setIsExpandingSpark(true);

    try {
      const config = useSettingsStore.getState();
      const provider = createProvider(config);

      const ideas = await sparkDetail(spark, provider, temperature);
      setSparkIdeas(ideas);
    } catch (error) {
      console.error('Failed to expand spark:', error);
    } finally {
      setIsProcessing(false);
      setIsExpandingSpark(false);
    }
  };

  const handleAddIdeaAsNode = (idea: SparkIdea) => {
    const baseX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x)) + 200 : 100;
    const baseY = nodes.length > 0 ? nodes[0].y : 100;

    addNode({
      text: idea.name,
      type: 'ai-generated',
      x: baseX,
      y: baseY + sparkIdeas.indexOf(idea) * 100,
    });

    setSparkIdeas((prev) => prev.filter((i) => i !== idea));
  };

  const handleGenerateProposal = async () => {
    if (selectedNodes.length !== 1 || isProcessing) return;

    const targetNode = selectedNodes[0];
    setIsGeneratingProposal(true);

    try {
      const config = useSettingsStore.getState();
      const provider = createProvider(config);

      const relatedEdges = edges.filter(
        (e) => e.from === targetNode.id || e.to === targetNode.id
      );
      const relatedIdeas = relatedEdges
        .map((e) => {
          const otherId = e.from === targetNode.id ? e.to : e.from;
          return nodes.find((n) => n.id === otherId)?.text;
        })
        .filter(Boolean) as string[];

      const result = await generateProposal(
        targetNode.text,
        provider,
        temperature,
        relatedIdeas
      );

      if (result) {
        const proposalText = `📋 ${result.title}\n\n` +
          `📌 ${result.summary}\n\n` +
          `🎯 目标：\n${result.objectives.map((o, i) => `  ${i + 1}. ${o}`).join('\n')}\n\n` +
          `📝 实施步骤：\n${result.approach.steps.map((s, i) => `  ${i + 1}. ${s.name}：${s.description}`).join('\n')}\n\n` +
          `⏱️ 时间：${result.resources.time} | 团队：${result.resources.team}\n\n` +
          `💡 预期成果：${result.expectedOutcome}`;

        const baseX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x)) + 300 : 100;
        const baseY = targetNode.y;

        addNode({
          text: proposalText,
          type: 'ai-generated',
          x: baseX,
          y: baseY,
        });
      } else {
        alert('生成方案失败，请检查 LLM 配置或重试');
      }
    } catch (error) {
      console.error('Failed to generate proposal:', error);
      alert('生成方案出错：' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const canSpark = selectedNodes.length >= 2 || selectedEdge;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {canSpark && (
        <div className="space-y-2">
          <button
            onClick={handleIdeaSpark}
            disabled={isProcessing}
            className={cn(
              'w-full btn-primary flex items-center justify-center gap-2',
              isSparking && 'animate-pulse'
            )}
          >
            {isSparking ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Zap size={18} />
            )}
            <span>{isSparking ? '生成中...' : '⚡ Idea Spark'}</span>
          </button>
          <p className="text-parchment/40 text-xs text-center">
            {selectedNodes.length >= 2
              ? `基于 ${selectedNodes.length} 个选中节点碰撞`
              : '基于选中连线生成创意火花'}
          </p>
        </div>
      )}

      {sparks.length > 0 && (
        <div className="border-t border-parchment/10 pt-4">
          <label className="text-amber-gold font-body text-sm mb-3 block">
            创意火花（点击展开）
          </label>
          <div className="space-y-1.5">
            {sparks.map((spark, i) => (
              <button
                key={i}
                onClick={() => handleSparkClick(spark)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border text-left transition-all',
                  selectedSpark === spark
                    ? 'bg-amber-gold/10 border-amber-gold/50'
                    : 'bg-ink-800/50 border-amber-gold/20 hover:border-amber-gold/40'
                )}
              >
                <span className="text-amber-gold/90 font-mono text-sm">{spark}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setSparks([]);
              setSelectedSpark(null);
              setSparkIdeas([]);
            }}
            className="w-full mt-2 text-parchment/40 text-xs hover:text-parchment transition-colors"
          >
            清除
          </button>
        </div>
      )}

      {sparkIdeas.length > 0 && (
        <div className="border-t border-parchment/10 pt-4">
          <label className="text-domain-tech font-body text-sm mb-3 block">
            创意方案（点击添加到画布）
          </label>
          <div className="space-y-3">
            {sparkIdeas.map((idea, i) => (
              <button
                key={i}
                onClick={() => handleAddIdeaAsNode(idea)}
                className="w-full p-3 bg-ink-800/50 rounded-lg border border-domain-tech/30 text-left hover:border-domain-tech/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-parchment font-body text-sm font-medium">{idea.name}</div>
                  <Plus className="text-domain-tech flex-shrink-0" size={16} />
                </div>
                <div className="text-parchment/50 text-xs mb-2">{idea.description}</div>
                {idea.steps && idea.steps.length > 0 && (
                  <div className="mb-2">
                    <div className="text-parchment/40 text-xs mb-1">关键步骤：</div>
                    <div className="flex flex-wrap gap-1">
                      {idea.steps.map((step, j) => (
                        <span key={j} className="px-2 py-0.5 bg-ink-700/50 rounded text-parchment/60 text-xs">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {idea.potential && (
                  <div className="text-amber-gold/60 text-xs">
                    💡 {idea.potential}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isExpandingSpark && (
        <div className="flex items-center justify-center gap-2 text-parchment/60 text-sm">
          <Loader2 className="animate-spin" size={14} />
          <span>展开创意中...</span>
        </div>
      )}

      <div className="border-t border-parchment/10 pt-4 space-y-2">
        <button
          onClick={handleSuggestConnections}
          disabled={nodes.length < 2 || isProcessing}
          className={cn(
            'w-full btn-outline flex items-center justify-center gap-2',
            isSuggesting && 'animate-pulse'
          )}
        >
          {isSuggesting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{isSuggesting ? 'AI 分析中...' : 'AI 推荐连接'}</span>
        </button>
        <p className="text-parchment/40 text-xs text-center">
          AI 会分析节点并推荐有意义的连接
        </p>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="border-t border-parchment/10 pt-4">
          <label className="text-amber-gold font-body text-sm mb-3 block">
            AI 推荐的连接
          </label>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, i) => {
              const fromNode = nodes.find((n) => n.id === suggestion.from);
              const toNode = nodes.find((n) => n.id === suggestion.to);
              if (!fromNode || !toNode) return null;

              return (
                <div
                  key={i}
                  className="p-3 bg-ink-800/50 rounded-lg border border-domain-tech/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-parchment text-sm">{fromNode.text}</span>
                    <Link2 className="text-domain-tech" size={14} />
                    <span className="text-parchment text-sm">{toNode.text}</span>
                  </div>
                  <p className="text-parchment/60 text-xs mb-2">{suggestion.reason}</p>
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="w-full btn-outline text-xs py-1 flex items-center justify-center gap-1"
                  >
                    <Check size={14} />
                    <span>接受</span>
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={clearAISuggestions}
            className="w-full mt-2 text-parchment/40 text-xs hover:text-parchment transition-colors"
          >
            清除建议
          </button>
        </div>
      )}

      {selectedNodes.length > 0 && (
        <div className="border-t border-parchment/10 pt-4">
          <label className="text-parchment/60 font-body text-sm mb-2 block">
            选中的节点 ({selectedNodes.length})
          </label>
          <div className="space-y-2">
            {selectedNodes.map((node) => (
              <div
                key={node.id}
                className="p-2 bg-ink-800/50 rounded-lg border border-amber-gold/30"
              >
                <p className="text-parchment font-body text-sm">{node.text}</p>
              </div>
            ))}
          </div>
          {selectedNodes.length === 1 && (
            <button
              onClick={handleGenerateProposal}
              disabled={isGeneratingProposal}
              className={cn(
                'w-full mt-3 btn-outline flex items-center justify-center gap-2',
                isGeneratingProposal && 'animate-pulse'
              )}
            >
              {isGeneratingProposal ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <FileText size={14} />
              )}
              <span>{isGeneratingProposal ? '生成中...' : '生成详细方案'}</span>
            </button>
          )}
          <button
            onClick={clearSelection}
            className="w-full mt-2 text-parchment/40 text-xs hover:text-parchment transition-colors"
          >
            取消选择
          </button>
        </div>
      )}

      {selectedEdge && (
        <div className="border-t border-parchment/10 pt-4">
          <label className="text-parchment/60 font-body text-sm mb-2 block">
            选中的连接
          </label>
          <div className="p-3 bg-ink-800/50 rounded-lg border border-parchment/20">
            {(() => {
              const fromNode = nodes.find((n) => n.id === selectedEdge.from);
              const toNode = nodes.find((n) => n.id === selectedEdge.to);
              return (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-parchment text-sm">{fromNode?.text}</span>
                  <Link2
                    className={cn(
                      selectedEdge.type === 'ai-suggested'
                        ? 'text-domain-tech'
                        : 'text-parchment/50'
                    )}
                    size={14}
                  />
                  <span className="text-parchment text-sm">{toNode?.text}</span>
                </div>
              );
            })()}
            <p className="text-parchment/40 text-xs mb-2">
              类型: {selectedEdge.type === 'manual' ? '手动连接' : 'AI 推荐'}
            </p>
            {selectedEdge.explanation ? (
              <p className="text-parchment/70 text-sm mt-2 p-2 bg-ink-700/50 rounded">
                {selectedEdge.explanation}
              </p>
            ) : (
              <button
                onClick={handleExplainEdge}
                disabled={isProcessing}
                className={cn(
                  'w-full btn-outline text-xs py-1.5 mt-2 flex items-center justify-center gap-1',
                  isExplaining && 'animate-pulse'
                )}
              >
                {isExplaining ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>{isExplaining ? 'AI 解释中...' : 'AI 解释连接'}</span>
              </button>
            )}
            <button
              onClick={handleDeleteEdge}
              className="w-full mt-2 btn-outline text-xs py-1.5 flex items-center justify-center gap-1 text-red-400/70 hover:text-red-400 hover:border-red-400/50"
            >
              <Trash2 size={14} />
              <span>删除连接</span>
            </button>
          </div>
        </div>
      )}

      {selectedNodes.length === 0 && !selectedEdge && aiSuggestions.length === 0 && sparks.length === 0 && (
        <div className="border-t border-parchment/10 pt-4">
          <p className="text-parchment/40 text-sm text-center">
            点击节点或连线查看详情
          </p>
          <p className="text-parchment/30 text-xs text-center mt-1">
            按住 Shift/Ctrl 多选节点
          </p>
        </div>
      )}
    </div>
  );
}
