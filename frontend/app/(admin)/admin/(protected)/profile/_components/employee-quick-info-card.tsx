"use client"

import Link from "next/link"
import { PhoneIcon } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import {
  employeeStatusLabels,
  employmentTypeLabels,
  mockEmployees,
  reportingManagerOf,
  type Employee,
} from "@/lib/mock/employees"

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`
}

// WhatsApp's brand green — a fixed third-party brand color, not a Core IT
// design token (same literal used in whatsapp-floating-button.tsx, site-footer.tsx).
const WHATSAPP_GREEN = "#25D366"

export function EmployeeQuickInfoCard({ employee }: { employee: Employee }) {
  const manager = reportingManagerOf(employee, mockEmployees)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">
                {employee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Badge>{employeeStatusLabels[employee.status]}</Badge>
                <Badge variant="secondary">Employee</Badge>
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">{employee.name}</p>
              <p className="text-sm text-muted-foreground">
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

        <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Reports to</p>
            {manager ? (
              <>
                <Link href={`/admin/employees/${manager.id}`} className="text-sm text-foreground hover:underline">
                  {manager.name}
                </Link>
                <p className="text-xs text-muted-foreground">{manager.designation}</p>
              </>
            ) : (
              <p className="text-sm text-foreground">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Employment</p>
            <p className="text-sm text-foreground">{employmentTypeLabels[employee.employmentType]}</p>
            <p className="text-xs text-muted-foreground">
              {employee.department} · {employee.designation}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-sm text-foreground">{formatDate(employee.joinDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
