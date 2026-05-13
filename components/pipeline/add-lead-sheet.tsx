"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Client, ServiceType } from "@/types/database"
import { toast } from "sonner"

interface AddLeadSheetProps {
  open: boolean
  onClose: () => void
  onAdded: (client: Client) => void
}

export function AddLeadSheet({ open, onClose, onAdded }: AddLeadSheetProps) {
  const [form, setForm] = useState({
    name: "", company: "", email: "",
    service_type: "" as ServiceType | "",
    value_ksh: "", source: "", next_action: "",
  })
  const [saving, setSaving] = useState(false)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error("Name is required")
    setSaving(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value_ksh: form.value_ksh ? Number(form.value_ksh) : null,
          service_type: form.service_type || null,
        }),
      })
      if (!res.ok) throw new Error()
      const { client } = await res.json()
      toast.success(`${form.name} added to pipeline.`)
      onAdded(client)
      setForm({ name: "", company: "", email: "", service_type: "", value_ksh: "", source: "", next_action: "" })
      onClose()
    } catch {
      toast.error("Couldn't add lead.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-bg-card">
        <SheetHeader>
          <SheetTitle style={{ fontFamily: "var(--font-display)" }} className="text-2xl">
            Add New Lead
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {[
            { label: "Name *", field: "name", placeholder: "Jane Smith" },
            { label: "Company", field: "company", placeholder: "Acme Corp" },
            { label: "Email", field: "email", placeholder: "jane@acme.com", type: "email" },
            { label: "Source", field: "source", placeholder: "Referral, LinkedIn..." },
            { label: "Est. Value (KSh)", field: "value_ksh", placeholder: "50000", type: "number" },
          ].map(({ label, field, placeholder, type }) => (
            <div key={field} className="space-y-1">
              <label className="text-xs font-medium text-text-muted">{label}</label>
              <input
                type={type ?? "text"}
                value={(form as any)[field]}
                onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Service Type</label>
            <select
              value={form.service_type}
              onChange={(e) => update("service_type", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent transition-colors"
            >
              <option value="">Select...</option>
              <option value="automation">Automation</option>
              <option value="web">Web</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">First Next Action</label>
            <textarea
              value={form.next_action}
              onChange={(e) => update("next_action", e.target.value)}
              placeholder="Send intro email, schedule call..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-brand-accent text-white font-medium text-sm hover:bg-brand-accent-hover transition-colors disabled:opacity-60 mt-4"
          >
            {saving ? "Adding..." : "Add to Pipeline"}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
