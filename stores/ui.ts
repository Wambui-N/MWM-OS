import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SavedStation } from "@/types/database"

interface UIStore {
  sidebarCollapsed: boolean
  deepWork: boolean
  pipelineView: "kanban" | "table"
  intentionDoneToday: boolean
  planDoneToday: boolean
  currentStation: SavedStation | null
  musicCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  toggleDeepWork: () => void
  setPipelineView: (view: "kanban" | "table") => void
  setIntentionDoneToday: (v: boolean) => void
  setPlanDoneToday: (v: boolean) => void
  setStation: (station: SavedStation | null) => void
  toggleMusicCollapsed: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      deepWork: false,
      pipelineView: "kanban",
      intentionDoneToday: false,
      planDoneToday: false,
      currentStation: null,
      musicCollapsed: false,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleDeepWork: () => set((s) => ({ deepWork: !s.deepWork })),
      setPipelineView: (view) => set({ pipelineView: view }),
      setIntentionDoneToday: (v) => set({ intentionDoneToday: v }),
      setPlanDoneToday: (v) => set({ planDoneToday: v }),
      setStation: (station) => set({ currentStation: station }),
      toggleMusicCollapsed: () => set((s) => ({ musicCollapsed: !s.musicCollapsed })),
    }),
    {
      name: "mwm-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        pipelineView: state.pipelineView,
        currentStation: state.currentStation,
        musicCollapsed: state.musicCollapsed,
      }),
    }
  )
)
