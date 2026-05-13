"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.ok) {
      router.push("/dashboard")
    } else {
      setError("Incorrect username or password.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-accent text-white text-2xl font-bold mb-2">
            ✳
          </div>
          <h1
            className="text-4xl font-semibold text-text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Made With Make
          </h1>
          <p className="text-sm text-text-muted">
            Your personal business operating system
          </p>
        </div>

        {/* Sign-in form */}
        <div className="bg-bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              Welcome back, Wambui.
            </h2>
            <p className="text-sm text-text-muted">
              Sign in to access your OS.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors"
                placeholder="your username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-danger font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-accent text-white font-medium text-sm hover:bg-brand-accent-hover transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
