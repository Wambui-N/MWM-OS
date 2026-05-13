"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface DarkModeToggleProps {
  collapsed?: boolean
}

export function DarkModeToggle({ collapsed }: DarkModeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors",
        collapsed && "justify-center"
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {!collapsed && (
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      )}
    </button>
  )
}
