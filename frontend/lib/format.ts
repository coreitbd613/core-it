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
  month: "2-digit",
  year: "numeric",
})

/** DD-MM-YYYY — dash-separated, not the locale-default "/". */
export function formatDate(date: string | Date): string {
  return dateFormatter.format(typeof date === "string" ? new Date(date) : date).replace(/\//g, "-")
}
