const bdtFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
})

export function formatBDT(amount: number): string {
  return bdtFormatter.format(amount)
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

/** "12 Jun 2026" — unambiguous, no MM/DD vs DD/MM guessing. */
export function formatDate(date: string | Date): string {
  return dateFormatter.format(typeof date === "string" ? new Date(date) : date)
}

/** "2h 15m" from a minute count — drops the minutes segment when it's a whole number of hours. */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}
