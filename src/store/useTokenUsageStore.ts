import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TokenUsageRecord {
  id: string;
  timestamp: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  model: string;
  operation: string;
}

interface TokenUsageState {
  budget: number;
  used: number;
  records: TokenUsageRecord[];
  pricePer1kTokens: number;

  setBudget: (budget: number) => void;
  setPricePer1kTokens: (price: number) => void;
  addUsage: (usage: Omit<TokenUsageRecord, 'id' | 'timestamp' | 'cost'>) => void;
  clearRecords: () => void;
  getRemaining: () => number;
  getTotalUsed: () => number;
  getTodayUsage: () => number;
  getRecentRecords: (limit?: number) => TokenUsageRecord[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useTokenUsageStore = create<TokenUsageState>()(
  persist(
    (set, get) => ({
      budget: 10,
      used: 0,
      records: [],
      pricePer1kTokens: 0.01,

      setBudget: (budget) => set({ budget }),

      setPricePer1kTokens: (price) => set({ pricePer1kTokens: price }),

      addUsage: (usage) => {
        const cost = (usage.totalTokens / 1000) * get().pricePer1kTokens;
        const record: TokenUsageRecord = {
          id: generateId(),
          timestamp: Date.now(),
          ...usage,
          cost,
        };
        set((state) => ({
          records: [record, ...state.records].slice(0, 100),
          used: state.used + cost,
        }));
      },

      clearRecords: () => set({ records: [], used: 0 }),

      getRemaining: () => {
        const { budget, used } = get();
        return Math.max(0, budget - used);
      },

      getTotalUsed: () => get().used,

      getTodayUsage: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        return get().records
          .filter((r) => r.timestamp >= todayStart)
          .reduce((sum, r) => sum + r.cost, 0);
      },

      getRecentRecords: (limit = 10) => {
        return get().records.slice(0, limit);
      },
    }),
    {
      name: 'token-usage-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        budget: state.budget,
        used: state.used,
        records: state.records,
        pricePer1kTokens: state.pricePer1kTokens,
      }),
    }
  )
);
