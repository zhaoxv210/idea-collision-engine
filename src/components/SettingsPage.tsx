import { useState } from 'react';
import { Settings, ChevronLeft, Check, X, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { createProvider } from '@/llm';
import { cn } from '@/lib/utils';

interface SettingsPageProps {
  onBack: () => void;
}

const PROVIDER_OPTIONS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 等',
    icon: '🤖',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: '本地模型，完全离线',
    icon: '🦙',
  },
  {
    id: 'custom',
    name: '自定义 API',
    description: 'DeepSeek, 智谱, Moonshot 等',
    icon: '🔌',
  },
] as const;

const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
const OLLAMA_MODELS = ['llama3', 'llama3:70b', 'mistral', 'qwen2', 'deepseek-coder'];

export function SettingsPage({ onBack }: SettingsPageProps) {
  const {
    providerType,
    openai,
    ollama,
    custom,
    temperature,
    setProviderType,
    setOpenAI,
    setOllama,
    setCustom,
    setTemperature,
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const provider = createProvider(useSettingsStore.getState());
      const result = await provider.testConnection();
      setTestResult(result ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg noise-bg">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-parchment/60 hover:text-parchment transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          <span className="font-body">返回</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-amber-gold" size={28} />
          <h1 className="heading-section">LLM 配置</h1>
        </div>

        <div className="space-y-8">
          <div>
            <label className="label-text">选择 Provider</label>
            <div className="grid grid-cols-3 gap-4">
              {PROVIDER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setProviderType(option.id)}
                  className={cn(
                    'card p-4 text-left transition-all',
                    providerType === option.id
                      ? 'border-amber-gold/50 shadow-[0_0_15px_rgba(212,165,116,0.2)]'
                      : 'hover:border-parchment/30'
                  )}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-body font-medium text-parchment">{option.name}</div>
                  <div className="text-xs text-parchment/50 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {providerType === 'openai' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="label-text">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={openai.apiKey}
                    onChange={(e) => setOpenAI({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="input-field pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment/40 hover:text-parchment"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label-text">Base URL</label>
                <input
                  type="text"
                  value={openai.baseUrl}
                  onChange={(e) => setOpenAI({ baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Model</label>
                <select
                  value={openai.model}
                  onChange={(e) => setOpenAI({ model: e.target.value })}
                  className="input-field"
                >
                  {OPENAI_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {providerType === 'ollama' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="label-text">Ollama URL</label>
                <input
                  type="text"
                  value={ollama.baseUrl}
                  onChange={(e) => setOllama({ baseUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Model</label>
                <select
                  value={ollama.model}
                  onChange={(e) => setOllama({ model: e.target.value })}
                  className="input-field"
                >
                  {OLLAMA_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {providerType === 'custom' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="label-text">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={custom.apiKey}
                    onChange={(e) => setCustom({ apiKey: e.target.value })}
                    placeholder="your-api-key"
                    className="input-field pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment/40 hover:text-parchment"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label-text">Base URL</label>
                <input
                  type="text"
                  value={custom.baseUrl}
                  onChange={(e) => setCustom({ baseUrl: e.target.value })}
                  placeholder="https://api.deepseek.com/v1"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Model Name</label>
                <input
                  type="text"
                  value={custom.model}
                  onChange={(e) => setCustom({ model: e.target.value })}
                  placeholder="deepseek-chat"
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div>
            <label className="label-text">
              Temperature: <span className="text-amber-gold">{temperature.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-ink-700 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:bg-amber-gold
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-parchment/40 mt-1">
              <span>精确 (0)</span>
              <span>创意 (1)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleTest} disabled={testing} className="btn-outline">
              {testing ? '测试中...' : '测试连接'}
            </button>
            {testResult === 'success' && (
              <div className="flex items-center gap-2 text-green-400">
                <Check size={18} />
                <span className="text-sm">连接成功</span>
              </div>
            )}
            {testResult === 'error' && (
              <div className="flex items-center gap-2 text-red-400">
                <X size={18} />
                <span className="text-sm">连接失败</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
