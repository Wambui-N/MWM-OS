import confetti from "canvas-confetti"

export function triggerConfetti() {
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
}

export function triggerBossWin() {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#E5401A", "#F7F4EF", "#1A1A0F"],
    })
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#E5401A", "#F7F4EF", "#1A1A0F"],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

export function triggerRevenueGoal() {
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.5 },
    colors: ["#E5401A", "#F7F4EF", "#FFD700"],
  })
}
