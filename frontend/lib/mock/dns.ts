export type DnsRecordType = "A" | "CNAME" | "TXT" | "MX"

export type DnsRecord = {
  id: string
  type: DnsRecordType
  host: string
  value: string
  ttl: number
  priority?: number
}

export type EmailForwardingRule = {
  id: string
  fromAddress: string
  toAddress: string
}

const dnsStore = new Map<string, DnsRecord[]>()
const forwardingStore = new Map<string, EmailForwardingRule[]>()

function defaultDnsRecords(): DnsRecord[] {
  return [
    { id: crypto.randomUUID(), type: "A", host: "@", value: "203.0.113.10", ttl: 3600 },
    { id: crypto.randomUUID(), type: "CNAME", host: "www", value: "@", ttl: 3600 },
    { id: crypto.randomUUID(), type: "TXT", host: "@", value: "v=spf1 include:_spf.resend.com ~all", ttl: 3600 },
  ]
}

export function getDnsRecords(domainId: string): DnsRecord[] {
  if (!dnsStore.has(domainId)) {
    dnsStore.set(domainId, defaultDnsRecords())
  }
  return dnsStore.get(domainId)!
}

export function addDnsRecord(domainId: string, record: Omit<DnsRecord, "id">) {
  const records = getDnsRecords(domainId)
  records.push({ ...record, id: crypto.randomUUID() })
}

export function removeDnsRecord(domainId: string, recordId: string) {
  const records = getDnsRecords(domainId)
  const index = records.findIndex((r) => r.id === recordId)
  if (index !== -1) records.splice(index, 1)
}

export function getForwardingRules(domainId: string): EmailForwardingRule[] {
  if (!forwardingStore.has(domainId)) {
    forwardingStore.set(domainId, [])
  }
  return forwardingStore.get(domainId)!
}

export function addForwardingRule(domainId: string, rule: Omit<EmailForwardingRule, "id">) {
  const rules = getForwardingRules(domainId)
  rules.push({ ...rule, id: crypto.randomUUID() })
}

export function removeForwardingRule(domainId: string, ruleId: string) {
  const rules = getForwardingRules(domainId)
  const index = rules.findIndex((r) => r.id === ruleId)
  if (index !== -1) rules.splice(index, 1)
}
