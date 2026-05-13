"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { stagger } from "@/lib/animations"
import { Greeting } from "@/components/dashboard/greeting"
import { StatCard } from "@/components/dashboard/stat-card"
import { TodaySchedule } from "@/components/dashboard/today-schedule"
import { PipelineHealth } from "@/components/dashboard/pipeline-health"
import { StaleLeads } from "@/components/dashboard/stale-leads"
import { ContentWeek } from "@/components/dashboard/content-week"
import { WorkHeatmap } from "@/components/dashboard/work-heatmap"
import { IntentionModal } from "@/components/morning/intention-modal"
import { PlanMyDay } from "@/components/morning/plan-my-day"
import { useUIStore } from "@/stores/ui"
import { todayISODate } from "@/lib/utils"
import type { ClientStage, DailyPlan, ContentPost, Client } from "@/types/database"

interface DashboardClientProps {
  stats: {
    pipelineValue: number
    proposalsOut: number
    activeClients: number
    postsThisWeek: number
  }
  stageCounts: Partial<Record<ClientStage, number>>
  staleLeads: Client[]
  todayPlan: DailyPlan | null
  weekPosts: ContentPost[]
  userXP: number
  todayIntention: any
  isMonday: boolean
}

export function DashboardClient({
  stats,
  stageCounts,
  staleLeads,
  todayPlan,
  weekPosts,
  todayIntention,
  isMonday,
}: DashboardClientProps) {
  const { intentionDoneToday, planDoneToday, setIntentionDoneToday, setPlanDoneToday, deepWork } = useUIStore()
  const [showIntention, setShowIntention] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [showMondayBanner, setShowMondayBanner] = useState(false)

  useEffect(() => {
    // Reset daily flags at midnight
    const lastDateKey = "mwm-last-date"
    const stored = localStorage.getItem(lastDateKey)
    const today = todayISODate()
    if (stored !== today) {
      localStorage.setItem(lastDateKey, today)
      setIntentionDoneToday(false)
      setPlanDoneToday(false)
    }
  }, [setIntentionDoneToday, setPlanDoneToday])

  useEffect(() => {
    // Show intention modal if not done today
    if (!intentionDoneToday && !todayIntention) {
      const t = setTimeout(() => setShowIntention(true), 400)
      return () => clearTimeout(t)
    }
  }, [intentionDoneToday, todayIntention])

  useEffect(() => {
    // Show plan-my-day if intention done but no plan yet
    if ((intentionDoneToday || todayIntention) && !planDoneToday && !todayPlan) {
      const t = setTimeout(() => setShowPlan(true), 200)
      return () => clearTimeout(t)
    }
  }, [intentionDoneToday, planDoneToday, todayPlan, todayIntention])

  useEffect(() => {
    if (isMonday && !todayPlan) {
      setShowMondayBanner(true)
      const t = setTimeout(() => setShowMondayBanner(false), 5000)
      return () => clearTimeout(t)
    }
  }, [isMonday, todayPlan])

  return (
    <>
      <IntentionModal
        open={showIntention}
        onClose={() => {
          setShowIntention(false)
          if (!todayPlan) setShowPlan(true)
        }}
      />

      <PlanMyDay
        open={showPlan}
        onClose={() => setShowPlan(false)}
        planDate={todayISODate()}
        initialPlan={todayPlan ?? undefined}
      />

      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* Monday banner */}
        {showMondayBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-brand-accent text-white rounded-2xl px-6 py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Happy Monday, Wambui. New week, new scenarios.
              </p>
              <p className="text-sm text-white/80">Plan your week and let&apos;s build something great.</p>
            </div>
            <button
              onClick={() => setShowMondayBanner(false)}
              className="text-white/70 hover:text-white text-xl"
            >
              ×
            </button>
          </motion.div>
        )}

        {deepWork ? (
          /* Deep Work: minimal view */
          <div className="space-y-6">
            <TodaySchedule plan={todayPlan} onEdit={() => setShowPlan(true)} />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <Greeting />

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Pipeline Value"
                value={stats.pipelineValue}
                prefix="KSh"
                description="Active + negotiation"
              />
              <StatCard
                label="Proposals Out"
                value={stats.proposalsOut}
                description="Awaiting response"
              />
              <StatCard
                label="Active Clients"
                value={stats.activeClients}
                description="In delivery"
              />
              <StatCard
                label="Posts This Week"
                value={stats.postsThisWeek}
                description="Scheduled"
              />
            </div>

            <WorkHeatmap months={6} />
            <TodaySchedule plan={todayPlan} onEdit={() => setShowPlan(true)} />
            <PipelineHealth stageCounts={stageCounts} />
            <StaleLeads leads={staleLeads as Client[]} />
            <ContentWeek posts={weekPosts as ContentPost[]} />
          </motion.div>
        )}
      </div>
    </>
  )
}
