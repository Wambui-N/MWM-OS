type WebhookKey =
  | "MAKE_WEBHOOK_SCHEDULE"
  | "MAKE_WEBHOOK_ONBOARDING"
  | "MAKE_WEBHOOK_PROPOSAL"
  | "MAKE_WEBHOOK_CONTENT"

export async function triggerMake(webhook: WebhookKey, payload: object) {
  const url = process.env[webhook]
  if (!url) {
    console.warn(`[Make] Webhook ${webhook} not configured — skipping.`)
    return null
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error(`[Make] ${webhook} responded ${res.status}`)
      return null
    }
    return res.json().catch(() => null)
  } catch (err) {
    console.error(`[Make] ${webhook} failed:`, err)
    return null
  }
}
