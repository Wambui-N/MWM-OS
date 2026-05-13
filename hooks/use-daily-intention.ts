import { useState, useEffect } from "react"
import type { DailyIntention } from "@/types/database"
import { todayISODate } from "@/lib/utils"

export function useDailyIntention() {
  const [intention, setIntention] = useState<DailyIntention | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/intentions?date=${todayISODate()}`)
      .then((r) => r.json())
      .then(({ intention }) => setIntention(intention ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { intention, loading, setIntention }
}
