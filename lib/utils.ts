import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "KSh") {
  return `${currency} ${amount.toLocaleString()}`
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(date))
}

export function todayISODate() {
  return new Date().toISOString().split("T")[0]
}

export function daysBetween(from: string | Date, to: string | Date) {
  const a = new Date(from)
  const b = new Date(to)
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function isToday(date: string | Date) {
  return new Date(date).toDateString() === new Date().toDateString()
}

export function isMonday() {
  return new Date().getDay() === 1
}
