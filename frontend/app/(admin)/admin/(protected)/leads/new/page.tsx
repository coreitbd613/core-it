"use client"

import { useAdminAuth } from "@/contexts/admin-auth-context"

import { LeadForm } from "../_components/lead-form"

export default function NewLeadPage() {
  const { user } = useAdminAuth()
  return <LeadForm mode="create" authorName={user?.name ?? "Core IT"} />
}
