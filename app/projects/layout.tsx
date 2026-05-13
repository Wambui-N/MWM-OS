import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { TimerOverlay } from "@/components/pomodoro/timer-overlay"
import { MusicWidget } from "@/components/music/music-widget"
import { RewardMoment } from "@/components/rewards/reward-moment"

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  return (
    <div className="flex h-full bg-bg-base">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <TimerOverlay />
      <MusicWidget />
      <RewardMoment />
    </div>
  )
}
