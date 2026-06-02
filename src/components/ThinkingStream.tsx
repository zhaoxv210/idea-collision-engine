import { useRef, useEffect } from 'react';

interface ThinkingStreamProps {
  content: string;
}

export function ThinkingStream({ content }: ThinkingStreamProps) {
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  if (!content) return null;

  return (
    <div className="mt-4">
      <label className="text-parchment/40 text-sm font-body mb-2 block">AI 思考过程</label>
      <pre
        ref={containerRef}
        className="p-4 bg-ink-800/30 border border-parchment/10 rounded-xl
                   text-parchment/60 font-mono text-xs leading-relaxed
                   max-h-[300px] overflow-y-auto whitespace-pre-wrap"
      >
        {content}
      </pre>
    </div>
  );
}
