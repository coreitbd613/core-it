import { SiteHeader } from "@/app/_components/site-header"

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">{children}</main>
    </>
  )
}
