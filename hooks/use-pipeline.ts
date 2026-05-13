import { useState, useEffect } from "react"
import type { Client } from "@/types/database"

export function usePipeline() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(({ clients }) => setClients(clients ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function updateClient(id: string, updates: Partial<Client>) {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const { client } = await res.json()
    setClients((prev) => prev.map((c) => (c.id === id ? client : c)))
    return client
  }

  return { clients, loading, setClients, updateClient }
}
