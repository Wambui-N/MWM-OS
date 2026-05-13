import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TimerStore {
  mode: "work" | "break"
  secondsLeft: number
  isRunning: boolean
  sessionLabel: string
  sessionsToday: number
  projectSessions: [number, number]  // [completed, total]
  workMins: number
  breakMins: number
  comboCount: number
  comboMultiplier: number
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  setLabel: (label: string) => void
  setMode: (mode: "work" | "break") => void
  setProjectSessions: (completed: number, total: number) => void
  completeSession: () => void
  setWorkMins: (mins: number) => void
  setBreakMins: (mins: number) => void
  incrementCombo: () => void
  resetCombo: () => void
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      mode: "work",
      secondsLeft: 25 * 60,
      isRunning: false,
      sessionLabel: "",
      sessionsToday: 0,
      projectSessions: [0, 0],
      workMins: 25,
      breakMins: 5,
      comboCount: 0,
      comboMultiplier: 1,

      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),
      reset: () => {
        const { mode, workMins, breakMins } = get()
        set({
          isRunning: false,
          secondsLeft: (mode === "work" ? workMins : breakMins) * 60,
        })
      },
      tick: () => {
        const { secondsLeft } = get()
        if (secondsLeft > 0) {
          set({ secondsLeft: secondsLeft - 1 })
        }
      },
      setLabel: (label) => set({ sessionLabel: label }),
      setMode: (mode) => {
        const { workMins, breakMins } = get()
        set({
          mode,
          isRunning: false,
          secondsLeft: (mode === "work" ? workMins : breakMins) * 60,
        })
      },
      setProjectSessions: (completed, total) =>
        set({ projectSessions: [completed, total] }),
      completeSession: () => {
        const { sessionsToday, mode, projectSessions } = get()
        if (mode === "work") {
          set({
            sessionsToday: sessionsToday + 1,
            projectSessions: [
              Math.min(projectSessions[0] + 1, projectSessions[1]),
              projectSessions[1],
            ],
          })
        }
      },
      setWorkMins: (mins) => {
        const { mode } = get()
        set({ workMins: mins })
        if (mode === "work") set({ secondsLeft: mins * 60 })
      },
      setBreakMins: (mins) => {
        const { mode } = get()
        set({ breakMins: mins })
        if (mode === "break") set({ secondsLeft: mins * 60 })
      },
      incrementCombo: () =>
        set((state) => {
          const newCount = state.comboCount + 1
          const multiplier = newCount >= 4 ? 2 : newCount >= 2 ? 1.5 : 1
          return { comboCount: newCount, comboMultiplier: multiplier }
        }),
      resetCombo: () => set({ comboCount: 0, comboMultiplier: 1 }),
    }),
    {
      name: "mwm-timer",
      partialize: (state) => ({
        sessionsToday: state.sessionsToday,
        projectSessions: state.projectSessions,
        sessionLabel: state.sessionLabel,
        workMins: state.workMins,
        breakMins: state.breakMins,
      }),
    }
  )
)
