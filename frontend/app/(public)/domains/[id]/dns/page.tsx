import { DnsRecordsView } from "./_components/dns-records-view"

export default async function DnsRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DnsRecordsView domainId={id} />
}
