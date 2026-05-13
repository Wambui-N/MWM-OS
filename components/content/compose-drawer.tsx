"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ContentPost, ContentStatus } from "@/types/database"
import { toast } from "sonner"

interface ComposeDrawerProps {
  post: ContentPost | null
  open: boolean
  onClose: () => void
  onSaved: (post: ContentPost) => void
}

const PILLARS = ["Automation", "Behind the Scenes", "Client Win", "Education", "Personal"]

export function ComposeDrawer({ post, open, onClose, onSaved }: ComposeDrawerProps) {
  const [form, setForm] = useState({
    hook: post?.hook ?? "",
    body: post?.body ?? "",
    pillar: post?.pillar ?? "",
    status: post?.status ?? "draft" as ContentStatus,
    scheduled_date: post?.scheduled_date ?? "",
  })
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = post ? `/api/content/${post.id}` : "/api/content"
      const method = post ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const { post: saved } = await res.json()
      toast.success(post ? "Post updated!" : "Post created!")
      onSaved(saved)
      onClose()
    } catch {
      toast.error("Couldn't save post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-bg-card">
        <SheetHeader>
          <SheetTitle style={{ fontFamily: "var(--font-display)" }} className="text-2xl">
            {post ? "Edit Post" : "New Post"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Hook */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Hook</label>
            <textarea
              value={form.hook}
              onChange={(e) => update("hook", e.target.value)}
              placeholder="The first line that makes them stop scrolling..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent resize-none"
            />
          </div>

          {/* Body with preview toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-muted">Body</label>
              <button
                onClick={() => setPreview(!preview)}
                className="text-xs text-brand-accent hover:text-brand-accent-hover"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="px-3 py-2.5 rounded-lg bg-bg-subtle text-sm text-text-primary whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {form.body || <span className="text-text-muted">Nothing to preview</span>}
              </div>
            ) : (
              <textarea
                value={form.body}
                onChange={(e) => update("body", e.target.value)}
                placeholder="Write your full post here..."
                rows={8}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent resize-none"
              />
            )}
          </div>

          {/* Pillar + status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Pillar</label>
              <select
                value={form.pillar}
                onChange={(e) => update("pillar", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
              >
                <option value="">Select...</option>
                {PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
              </select>
            </div>
          </div>

          {/* Scheduled date */}
          {form.status !== "draft" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Scheduled Date</label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={(e) => update("scheduled_date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
              />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-brand-accent text-white font-medium text-sm hover:bg-brand-accent-hover transition-colors disabled:opacity-60 mt-4"
          >
            {saving ? "Saving..." : post ? "Update Post" : "Create Post"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
