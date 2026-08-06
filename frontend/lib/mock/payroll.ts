import { mockEmployees } from "./employees"

export type PayslipStatus = "PENDING" | "PAID"

export type Payslip = {
  id: string
  employeeId: string
  month: string
  basicSalaryBdt: number
  allowances: { label: string; amountBdt: number }[]
  deductions: { label: string; amountBdt: number }[]
  status: PayslipStatus
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export const payslipStatusLabels: Record<PayslipStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
}

export const payslipStatusVariant: Record<PayslipStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PAID: "default",
}

export function grossSalaryBdt(payslip: Pick<Payslip, "basicSalaryBdt" | "allowances">): number {
  return payslip.basicSalaryBdt + payslip.allowances.reduce((sum, item) => sum + item.amountBdt, 0)
}

export function netSalaryBdt(payslip: Pick<Payslip, "basicSalaryBdt" | "allowances" | "deductions">): number {
  const deductions = payslip.deductions.reduce((sum, item) => sum + item.amountBdt, 0)
  return grossSalaryBdt(payslip) - deductions
}

export function totalPayrollForMonth(payslips: Payslip[], month: string): number {
  return payslips.filter((payslip) => payslip.month === month).reduce((sum, payslip) => sum + netSalaryBdt(payslip), 0)
}

export function payslipsForEmployee(employeeId: string, payslips: Payslip[]): Payslip[] {
  return payslips
    .filter((payslip) => payslip.employeeId === employeeId)
    .sort((a, b) => b.month.localeCompare(a.month))
}

export function hasPayslipForMonth(employeeId: string, month: string, payslips: Payslip[]): boolean {
  return payslips.some((payslip) => payslip.employeeId === employeeId && payslip.month === month)
}

export function markPayslipPaid(payslip: Payslip): void {
  payslip.status = "PAID"
  payslip.paidAt = new Date().toISOString()
  payslip.updatedAt = new Date().toISOString()
}

function houseRentAllowance(basicSalaryBdt: number): number {
  return Math.round(basicSalaryBdt * 0.4)
}

function buildSeedPayroll(): Payslip[] {
  const months = ["2026-06", "2026-07", "2026-08"]
  const payslips: Payslip[] = []

  mockEmployees.forEach((employee) => {
    if (employee.status === "TERMINATED" || employee.employmentType === "INTERN") return
    months.forEach((month, monthIndex) => {
      const isCurrentMonth = monthIndex === months.length - 1
      const allowances = [{ label: "House rent", amountBdt: houseRentAllowance(employee.basicSalaryBdt) }]
      const deductions = [{ label: "Provident fund", amountBdt: Math.round(employee.basicSalaryBdt * 0.05) }]
      payslips.push({
        id: `payslip-${employee.id}-${month}`,
        employeeId: employee.id,
        month,
        basicSalaryBdt: employee.basicSalaryBdt,
        allowances,
        deductions,
        status: isCurrentMonth ? "PENDING" : "PAID",
        paidAt: isCurrentMonth ? null : `${month}-28T12:00:00`,
        createdAt: `${month}-01T09:00:00`,
        updatedAt: isCurrentMonth ? `${month}-01T09:00:00` : `${month}-28T12:00:00`,
      })
    })
  })

  return payslips
}

export const mockPayslips: Payslip[] = buildSeedPayroll()
