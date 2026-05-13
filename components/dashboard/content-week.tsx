"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"
import type { ContentPost } from "@/types/database"
import { cn, formatDateShort } from "@/lib/utils"

const STATUS_STYLES = {
  posted:    { label: "Posted",    bg: "bg-success/10", text: "text-success" },
  scheduled: { label: "Scheduled", bg: "bg-warning/10", text: "text-warning" },
  draft:     { label: "Draft",     bg: "bg-bg-subtle",  text: "text-text-muted" },
}

interface ContentWeekProps {
  posts: ContentPost[]
}

export function ContentWeek({ posts }: ContentWeekProps) {
  if (posts.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">This Week&apos;s Content</h3>
        <div className="bg-bg-card rounded-xl border border-dashed border-border p-5 text-center">
          <p className="text-xs text-text-muted">No posts scheduled this week. <a href="/content" className="text-brand-accent hover:underline">Plan your content →</a></p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={fadeUp} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">This Week&apos;s Content</h3>
        <a href="/content" className="text-xs text-brand-accent hover:text-brand-accent-hover">View all →</a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {posts.map((post) => {
          const style = STATUS_STYLES[post.status]
          return (
            <a
              key={post.id}
              href={`/content?post=${post.id}`}
              className="block bg-bg-card rounded-xl border border-border p-4 hover:border-border-strong transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", style.bg, style.text)}>
                  {style.label}
                </span>
                {post.scheduled_date && (
                  <span className="text-xs text-text-muted">{formatDateShort(post.scheduled_date)}</span>
                )}
              </div>
              {post.hook && (
                <p className="text-xs text-text-primary line-clamp-2 leading-relaxed">{post.hook}</p>
              )}
              {post.pillar && (
                <p className="text-xs text-text-muted">{post.pillar}</p>
              )}
            </a>
          )
        })}
      </div>
    </motion.div>
  )
}
