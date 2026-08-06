"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { PhoneNumberInput } from "@/components/shared/phone-number-input"
import {
  DEPARTMENTS,
  DESIGNATIONS,
  employeeStatusLabels,
  employmentTypeLabels,
  mockEmployees,
  nextEmployeeCode,
  type Department,
  type Designation,
  type Employee,
  type EmployeeStatus,
  type EmploymentType,
  type Gender,
} from "@/lib/mock/employees"

export function EmployeeForm({
  mode,
  employee,
}:
  | {
      mode: "create"
      employee?: undefined
    }
  | {
      mode: "edit"
      employee: Employee
    }) {
  const router = useRouter()
  const [name, setName] = React.useState(employee?.name ?? "")
  const [email, setEmail] = React.useState(employee?.email ?? "")
  const [phone, setPhone] = React.useState(employee?.phone ?? "")
  const [department, setDepartment] = React.useState<Department>(employee?.department ?? "Engineering")
  const [designation, setDesignation] = React.useState<Designation>(
    employee?.designation ?? "Software Engineer"
  )
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>(
    employee?.employmentType ?? "FULL_TIME"
  )
  const [status, setStatus] = React.useState<EmployeeStatus>(employee?.status ?? "ACTIVE")
  const [joinDate, setJoinDate] = React.useState(employee?.joinDate ?? "")
  const [reportingManagerId, setReportingManagerId] = React.useState(
    employee?.reportingManagerId ?? "none"
  )
  const [dateOfBirth, setDateOfBirth] = React.useState(employee?.dateOfBirth ?? "")
  const [gender, setGender] = React.useState(employee?.gender ?? "unspecified")
  const [address, setAddress] = React.useState(employee?.address ?? "")
  const [emergencyName, setEmergencyName] = React.useState(employee?.emergencyContact?.name ?? "")
  const [emergencyRelation, setEmergencyRelation] = React.useState(
    employee?.emergencyContact?.relation ?? ""
  )
  const [emergencyPhone, setEmergencyPhone] = React.useState(employee?.emergencyContact?.phone ?? "")
  const [bankName, setBankName] = React.useState(employee?.bankInfo?.bankName ?? "")
  const [accountNumber, setAccountNumber] = React.useState(employee?.bankInfo?.accountNumber ?? "")
  const [branchName, setBranchName] = React.useState(employee?.bankInfo?.branchName ?? "")
  const [basicSalaryBdt, setBasicSalaryBdt] = React.useState(employee?.basicSalaryBdt ?? 0)

  const managerOptions = mockEmployees.filter(
    (candidate) => candidate.status !== "TERMINATED" && candidate.id !== employee?.id
  )

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Enter the employee's name.")
      return
    }
    if (!email.trim()) {
      toast.error("Enter an email address.")
      return
    }

    const hasEmergencyContact = emergencyName.trim() || emergencyRelation.trim() || emergencyPhone.trim()
    const hasBankInfo = bankName.trim() || accountNumber.trim()

    const fields = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      designation,
      employmentType,
      joinDate,
      reportingManagerId: reportingManagerId === "none" ? null : reportingManagerId,
      dateOfBirth: dateOfBirth || null,
      gender: gender === "unspecified" ? null : (gender as Gender),
      address: address.trim() || null,
      emergencyContact: hasEmergencyContact
        ? { name: emergencyName.trim(), relation: emergencyRelation.trim(), phone: emergencyPhone.trim() }
        : null,
      bankInfo: hasBankInfo
        ? { bankName: bankName.trim(), accountNumber: accountNumber.trim(), branchName: branchName.trim() || null }
        : null,
      basicSalaryBdt,
    }

    if (mode === "edit") {
      Object.assign(employee!, fields, { status, updatedAt: new Date().toISOString() })
      toast.success("Employee updated.")
      router.push(`/admin/employees/${employee!.id}`)
      return
    }

    const id = crypto.randomUUID()
    mockEmployees.unshift({
      id,
      employeeCode: nextEmployeeCode(mockEmployees),
      photoUrl: null,
      status: "ACTIVE",
      terminationDate: null,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...fields,
    })

    toast.success("Employee added.")
    router.push(`/admin/employees/${id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{mode === "edit" ? "Edit employee" : "New employee"}</h1>
        <p className="text-muted-foreground">
          {mode === "edit" ? "Update this employee's details." : "Add a new team member."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic info</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="employee-name">Full name</FieldLabel>
                    <Input
                      id="employee-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="employee-email">Email</FieldLabel>
                    <Input
                      id="employee-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@coreitbd.com"
                    />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="employee-phone">Phone</FieldLabel>
                    <PhoneNumberInput id="employee-phone" value={phone} onChange={setPhone} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="employee-dob">Date of birth</FieldLabel>
                    <DatePickerField id="employee-dob" value={dateOfBirth} onChange={setDateOfBirth} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="employee-gender">Gender</FieldLabel>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="employee-gender" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unspecified">Unspecified</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="employee-address">Address</FieldLabel>
                    <Input
                      id="employee-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, road, area, city"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="employee-department">Department</FieldLabel>
                    <Select value={department} onValueChange={(v) => setDepartment(v as Department)}>
                      <SelectTrigger id="employee-department" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="employee-designation">Designation</FieldLabel>
                    <Select value={designation} onValueChange={(v) => setDesignation(v as Designation)}>
                      <SelectTrigger id="employee-designation" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGNATIONS.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="employee-type">Employment type</FieldLabel>
                    <Select
                      value={employmentType}
                      onValueChange={(v) => setEmploymentType(v as EmploymentType)}
                    >
                      <SelectTrigger id="employee-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(employmentTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="employee-join-date">Join date</FieldLabel>
                    <DatePickerField id="employee-join-date" value={joinDate} onChange={setJoinDate} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="employee-manager">Reporting manager</FieldLabel>
                    <Select value={reportingManagerId} onValueChange={setReportingManagerId}>
                      <SelectTrigger id="employee-manager" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {managerOptions.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {mode === "edit" && (
                    <Field>
                      <FieldLabel htmlFor="employee-status">Status</FieldLabel>
                      <Select value={status} onValueChange={(v) => setStatus(v as EmployeeStatus)}>
                        <SelectTrigger id="employee-status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(employeeStatusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency contact</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="employee-emergency-name">Name</FieldLabel>
                    <Input
                      id="employee-emergency-name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="employee-emergency-relation">Relation</FieldLabel>
                    <Input
                      id="employee-emergency-relation"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="Spouse, parent..."
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="employee-emergency-phone">Phone</FieldLabel>
                    <PhoneNumberInput
                      id="employee-emergency-phone"
                      value={emergencyPhone}
                      onChange={setEmergencyPhone}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Salary & bank details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="employee-salary">Basic salary (BDT / month)</FieldLabel>
                  <Input
                    id="employee-salary"
                    type="number"
                    min={0}
                    value={basicSalaryBdt || ""}
                    onChange={(e) => setBasicSalaryBdt(Number(e.target.value) || 0)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="employee-bank">Bank name</FieldLabel>
                  <Input id="employee-bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="employee-account">Account number</FieldLabel>
                  <Input
                    id="employee-account"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="employee-branch">Branch</FieldLabel>
                  <Input
                    id="employee-branch"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="border-t">
              <Button className="w-full" onClick={handleSubmit}>
                {mode === "edit" ? "Save changes" : "Add employee"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
