"use client"

import { useState } from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import { getLevelInfo } from "@/components/shared/xp-bar"
import { WorkHeatmap } from "@/components/dashboard/work-heatmap"
import type { UserPrefs } from "@/types/database"
import { toast } from "sonner"

interface SettingsClientProps {
  prefs: UserPrefs | null
  energyData: { date: string; level: number }[]
}

export function SettingsClient({ prefs, energyData }: SettingsClientProps) {
  const [workMins, setWorkMins] = useState(prefs?.pomodoro_work_mins ?? 25)
  const [breakMins, setBreakMins] = useState(prefs?.pomodoro_break_mins ?? 5)
  const [workStart, setWorkStart] = useState(prefs?.work_start_time ?? "09:00")
  const [saving, setSaving] = useState(false)

  const xp = prefs?.xp ?? 0
  const { current, next, progress } = getLevelInfo(xp)

  async function savePrefs() {
    setSaving(true)
    try {
      const res = await fetch("/api/prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pomodoro_work_mins: workMins,
          pomodoro_break_mins: breakMins,
          work_start_time: workStart,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Settings saved!")
    } catch {
      toast.error("Couldn't save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-10">
      {/* XP / Level */}
      <section className="space-y-4">
        <h2
          className="text-2xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Level & Progress
        </h2>
        <div className="bg-bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-text-primary">{current.name}</p>
              <p className="text-sm text-text-muted">{xp} XP total</p>
            </div>
            <div className="text-right">
              {next && (
                <p className="text-xs text-text-muted">
                  {next.threshold - xp} XP to <span className="font-medium text-text-primary">{next.name}</span>
                </p>
              )}
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-accent transition-all duration-700"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* Pomodoro settings */}
      <section className="space-y-4">
        <h2
          className="text-2xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Preferences
        </h2>
        <div className="bg-bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Work Start Time</label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Pomodoro Work (min)</label>
              <input
                type="number"
                min={1} max={90}
                value={workMins}
                onChange={(e) => setWorkMins(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Pomodoro Break (min)</label>
              <input
                type="number"
                min={1} max={30}
                value={breakMins}
                onChange={(e) => setBreakMins(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
              />
            </div>
          </div>
          <button
            onClick={savePrefs}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </section>

      {/* Focus heatmap */}
      <section className="space-y-4">
        <h2
          className="text-2xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Focus History
        </h2>
        <WorkHeatmap months={12} />
      </section>

      {/* Energy sparkline */}
      {energyData.length > 1 && (
        <section className="space-y-4">
          <h2
            className="text-2xl font-semibold text-text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Energy Trend (30 days)
          </h2>
          <div className="bg-bg-card rounded-2xl border border-border p-6">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={energyData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                  labelFormatter={(label) => String(label)}
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Webhook info */}
      <section className="space-y-4">
        <h2
          className="text-2xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Integrations
        </h2>
        <div className="bg-bg-card rounded-2xl border border-border p-6 space-y-3">
          <p className="text-sm text-text-muted">
            Configure your Make.com webhook URLs in <code className="text-xs bg-bg-subtle px-1.5 py-0.5 rounded">.env.local</code> to enable Google Calendar sync, Drive folder creation, and proposal generation.
          </p>
          <div className="space-y-1 text-xs font-mono text-text-muted">
            {[
              "MAKE_WEBHOOK_SCHEDULE",
              "MAKE_WEBHOOK_ONBOARDING",
              "MAKE_WEBHOOK_PROPOSAL",
              "MAKE_WEBHOOK_CONTENT",
              "MAKE_INCOMING_SECRET",
            ].map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-brand-accent">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
