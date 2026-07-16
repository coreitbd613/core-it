import { AcceptInviteView } from "./_components/accept-invite-view"

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <AcceptInviteView token={token} />
    </div>
  )
}
