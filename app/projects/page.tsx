import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { ProjectsClient } from "./projects-client"

export default async function ProjectsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  let projects: any[] = []
  let clients: any[] = []
  try {
    const supabase = createAdminClient()
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("projects").select("*, clients(name, company)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name, company").eq("stage", "active"),
    ])
    projects = p ?? []
    clients = c ?? []
  } catch {}

  return <ProjectsClient initialProjects={projects} clients={clients} />
}
