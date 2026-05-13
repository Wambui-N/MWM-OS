import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { triggerMake } from "@/lib/make-webhooks"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const result = await triggerMake("MAKE_WEBHOOK_CONTENT", body)
  return NextResponse.json({ ok: true, result })
}
