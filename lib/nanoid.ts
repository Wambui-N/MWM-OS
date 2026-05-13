export function nanoid(size = 10): string {
  return Math.random().toString(36).slice(2, 2 + size)
}
