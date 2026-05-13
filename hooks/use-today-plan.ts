import { useState, useEffect } from "react"
import type { DailyPlan } from "@/types/database"
import { todayISODate } from "@/lib/utils"

export function useTodayPlan() {
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/plans?date=${todayISODate()}`)
      .then((r) => r.json())
      .then(({ plans }) => setPlan(plans?.[0] ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { plan, loading, setPlan }
}
