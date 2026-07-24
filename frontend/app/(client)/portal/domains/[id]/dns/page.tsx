import { DnsRecordsView } from "@/app/(public)/domains/[id]/dns/_components/dns-records-view"

export default async function PortalDnsRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DnsRecordsView domainId={id} basePath="/portal/domains" />
}
