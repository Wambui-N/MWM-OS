import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SavedStation, Reward } from "@/types/database"

interface UIStore {
  sidebarCollapsed: boolean
  deepWork: boolean
  pipelineView: "kanban" | "table" | "wins"
  intentionDoneToday: boolean
  planDoneToday: boolean
  currentStation: SavedStation | null
  musicCollapsed: boolean
  pendingReward: Reward | null
  isReviewModalOpen: boolean
  isChallengeSetupOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  toggleDeepWork: () => void
  setPipelineView: (view: "kanban" | "table" | "wins") => void
  setIntentionDoneToday: (v: boolean) => void
  setPlanDoneToday: (v: boolean) => void
  setStation: (station: SavedStation | null) => void
  toggleMusicCollapsed: () => void
  triggerRewardMoment: (reward: Reward) => void
  clearRewardMoment: () => void
  openReviewModal: () => void
  closeReviewModal: () => void
  openChallengeSetup: () => void
  closeChallengeSetup: () => void
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
      pendingReward: null,
      isReviewModalOpen: false,
      isChallengeSetupOpen: false,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleDeepWork: () => set((s) => ({ deepWork: !s.deepWork })),
      setPipelineView: (view) => set({ pipelineView: view }),
      setIntentionDoneToday: (v) => set({ intentionDoneToday: v }),
      setPlanDoneToday: (v) => set({ planDoneToday: v }),
      setStation: (station) => set({ currentStation: station }),
      toggleMusicCollapsed: () => set((s) => ({ musicCollapsed: !s.musicCollapsed })),
      triggerRewardMoment: (reward) => set({ pendingReward: reward }),
      clearRewardMoment: () => set({ pendingReward: null }),
      openReviewModal: () => set({ isReviewModalOpen: true }),
      closeReviewModal: () => set({ isReviewModalOpen: false }),
      openChallengeSetup: () => set({ isChallengeSetupOpen: true }),
      closeChallengeSetup: () => set({ isChallengeSetupOpen: false }),
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
