import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LLMConfig } from '@/llm/types';

interface SettingsState extends LLMConfig {
  setProviderType: (type: LLMConfig['providerType']) => void;
  setOpenAI: (config: Partial<LLMConfig['openai']>) => void;
  setOllama: (config: Partial<LLMConfig['ollama']>) => void;
  setCustom: (config: Partial<LLMConfig['custom']>) => void;
  setTemperature: (temp: number) => void;
}

const defaultOpenAI = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o',
};

const defaultOllama = {
  baseUrl: 'http://localhost:11434',
  model: 'llama3',
};

const defaultCustom = {
  apiKey: '',
  baseUrl: '',
  model: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      providerType: 'openai',
      openai: defaultOpenAI,
      ollama: defaultOllama,
      custom: defaultCustom,
      temperature: 0.7,

      setProviderType: (type) => set({ providerType: type }),
      setOpenAI: (config) =>
        set((state) => ({
          openai: { ...state.openai, ...config },
        })),
      setOllama: (config) =>
        set((state) => ({
          ollama: { ...state.ollama, ...config },
        })),
      setCustom: (config) =>
        set((state) => ({
          custom: { ...state.custom, ...config },
        })),
      setTemperature: (temp) => set({ temperature: temp }),
    }),
    {
      name: 'idea-collision-settings',
    }
  )
);
