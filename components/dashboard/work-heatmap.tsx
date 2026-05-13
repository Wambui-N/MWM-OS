"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  format,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subMonths,
  startOfMonth,
  getDay,
  parseISO,
  differenceInCalendarDays,
} from "date-fns"

interface DayData {
  date: string
  total_mins: number
  session_count: number
  daily_score?: number | null
  daily_grade?: string | null
  is_perfect_day?: boolean
}

interface Props {
  months?: 6 | 12
  /** If provided the data is used directly instead of fetching */
  data?: DayData[]
}

function getIntensity(mins: number): 0 | 1 | 2 | 3 | 4 {
  if (mins === 0) return 0
  if (mins < 30) return 1
  if (mins < 60) return 2
  if (mins < 120) return 3
  return 4
}

const INTENSITY_CLASSES: Record<number, string> = {
  0: "bg-bg-subtle",
  1: "bg-orange-100 dark:bg-orange-950",
  2: "bg-orange-200 dark:bg-orange-800",
  3: "bg-orange-400 dark:bg-orange-600",
  4: "bg-brand-accent",
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function computeStats(days: DayData[]) {
  const activeDays = days.filter((d) => d.total_mins > 0)
  const totalMins = days.reduce((s, d) => s + d.total_mins, 0)
  const totalSessions = days.reduce((s, d) => s + d.session_count, 0)
  const avgSessionsPerActiveDay =
    activeDays.length > 0 ? (totalSessions / activeDays.length).toFixed(1) : "0"

  // Longest streak
  const sorted = [...activeDays].sort((a, b) => a.date.localeCompare(b.date))
  let longest = 0
  let streak = 0
  let prev: string | null = null
  for (const d of sorted) {
    if (prev && differenceInCalendarDays(parseISO(d.date), parseISO(prev)) === 1) {
      streak++
    } else {
      streak = 1
    }
    if (streak > longest) longest = streak
    prev = d.date
  }

  // Busiest day of week (0=Sun … 6=Sat, display as Mon-Sun)
  const byDow = [0, 0, 0, 0, 0, 0, 0]
  for (const d of activeDays) byDow[getDay(parseISO(d.date))] += d.total_mins
  const busiestDowIdx = byDow.indexOf(Math.max(...byDow))
  const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const busiestDow = byDow[busiestDowIdx] > 0 ? DOW_NAMES[busiestDowIdx] : null

  return { totalMins, totalSessions, avgSessionsPerActiveDay, longestStreak: longest, busiestDow }
}

export function WorkHeatmap({ months = 6, data: externalData }: Props) {
  const [rawDays, setRawDays] = useState<DayData[]>(externalData ?? [])
  const [loading, setLoading] = useState(!externalData)

  useEffect(() => {
    if (externalData) return
    fetch(`/api/focus/heatmap?months=${months}`)
      .then((r) => r.json())
      .then((json) => setRawDays(json.days ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [months, externalData])

  const today = new Date()
  const rangeStart = startOfWeek(subMonths(today, months), { weekStartsOn: 1 })
  const rangeEnd = endOfWeek(today, { weekStartsOn: 1 })

  const dayMap = new Map<string, DayData>()
  for (const d of rawDays) dayMap.set(d.date, d)

  const weeks = eachWeekOfInterval({ start: rangeStart, end: rangeEnd }, { weekStartsOn: 1 }).map(
    (weekStart) => {
      const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) })
      return days.map((day) => {
        const iso = format(day, "yyyy-MM-dd")
        const d = dayMap.get(iso)
        return {
          iso,
          day,
          total_mins: d?.total_mins ?? 0,
          session_count: d?.session_count ?? 0,
          daily_grade: d?.daily_grade ?? null,
          daily_score: d?.daily_score ?? null,
          is_perfect_day: d?.is_perfect_day ?? false,
          future: day > today,
        }
      })
    }
  )

  // Month labels: collect which column each month starts in
  const monthLabels: { label: string; col: number }[] = []
  weeks.forEach((week, wi) => {
    const firstOfMonth = week.find((d) => d.day.getDate() <= 7)
    if (firstOfMonth && firstOfMonth.day.getDate() <= 7) {
      const label = format(firstOfMonth.day, "MMM")
      if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
        monthLabels.push({ label, col: wi })
      }
    }
  })

  const stats = computeStats(rawDays)

  if (loading) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <div className="h-28 animate-pulse bg-bg-subtle rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card rounded-2xl border border-border p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-text-primary">
          Focus History{months === 12 ? " · 12 months" : " · 6 months"}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${INTENSITY_CLASSES[i]}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map(({ label, col }, i) => {
              const nextCol = monthLabels[i + 1]?.col ?? weeks.length
              const width = (nextCol - col) * 14
              return (
                <span
                  key={label + col}
                  className="text-xs text-text-muted shrink-0"
                  style={{ width, minWidth: 14 }}
                >
                  {label}
                </span>
              )
            })}
          </div>

          <div className="flex gap-1">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1 pt-0.5">
              {DAY_LABELS.map((d, i) => (
                <span
                  key={d}
                  className="text-[10px] text-text-muted leading-none h-3 flex items-center"
                  style={{ visibility: i % 2 === 0 ? "visible" : "hidden" }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((cell) => {
                    const intensity = cell.future ? -1 : getIntensity(cell.total_mins)
                    const scoreInfo = cell.daily_grade
                      ? ` · Grade: ${cell.daily_grade}`
                      : ""
                    const title =
                      cell.future
                        ? format(cell.day, "EEE, d MMM")
                        : cell.total_mins === 0
                        ? `${format(cell.day, "EEE, d MMM")} — no sessions`
                        : `${format(cell.day, "EEE, d MMM")}\n${cell.session_count} session${cell.session_count !== 1 ? "s" : ""} · ${cell.total_mins} min focused${scoreInfo}`

                    const isPerfect = !cell.future && cell.is_perfect_day

                    return (
                      <motion.div
                        key={cell.iso}
                        whileHover={cell.future ? {} : { scale: 1.5 }}
                        title={title}
                        className={`w-3 h-3 rounded-sm cursor-default relative ${
                          cell.future
                            ? "bg-bg-subtle opacity-30"
                            : INTENSITY_CLASSES[intensity as 0 | 1 | 2 | 3 | 4]
                        }`}
                      >
                        {isPerfect && (
                          <span className="absolute -top-1 -right-1 text-[8px] leading-none">👑</span>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      {stats.totalSessions > 0 ? (
        <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 border-t border-border">
          <span className="text-xs text-text-muted">
            <span className="font-medium text-text-primary">{stats.totalSessions}</span> sessions
          </span>
          <span className="text-xs text-text-muted">
            <span className="font-medium text-text-primary">{Math.round(stats.totalMins / 60)}h</span> focused
          </span>
          <span className="text-xs text-text-muted">
            <span className="font-medium text-text-primary">{stats.avgSessionsPerActiveDay}</span> avg sessions/active day
          </span>
          {stats.longestStreak > 1 && (
            <span className="text-xs text-text-muted">
              <span className="font-medium text-text-primary">{stats.longestStreak}-day</span> longest streak
            </span>
          )}
          {stats.busiestDow && (
            <span className="text-xs text-text-muted">
              Busiest: <span className="font-medium text-text-primary">{stats.busiestDow}</span>
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-muted">Complete your first Pomodoro to start tracking.</p>
      )}
    </motion.div>
  )
}
