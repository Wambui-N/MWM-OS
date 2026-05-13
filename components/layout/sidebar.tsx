"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users2,
  FolderKanban,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useUIStore } from "@/stores/ui"
import { DarkModeToggle } from "@/components/shared/dark-mode-toggle"
import { XPBar } from "@/components/shared/xp-bar"
import { sidebarVariants, sidebarTransition } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline",  label: "Pipeline",  icon: Users2 },
  { href: "/projects",  label: "Projects",  icon: FolderKanban },
  { href: "/content",   label: "Content",   icon: FileText },
  { href: "/settings",  label: "Settings",  icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [xp, setXp] = useState(0)

  useEffect(() => {
    fetch("/api/prefs").then(r => r.json()).then(({ prefs }) => {
      if (prefs?.xp) setXp(prefs.xp)
    }).catch(() => {})
  }, [])

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarCollapsed ? "closed" : "open"}
      transition={sidebarTransition}
      className="flex flex-col h-full bg-bg-card border-r border-border overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-accent text-white flex items-center justify-center text-base font-bold shrink-0">
            ✳
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Made With Make
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group",
                active
                  ? "bg-brand-accent text-white"
                  : "text-text-muted hover:bg-bg-subtle hover:text-text-primary",
                sidebarCollapsed && "justify-center"
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* XP bar */}
      <div className="px-1 py-1 border-t border-border">
        <XPBar xp={xp} collapsed={sidebarCollapsed} />
      </div>

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-0.5 shrink-0">
        <DarkModeToggle collapsed={sidebarCollapsed} />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-subtle hover:text-danger transition-colors",
            sidebarCollapsed && "justify-center"
          )}
          title="Sign out"
        >
          <LogOut size={16} />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors",
            sidebarCollapsed && "justify-center"
          )}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
