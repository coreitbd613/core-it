import { ProfileForm } from "@/components/shared/profile/profile-form"
import { findEmployeeById } from "@/lib/mock/employees"

import { AttendanceOverview } from "./_components/attendance-overview"
import { EmployeeQuickInfoCard } from "./_components/employee-quick-info-card"

// Mock-phase stand-in for "the employee record matching the logged-in admin user" —
// same pattern as CURRENT_ORG_ID elsewhere (e.g. app/(client)/portal/layout.tsx) until
// a real backend links auth users to Employee records.
const CURRENT_EMPLOYEE_ID = "emp-6"

export default function AdminProfilePage() {
  const employee = findEmployeeById(CURRENT_EMPLOYEE_ID)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      {employee && (
        <>
          <EmployeeQuickInfoCard employee={employee} />
          <AttendanceOverview employee={employee} />
        </>
      )}

      <ProfileForm scope="admin" />
    </div>
  )
}
