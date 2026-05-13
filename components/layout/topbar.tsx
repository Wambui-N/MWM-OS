"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Focus } from "lucide-react"
import { useUIStore } from "@/stores/ui"
import { cn } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/dashboard": "Daily Pulse",
  "/pipeline":  "Pipeline",
  "/projects":  "Projects",
  "/content":   "Content",
  "/settings":  "Settings",
}

function getTitle(pathname: string) {
  for (const [key, title] of Object.entries(pageTitles)) {
    if (pathname === key || pathname.startsWith(key + "/")) return title
  }
  return "Made With Make"
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())
}

export function Topbar() {
  const pathname = usePathname()
  const { deepWork, toggleDeepWork } = useUIStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault()
        toggleDeepWork()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleDeepWork])

  if (deepWork) {
    return (
      <div className="h-10 flex items-center justify-between px-4 border-b border-border bg-bg-card">
        <span className="text-xs text-text-muted">{getTodayLabel()}</span>
        <button
          onClick={toggleDeepWork}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
          title="Exit deep work (Cmd+D)"
        >
          Exit Deep Work
        </button>
      </div>
    )
  }

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-bg-card shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-text-primary">
          {getTitle(pathname)}
        </h1>
        <span className="text-sm text-text-muted hidden sm:block">
          {getTodayLabel()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDeepWork}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            deepWork
              ? "bg-brand-accent text-white"
              : "text-text-muted hover:bg-bg-subtle hover:text-text-primary"
          )}
          title="Toggle Deep Work mode (Cmd+D)"
        >
          <Focus size={14} />
          <span className="hidden sm:inline">Deep Work</span>
        </button>
      </div>
    </div>
  )
}
