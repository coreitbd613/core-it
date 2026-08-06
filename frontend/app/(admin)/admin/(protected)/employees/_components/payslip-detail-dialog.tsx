"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatBDT } from "@/lib/format"
import { grossSalaryBdt, netSalaryBdt, payslipStatusLabels, type Payslip } from "@/lib/mock/payroll"

export function PayslipDetailDialog({
  payslip,
  onOpenChange,
}: {
  payslip: Payslip | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={payslip !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {payslip && (
          <>
            <DialogHeader>
              <DialogTitle>Payslip — {payslip.month}</DialogTitle>
              <DialogDescription>{payslipStatusLabels[payslip.status]}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Basic salary</span>
                <span className="tabular-nums text-foreground">{formatBDT(payslip.basicSalaryBdt)}</span>
              </div>
              {payslip.allowances.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="tabular-nums text-foreground">+{formatBDT(item.amountBdt)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-2 text-sm font-medium">
                <span className="text-foreground">Gross</span>
                <span className="tabular-nums text-foreground">{formatBDT(grossSalaryBdt(payslip))}</span>
              </div>
              {payslip.deductions.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="tabular-nums text-destructive">-{formatBDT(item.amountBdt)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                <span className="text-foreground">Net pay</span>
                <span className="tabular-nums text-foreground">{formatBDT(netSalaryBdt(payslip))}</span>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
