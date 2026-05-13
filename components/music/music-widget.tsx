"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Music2, ChevronDown, Plus, Trash2, X } from "lucide-react"
import { SpotifyEmbed } from "./spotify-embed"
import { YouTubeEmbed } from "./youtube-embed"
import { useUIStore } from "@/stores/ui"
import type { SavedStation, MusicSource } from "@/types/database"
import { toast } from "sonner"

// Animated equaliser bars shown in the collapsed pill
function MusicBars() {
  return (
    <div className="flex items-end gap-px h-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[3px] bg-brand-accent rounded-full"
          style={{
            animation: "musicBar 0.8s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
            height: "100%",
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  )
}

/**
 * Creates a silent AudioContext after the first user click, then keeps it
 * resumed whenever the tab becomes hidden. This tells the browser the page
 * has active audio, preventing background-tab throttling that would pause
 * the embedded iframes.
 */
function useKeepAliveAudio() {
  useEffect(() => {
    let ctx: AudioContext | null = null

    function init() {
      if (ctx) return
      try {
        ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        // Play a 1-frame silent buffer — enough to mark the context as running
        const buf = ctx.createBuffer(1, 1, 22050)
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.connect(ctx.destination)
        src.start(0)
      } catch {
        // AudioContext blocked or unsupported — silently ignore
      }
    }

    function handleVisibility() {
      init()
      if (ctx && ctx.state === "suspended") ctx.resume()
    }

    // Initialise after first interaction so autoplay policy is satisfied
    document.addEventListener("click", init, { once: true })
    // Re-resume whenever the tab is hidden
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      document.removeEventListener("click", init)
      document.removeEventListener("visibilitychange", handleVisibility)
      ctx?.close()
    }
  }, [])
}

export function MusicWidget() {
  const { currentStation, setStation, musicCollapsed, toggleMusicCollapsed } = useUIStore()
  const [stations, setStations] = useState<SavedStation[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSource, setNewSource] = useState<MusicSource>("spotify")
  const [newUrl, setNewUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useKeepAliveAudio()

  useEffect(() => {
    fetch("/api/music/stations")
      .then((r) => r.json())
      .then((j) => {
        const list: SavedStation[] = j.stations ?? []
        setStations(list)
        if (!currentStation && list.length > 0) {
          setStation(list.find((s) => s.is_default) ?? list[0])
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
    const remaining = stations.filter((s) => s.id !== id)
    setStations(remaining)
    if (currentStation?.id === id) setStation(remaining[0] ?? null)
  }

  const isOpen = !musicCollapsed

  return (
    /*
     * One draggable Framer Motion container holds both the expanded card and
     * the collapsed pill. Dragging moves both together, so the position is
     * always consistent.
     */
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ top: -800, left: -1400, right: 0, bottom: 0 }}
      whileDrag={{ cursor: "grabbing" }}
      className="fixed z-50 cursor-grab"
      style={{ bottom: 24, right: 272 }}
    >
      {/* ── Expanded card — always mounted, slides off-screen when collapsed ── */}
      <div
        style={{
          width: 288,
          transform: isOpen ? "translateX(0)" : "translateX(calc(100% + 320px))",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.2s ease",
        }}
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
            title="Collapse"
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

        {/*
         * Embed — never conditionally rendered once mounted.
         * Switching stations changes the iframe `src` which reloads it,
         * but collapsing the widget does NOT unmount it.
         */}
        {currentStation && (
          <div>
            {currentStation.source === "spotify" ? (
              <SpotifyEmbed url={currentStation.url} />
            ) : (
              <YouTubeEmbed url={currentStation.url} />
            )}
          </div>
        )}

        {/* Add station form */}
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
              placeholder={
                newSource === "spotify" ? "https://open.spotify.com/..." : "https://youtube.com/..."
              }
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
      </div>

      {/* ── Collapsed pill — same drag container, fades in over the card's anchor ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        <button
          onClick={toggleMusicCollapsed}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-bg-card border border-border shadow-lg text-xs font-medium text-text-primary hover:border-brand-accent transition-colors whitespace-nowrap"
        >
          <MusicBars />
          <span className="truncate max-w-[140px]">{currentStation?.name ?? "Music"}</span>
        </button>
      </div>
    </motion.div>
  )
}
