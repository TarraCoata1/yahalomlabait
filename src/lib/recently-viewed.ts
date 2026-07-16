import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecentState = {
  ids: string[];
  push: (id: string) => void;
  clear: () => void;
};

const MAX = 8;

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) =>
        set((s) => {
          const next = [id, ...s.ids.filter((x) => x !== id)].slice(0, MAX);
          return { ids: next };
        }),
      clear: () => set({ ids: [] }),
    }),
    { name: "ylb-recent", version: 1 },
  ),
);
