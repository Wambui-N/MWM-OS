"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music2, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react"
import { SpotifyEmbed } from "./spotify-embed"
import { YouTubeEmbed } from "./youtube-embed"
import { useUIStore } from "@/stores/ui"
import type { SavedStation, MusicSource } from "@/types/database"
import { toast } from "sonner"

export function MusicWidget() {
  const { currentStation, setStation, musicCollapsed, toggleMusicCollapsed } = useUIStore()
  const [stations, setStations] = useState<SavedStation[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSource, setNewSource] = useState<MusicSource>("spotify")
  const [newUrl, setNewUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/music/stations")
      .then((r) => r.json())
      .then((j) => {
        const list: SavedStation[] = j.stations ?? []
        setStations(list)
        // Auto-select default or first station if nothing is selected
        if (!currentStation && list.length > 0) {
          const def = list.find((s) => s.is_default) ?? list[0]
          setStation(def)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function addStation() {
    if (!newName.trim() || !newUrl.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/music/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), source: newSource, url: newUrl.trim() }),
      })
      if (!res.ok) throw new Error()
      const { station } = await res.json()
      setStations((p) => [...p, station])
      setStation(station)
      setNewName("")
      setNewUrl("")
      setShowAddForm(false)
      toast.success(`"${station.name}" saved.`)
    } catch {
      toast.error("Couldn't save station.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteStation(id: string) {
    await fetch(`/api/music/stations/${id}`, { method: "DELETE" }).catch(() => {})
    setStations((p) => p.filter((s) => s.id !== id))
    if (currentStation?.id === id) {
      const next = stations.find((s) => s.id !== id)
      setStation(next ?? null)
    }
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ top: -600, left: -1200, right: 0, bottom: 0 }}
      className="fixed bottom-6 right-68 z-50 cursor-grab active:cursor-grabbing w-72"
      whileDrag={{ scale: 1.02 }}
    >
      <AnimatePresence mode="wait">
        {musicCollapsed ? (
          /* Collapsed pill */
          <motion.button
            key="pill"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={toggleMusicCollapsed}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-bg-card border border-border shadow-lg text-sm font-medium text-text-primary hover:border-brand-accent transition-colors"
          >
            <Music2 size={14} className="text-brand-accent" />
            <span className="truncate max-w-[150px] text-xs">
              {currentStation?.name ?? "Music"}
            </span>
            <ChevronUp size={14} className="text-text-muted shrink-0" />
          </motion.button>
        ) : (
          /* Expanded card */
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-bg-card rounded-2xl border border-border shadow-xl p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music2 size={14} className="text-brand-accent" />
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Music</span>
              </div>
              <button
                onClick={toggleMusicCollapsed}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Station picker */}
            {stations.length > 0 && (
              <div className="space-y-1">
                {stations.map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5 group">
                    <button
                      onClick={() => setStation(s)}
                      className={`flex-1 text-left text-xs px-3 py-1.5 rounded-lg border transition-colors truncate ${
                        currentStation?.id === s.id
                          ? "border-brand-accent bg-brand-accent/10 text-brand-accent font-medium"
                          : "border-border text-text-muted hover:border-border-strong hover:text-text-primary"
                      }`}
                    >
                      {s.source === "spotify" ? "🎵" : "▶"} {s.name}
                    </button>
                    <button
                      onClick={() => deleteStation(s.id)}
                      className="shrink-0 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-1 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Embed player */}
            {currentStation && (
              <div>
                {currentStation.source === "spotify" ? (
                  <SpotifyEmbed url={currentStation.url} />
                ) : (
                  <YouTubeEmbed url={currentStation.url} />
                )}
              </div>
            )}

            {/* Add station */}
            {showAddForm ? (
              <div className="space-y-2 pt-1 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-primary">New station</span>
                  <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-text-primary">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-border text-xs">
                  {(["spotify", "youtube"] as MusicSource[]).map((src) => (
                    <button
                      key={src}
                      onClick={() => setNewSource(src)}
                      className={`flex-1 py-1.5 capitalize transition-colors ${
                        newSource === src ? "bg-brand-accent text-white" : "text-text-muted hover:bg-bg-subtle"
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name (e.g. Deep Focus)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-bg-subtle text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent"
                />
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStation()}
                  placeholder={newSource === "spotify" ? "https://open.spotify.com/..." : "https://youtube.com/..."}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-bg-subtle text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent"
                />
                <button
                  onClick={addStation}
                  disabled={saving || !newName.trim() || !newUrl.trim()}
                  className="w-full py-2 rounded-lg bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Station"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 w-full text-xs text-text-muted hover:text-text-primary transition-colors py-1"
              >
                <Plus size={12} />
                Add station
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
