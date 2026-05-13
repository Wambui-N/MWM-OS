import { useState, useEffect } from "react"
import type { ContentPost } from "@/types/database"

export function useContent() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(({ posts }) => setPosts(posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function updatePost(id: string, updates: Partial<ContentPost>) {
    const res = await fetch(`/api/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const { post } = await res.json()
    setPosts((prev) => prev.map((p) => (p.id === id ? post : p)))
    return post
  }

  return { posts, loading, setPosts, updatePost }
}
