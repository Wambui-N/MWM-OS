"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { stagger, fadeUp } from "@/lib/animations"
import type { ContentPost, ContentStatus } from "@/types/database"
import { ComposeDrawer } from "@/components/content/compose-drawer"
import { PostingStreak } from "@/components/content/posting-streak"
import { Plus } from "lucide-react"
import { cn, formatDateShort } from "@/lib/utils"
import { startOfWeek, addDays, format, parseISO, isThisWeek } from "date-fns"

const STATUS_STYLES: Record<ContentStatus, { label: string; dot: string; bg: string; text: string }> = {
  posted:    { label: "Posted",    dot: "bg-success",  bg: "bg-success/10", text: "text-success" },
  scheduled: { label: "Scheduled", dot: "bg-warning",  bg: "bg-warning/10", text: "text-warning" },
  draft:     { label: "Draft",     dot: "bg-text-muted", bg: "bg-bg-subtle", text: "text-text-muted" },
}

// Mon–Thu posting schedule
const POSTING_DAYS = [1, 2, 3, 4]

interface ContentClientProps {
  initialPosts: ContentPost[]
  postingStreak?: number
  postingStreakBest?: number
  freezeCount?: number
}

export function ContentClient({ initialPosts, postingStreak = 0, postingStreakBest = 0, freezeCount = 1 }: ContentClientProps) {
  const [posts, setPosts] = useState<ContentPost[]>(initialPosts)
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null)
  const [showCompose, setShowCompose] = useState(false)

  function handleSaved(post: ContentPost) {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id)
      if (idx !== -1) return prev.map((p) => (p.id === post.id ? post : p))
      return [post, ...prev]
    })
  }

  // Build this week's day columns Mon–Thu
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = POSTING_DAYS.map((d) => addDays(weekStart, d - 1))

  const postsByDate = posts.reduce((acc, post) => {
    if (!post.scheduled_date) return acc
    const key = post.scheduled_date
    acc[key] = acc[key] ? [...acc[key], post] : [post]
    return acc
  }, {} as Record<string, ContentPost[]>)

  const drafts = posts.filter((p) => p.status === "draft" && !p.scheduled_date)

  // Check if this week is missing (not all Mon-Thu posted)
  const postedThisWeek = weekDays.map((d) => {
    const key = format(d, "yyyy-MM-dd")
    return (postsByDate[key] ?? []).some((p) => p.status === "posted")
  })
  const isMissingThisWeek = postedThisWeek.some((done) => !done)

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Posting streak header */}
      <PostingStreak
        streak={postingStreak}
        streakBest={postingStreakBest}
        freezeCount={freezeCount}
        isMissingThisWeek={isMissingThisWeek}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{posts.length} posts total</p>
        <button
          onClick={() => { setSelectedPost(null); setShowCompose(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* This week */}
      <div className="space-y-3">
        <h2
          className="text-xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          This Week
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {weekDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayPosts = postsByDate[dateKey] ?? []
            const today = format(new Date(), "yyyy-MM-dd") === dateKey

            return (
              <div
                key={dateKey}
                className={cn(
                  "bg-bg-card rounded-2xl border p-4 space-y-3 min-h-[120px]",
                  today ? "border-brand-accent" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                    {format(day, "EEE")}
                  </p>
                  <span className={cn("text-xs font-medium", today && "text-brand-accent")}>
                    {format(day, "d MMM")}
                  </span>
                </div>

                {dayPosts.length > 0 ? (
                  dayPosts.map((post) => (
                    <PostCard key={post.id} post={post} onClick={() => { setSelectedPost(post); setShowCompose(true) }} />
                  ))
                ) : (
                  <button
                    onClick={() => { setSelectedPost(null); setShowCompose(true) }}
                    className="w-full text-xs text-text-muted border border-dashed border-border rounded-xl py-2 hover:border-brand-accent hover:text-brand-accent transition-colors"
                  >
                    + Schedule
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* All posts */}
      <div className="space-y-3">
        <h2
          className="text-xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          All Posts
        </h2>
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={fadeUp}
              onClick={() => { setSelectedPost(post); setShowCompose(true) }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-bg-card border border-border hover:border-border-strong cursor-pointer transition-colors"
            >
              <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_STYLES[post.status].dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{post.hook || "Untitled draft"}</p>
                {post.pillar && <p className="text-xs text-text-muted">{post.pillar}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {post.scheduled_date && (
                  <span className="text-xs text-text-muted">{formatDateShort(post.scheduled_date)}</span>
                )}
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_STYLES[post.status].bg, STATUS_STYLES[post.status].text)}>
                  {STATUS_STYLES[post.status].label}
                </span>
              </div>
            </motion.div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-12 text-sm text-text-muted">
              No posts yet. Create your first one.
            </div>
          )}
        </motion.div>
      </div>

      <ComposeDrawer
        post={selectedPost}
        open={showCompose}
        onClose={() => { setShowCompose(false); setSelectedPost(null) }}
        onSaved={handleSaved}
      />
    </div>
  )
}

function PostCard({ post, onClick }: { post: ContentPost; onClick: () => void }) {
  const style = STATUS_STYLES[post.status]
  return (
    <button
      onClick={onClick}
      className={cn("w-full text-left p-3 rounded-xl border transition-colors space-y-1.5", style.bg, "border-transparent hover:border-border-strong")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-xs font-medium", style.text)}>{style.label}</span>
      </div>
      {post.hook && (
        <p className="text-xs text-text-primary line-clamp-2">{post.hook}</p>
      )}
    </button>
  )
}
