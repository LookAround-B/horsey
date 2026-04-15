import { create } from 'zustand';

interface CartEntry {
  id: string;
  competitionId: string;
  competitionName: string;
  horseId: string;
  horseName: string;
  fee: number;
}

interface CartState {
  entries: CartEntry[];
  addEntry: (entry: CartEntry) => void;
  removeEntry: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  entries: [],

  addEntry: (entry) =>
    set((state) => {
      if (state.entries.some((e) => e.id === entry.id)) return state;
      return { entries: [...state.entries, entry] };
    }),

  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),

  clearCart: () => set({ entries: [] }),

  total: () => get().entries.reduce((sum, e) => sum + e.fee, 0),
}));
