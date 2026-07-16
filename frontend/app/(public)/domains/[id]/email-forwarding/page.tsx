import { EmailForwardingView } from "./_components/email-forwarding-view"

export default async function EmailForwardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EmailForwardingView domainId={id} />
}
