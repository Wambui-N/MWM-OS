import { differenceInMinutes } from "date-fns"

export type MomentumEventType =
  | "pomodoro_complete"
  | "task_done"
  | "tick_done"
  | "post_published"
  | "pipeline_updated"

export interface MomentumEvent {
  type: MomentumEventType
  at: Date
}

const BOOSTS: Record<MomentumEventType, number> = {
  pomodoro_complete: 25,
  task_done: 10,
  tick_done: 5,
  post_published: 15,
  pipeline_updated: 8,
}

export function recalculateMomentum(
  current: number,
  events: MomentumEvent[],
  lastUpdate: Date
): number {
  const minutesSinceUpdate = differenceInMinutes(new Date(), lastUpdate)
  let score = current - minutesSinceUpdate * 2

  for (const event of events) {
    score += BOOSTS[event.type] ?? 0
  }

  return Math.max(0, Math.min(100, score))
}
