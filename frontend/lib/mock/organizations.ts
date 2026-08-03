export type MockOrganization = {
  id: string
  name: string
  /** Contact person who owns/manages this company's portal account. */
  contactName: string
}

export const mockOrganizations: MockOrganization[] = [
  { id: "org-1", name: "Acme Corp", contactName: "Rahim Uddin" },
  { id: "org-2", name: "Bay Traders Ltd", contactName: "Karim Hossain" },
]
