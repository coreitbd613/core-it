const bdtFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
})

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatBDT(amount: number): string {
  return bdtFormatter.format(amount)
}

export function formatUSD(amount: number): string {
  return usdFormatter.format(amount)
}
