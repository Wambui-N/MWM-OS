"use client"

interface SessionDotsProps {
  completed: number
  total: number
}

export function SessionDots({ completed, total }: SessionDotsProps) {
  if (total === 0) return null
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-colors duration-300"
          style={{
            backgroundColor: i < completed ? "var(--accent)" : "var(--border-strong)",
          }}
        />
      ))}
    </div>
  )
}
