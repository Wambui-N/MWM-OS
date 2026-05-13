import { useEffect, useRef } from "react"
import { useTimerStore } from "@/stores/timer"

export function usePomodoro() {
  const store = useTimerStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (store.isRunning) {
      intervalRef.current = setInterval(() => {
        const { secondsLeft, pause, tick } = useTimerStore.getState()
        if (secondsLeft <= 1) {
          clearInterval(intervalRef.current!)
          pause()
        } else {
          tick()
        }
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [store.isRunning])

  return store
}
