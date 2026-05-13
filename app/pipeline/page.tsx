import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { PipelineClient } from "./pipeline-client"

export default async function PipelinePage() {
  const session = await auth()
  if (!session) redirect("/login")

  let clients: any[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
    clients = data ?? []
  } catch {
    // DB not connected yet
  }

  return <PipelineClient initialClients={clients} />
}
