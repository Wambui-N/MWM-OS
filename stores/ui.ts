import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIStore {
  sidebarCollapsed: boolean
  deepWork: boolean
  pipelineView: "kanban" | "table"
  intentionDoneToday: boolean
  planDoneToday: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  toggleDeepWork: () => void
  setPipelineView: (view: "kanban" | "table") => void
  setIntentionDoneToday: (v: boolean) => void
  setPlanDoneToday: (v: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      deepWork: false,
      pipelineView: "kanban",
      intentionDoneToday: false,
      planDoneToday: false,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleDeepWork: () => set((s) => ({ deepWork: !s.deepWork })),
      setPipelineView: (view) => set({ pipelineView: view }),
      setIntentionDoneToday: (v) => set({ intentionDoneToday: v }),
      setPlanDoneToday: (v) => set({ planDoneToday: v }),
    }),
    {
      name: "mwm-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        pipelineView: state.pipelineView,
      }),
    }
  )
)
