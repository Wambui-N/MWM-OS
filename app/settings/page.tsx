import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  let prefs: any = null
  let energyData: { date: string; level: number }[] = []

  try {
    const supabase = createAdminClient()
    const { data: prefsData } = await supabase
      .from("user_prefs")
      .select("*")
      .eq("user_email", process.env.ALLOWED_EMAIL!)
      .single()
    prefs = prefsData

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: intentions } = await supabase
      .from("daily_intentions")
      .select("intention_date, energy_level")
      .gte("intention_date", thirtyDaysAgo.toISOString().split("T")[0])
      .not("energy_level", "is", null)
      .order("intention_date")
    energyData = (intentions ?? []).map((i) => ({ date: i.intention_date, level: i.energy_level! }))
  } catch {}

  return <SettingsClient prefs={prefs} energyData={energyData} />
}
