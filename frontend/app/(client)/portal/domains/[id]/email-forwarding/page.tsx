import { EmailForwardingView } from "@/app/(public)/domains/[id]/email-forwarding/_components/email-forwarding-view"

export default async function PortalEmailForwardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EmailForwardingView domainId={id} basePath="/portal/domains" />
}
