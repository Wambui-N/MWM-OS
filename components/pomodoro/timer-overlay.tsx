"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from "lucide-react"
import { useTimerStore } from "@/stores/timer"
import { ProgressRing } from "./progress-ring"
import { SessionDots } from "./session-dots"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function TimerOverlay() {
  const [expanded, setExpanded] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const {
    mode, secondsLeft, isRunning, sessionLabel, sessionsToday,
    projectSessions, workMins, breakMins,
    start, pause, reset, tick, setLabel, setMode, completeSession,
  } = useTimerStore()

  const totalSeconds = (mode === "work" ? workMins : breakMins) * 60
  const progress = (totalSeconds - secondsLeft) / totalSeconds

  const handleSessionComplete = useCallback(async () => {
    completeSession()
    if (mode === "work") {
      const newTotal = useTimerStore.getState().sessionsToday + 1
      toast.success("Session complete! Take a break.", { icon: "🍅" })
      if (newTotal === 4) {
        toast.success("4 sessions in a day! 🔥 Absolute machine.", { duration: 5000 })
      }
      try {
        await fetch("/api/focus/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_date: new Date().toISOString().split("T")[0],
            label: sessionLabel || null,
            duration_mins: workMins,
            completed: true,
          }),
        })
        await fetch("/api/prefs/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: newTotal === 4 ? 30 : 0 }),
        }).catch(() => {})
      } catch {
        // silent
      }
    }
  }, [mode, workMins, sessionLabel, completeSession])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const store = useTimerStore.getState()
        if (store.secondsLeft <= 1) {
          clearInterval(intervalRef.current!)
          useTimerStore.getState().pause()
          useTimerStore.setState({ secondsLeft: 0 })
          handleSessionComplete()
        } else {
          tick()
        }
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, tick, handleSessionComplete])

  const totalToday = sessionsToday
  const minutesToday = totalToday * workMins

  return (
    <>
      {/* Break overlay */}
      <AnimatePresence>
        {mode === "break" && isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-base/60 backdrop-blur-sm z-40 pointer-events-none"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-lg text-text-muted italic" style={{ fontFamily: "var(--font-display)" }}>
                Step away. You&apos;ve earned it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer widget */}
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={{ top: -600, left: -1200, right: 0, bottom: 0 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
        whileDrag={{ scale: 1.02 }}
      >
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.button
              key="pill"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-bg-card border border-border shadow-lg text-sm font-mono font-medium text-text-primary hover:border-brand-accent transition-colors"
            >
              <span>🍅</span>
              <span>{formatTime(secondsLeft)}</span>
              {isRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              )}
              <ChevronUp size={14} className="text-text-muted" />
            </motion.button>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-64 bg-bg-card rounded-2xl border border-border shadow-xl p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {mode === "work" ? "Focus" : "Break"}
                </span>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Label */}
              <input
                value={sessionLabel}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="What are you working on?"
                className="w-full text-xs bg-transparent border-none outline-none text-text-muted placeholder:text-text-muted focus:text-text-primary"
              />

              {/* Ring + time */}
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="relative">
                  <ProgressRing
                    progress={progress}
                    size={100}
                    strokeWidth={7}
                    color={mode === "work" ? "var(--accent)" : "var(--success)"}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-2xl font-semibold text-text-primary tabular-nums"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {formatTime(secondsLeft)}
                    </span>
                  </div>
                </div>

                <SessionDots completed={projectSessions[0]} total={projectSessions[1]} />
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border">
                {(["work", "break"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium transition-colors",
                      mode === m
                        ? "bg-brand-accent text-white"
                        : "text-text-muted hover:bg-bg-subtle"
                    )}
                  >
                    {m === "work" ? "Focus" : "Break"}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={reset}
                  className="p-2 rounded-lg text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={isRunning ? pause : start}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors shadow-sm"
                  title={isRunning ? "Pause" : "Start"}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>

              {/* Stats */}
              {sessionsToday > 0 && (
                <p className="text-center text-xs text-text-muted">
                  {sessionsToday} session{sessionsToday !== 1 ? "s" : ""} · {minutesToday} min focused
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
