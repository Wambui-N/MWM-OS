import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { awardXP } from "@/lib/xp"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount } = await req.json()
  if (!amount || amount <= 0) return NextResponse.json({ ok: true })

  const awarded = await awardXP(amount)
  return NextResponse.json({ ok: true, awarded })
}
