import { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  disabled?: boolean;
}

const PRESETS = [
  ['AI', '战争', '罗马帝国', '社交媒体'],
  ['区块链', '生态学', '音乐', '心理学'],
  ['量子计算', '哲学', '建筑', '经济学'],
  ['神经科学', '艺术', '历史', '城市规划'],
];

export function KeywordInput({ keywords, onChange, disabled }: KeywordInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 6) {
      onChange([...keywords, trimmed]);
    }
    setInput('');
  };

  const removeKeyword = (index: number) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(input);
    } else if (e.key === 'Backspace' && !input && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  const loadPreset = (preset: string[]) => {
    onChange(preset);
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex flex-wrap gap-2 p-4 bg-ink-800/50 border border-parchment/20 rounded-xl
                   cursor-text hover:border-parchment/30 transition-colors
                   focus-within:border-amber-gold/50 focus-within:ring-1 focus-within:ring-amber-gold/30"
      >
        {keywords.map((keyword, index) => (
          <span
            key={keyword}
            className="flex items-center gap-2 px-3 py-1.5 bg-ink-700 border border-parchment/20 rounded-lg
                       text-parchment font-body animate-slide-up"
          >
            <span>{keyword}</span>
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeKeyword(index);
                }}
                className="text-parchment/40 hover:text-parchment transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}
        {!disabled && keywords.length < 6 && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={keywords.length === 0 ? '输入关键词，按 Enter 或逗号添加...' : ''}
            className="flex-1 min-w-[200px] bg-transparent text-parchment font-body
                       placeholder:text-parchment/40 outline-none"
          />
        )}
      </div>

      {!disabled && keywords.length === 0 && (
        <div className="space-y-2">
          <label className="text-parchment/40 text-sm font-body">或选择预设示例：</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => loadPreset(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-800/30 border border-parchment/10
                           rounded-lg text-parchment/60 text-sm font-body
                           hover:border-parchment/30 hover:text-parchment transition-all"
              >
                <Plus size={14} />
                <span>{preset.slice(0, 2).join(', ')}...</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-parchment/40 text-sm font-body">
        已输入 {keywords.length}/6 个关键词
        {keywords.length < 2 && keywords.length > 0 && '（至少需要 2 个）'}
      </div>
    </div>
  );
}
