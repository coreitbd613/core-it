"use client"

import {
  BriefcaseIcon,
  CalendarDaysIcon,
  IdCardIcon,
  PhoneIcon,
  UserCheckIcon,
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"

import { InfoChip } from "@/components/shared/info-chip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  employeeStatusLabels,
  employmentTypeLabels,
  mockEmployees,
  reportingManagerOf,
  type Employee,
  type EmployeeStatus,
} from "@/lib/mock/employees"

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`
}

// WhatsApp's brand green — a fixed third-party brand color, not a Core IT
// design token (same literal used in whatsapp-floating-button.tsx, site-footer.tsx).
const WHATSAPP_GREEN = "#25D366"

const STATUS_DOT: Record<EmployeeStatus, string> = {
  ACTIVE: "bg-emerald-500",
  ON_LEAVE: "bg-amber-500",
  TERMINATED: "bg-destructive",
}

function tenureLabel(joinDate: string): string {
  const start = new Date(joinDate)
  const now = new Date()
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (now.getDate() < start.getDate()) months -= 1
  months = Math.max(0, months)
  const years = Math.floor(months / 12)
  const remainder = months % 12
  if (years === 0) return `${remainder} mo`
  if (remainder === 0) return `${years} yr`
  return `${years} yr ${remainder} mo`
}

export function EmployeeQuickInfoCard({ employee }: { employee: Employee }) {
  const manager = reportingManagerOf(employee, mockEmployees)

  return (
    <Card className="overflow-hidden pt-0">
      <div className="h-2 bg-gradient-to-r from-primary via-orange-400 to-blue-500" />
      <CardContent className="flex flex-col gap-6 pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
              {employee.photoUrl && <AvatarImage src={employee.photoUrl} alt={employee.name} />}
              <AvatarFallback className="bg-gradient-to-br from-primary to-orange-600 text-lg font-semibold text-white">
                {employee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-foreground">{employee.name}</p>
                <span className="flex items-center gap-1.5 rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  <span className={cn("size-1.5 rounded-full", STATUS_DOT[employee.status])} />
                  {employeeStatusLabels[employee.status]}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {employee.designation} · {employee.employeeCode}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${employee.phone}`}>
                <PhoneIcon />
                Call
              </a>
            </Button>
            <Button size="sm" className="text-white" style={{ backgroundColor: WHATSAPP_GREEN }} asChild>
              <a href={waLink(employee.phone)} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoChip
            icon={BriefcaseIcon}
            iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            label="Department"
            value={employee.department}
          />
          <InfoChip
            icon={CalendarDaysIcon}
            iconClassName="bg-primary/10 text-primary"
            label="Tenure"
            value={tenureLabel(employee.joinDate)}
          />
          <InfoChip
            icon={UserCheckIcon}
            iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            label="Reports to"
            value={manager ? manager.name : "—"}
            href={manager ? `/admin/employees/${manager.id}` : undefined}
          />
          <InfoChip
            icon={IdCardIcon}
            iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            label="Employment"
            value={employmentTypeLabels[employee.employmentType]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
