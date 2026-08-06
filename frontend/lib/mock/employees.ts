export const DEPARTMENTS = [
  "Engineering",
  "QA",
  "DevOps",
  "Design",
  "Product",
  "HR",
  "Sales",
  "Marketing",
  "Finance",
  "Management",
] as const
export type Department = (typeof DEPARTMENTS)[number]

export const DESIGNATIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Tech Lead",
  "QA Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "HR Executive",
  "HR Manager",
  "Sales Executive",
  "Marketing Executive",
  "Finance Executive",
  "Accountant",
  "CTO",
  "CEO",
] as const
export type Designation = (typeof DESIGNATIONS)[number]

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN"
export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "TERMINATED"
export type Gender = "MALE" | "FEMALE" | "OTHER"
export type EmployeeDocumentType = "NID" | "RESUME" | "CONTRACT" | "CERTIFICATE" | "OTHER"

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERN: "Intern",
}

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On leave",
  TERMINATED: "Terminated",
}

export const employeeStatusVariant: Record<
  EmployeeStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  ACTIVE: "default",
  ON_LEAVE: "secondary",
  TERMINATED: "destructive",
}

export const employeeDocumentTypeLabels: Record<EmployeeDocumentType, string> = {
  NID: "NID",
  RESUME: "Resume",
  CONTRACT: "Contract",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
}

export type EmployeeDocument = {
  id: string
  type: EmployeeDocumentType
  fileName: string
  uploadedAt: string
}

export type Employee = {
  id: string
  employeeCode: string
  name: string
  photoUrl: string | null
  email: string
  phone: string
  department: Department
  designation: Designation
  employmentType: EmploymentType
  status: EmployeeStatus
  joinDate: string
  terminationDate: string | null
  reportingManagerId: string | null
  dateOfBirth: string | null
  gender: Gender | null
  address: string | null
  emergencyContact: { name: string; relation: string; phone: string } | null
  bankInfo: { bankName: string; accountNumber: string; branchName: string | null } | null
  basicSalaryBdt: number
  documents: EmployeeDocument[]
  createdAt: string
  updatedAt: string
}

export function findEmployeeById(id: string): Employee | undefined {
  return mockEmployees.find((employee) => employee.id === id)
}

export function activeEmployees(employees: Employee[]): Employee[] {
  return employees.filter((employee) => employee.status !== "TERMINATED")
}

export function headcountByDepartment(employees: Employee[]): Record<string, number> {
  return activeEmployees(employees).reduce<Record<string, number>>((counts, employee) => {
    counts[employee.department] = (counts[employee.department] ?? 0) + 1
    return counts
  }, {})
}

export function reportingManagerOf(
  employee: Pick<Employee, "reportingManagerId">,
  employees: Employee[]
): Employee | undefined {
  if (!employee.reportingManagerId) return undefined
  return employees.find((candidate) => candidate.id === employee.reportingManagerId)
}

export function nextEmployeeCode(employees: Employee[]): string {
  const max = employees.reduce((highest, employee) => {
    const num = Number(employee.employeeCode.replace("EMP-", ""))
    return Number.isFinite(num) && num > highest ? num : highest
  }, 0)
  return `EMP-${String(max + 1).padStart(4, "0")}`
}

export function addEmployeeDocument(
  employee: Employee,
  type: EmployeeDocumentType,
  fileName: string
): void {
  employee.documents.unshift({
    id: crypto.randomUUID(),
    type,
    fileName,
    uploadedAt: new Date().toISOString(),
  })
  employee.updatedAt = new Date().toISOString()
}

export function removeEmployeeDocument(employee: Employee, documentId: string): void {
  employee.documents = employee.documents.filter((doc) => doc.id !== documentId)
  employee.updatedAt = new Date().toISOString()
}

export const mockEmployees: Employee[] = [
  {
    id: "emp-1",
    employeeCode: "EMP-0001",
    name: "Nazrul Islam",
    photoUrl: null,
    email: "nazrul@coreitbd.com",
    phone: "+880 1711-100001",
    department: "Management",
    designation: "CEO",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2022-01-10",
    terminationDate: null,
    reportingManagerId: null,
    dateOfBirth: "1985-03-14",
    gender: "MALE",
    address: "House 12, Road 5, Banani, Dhaka",
    emergencyContact: { name: "Shirin Islam", relation: "Spouse", phone: "+880 1811-900001" },
    bankInfo: { bankName: "BRAC Bank", accountNumber: "1520304050", branchName: "Gulshan" },
    basicSalaryBdt: 250000,
    documents: [
      { id: "doc-1-1", type: "NID", fileName: "nazrul-nid.pdf", uploadedAt: "2022-01-10T09:00:00" },
    ],
    createdAt: "2022-01-10T09:00:00",
    updatedAt: "2022-01-10T09:00:00",
  },
  {
    id: "emp-2",
    employeeCode: "EMP-0002",
    name: "Farhana Kabir",
    photoUrl: null,
    email: "farhana@coreitbd.com",
    phone: "+880 1711-100002",
    department: "Engineering",
    designation: "CTO",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2022-01-15",
    terminationDate: null,
    reportingManagerId: "emp-1",
    dateOfBirth: "1987-06-22",
    gender: "FEMALE",
    address: "House 4, Road 11, Dhanmondi, Dhaka",
    emergencyContact: { name: "Kabir Ahmed", relation: "Father", phone: "+880 1811-900002" },
    bankInfo: { bankName: "City Bank", accountNumber: "1520304051", branchName: "Dhanmondi" },
    basicSalaryBdt: 220000,
    documents: [],
    createdAt: "2022-01-15T09:00:00",
    updatedAt: "2022-01-15T09:00:00",
  },
  {
    id: "emp-3",
    employeeCode: "EMP-0003",
    name: "Rafiq Islam",
    photoUrl: null,
    email: "rafiq@coreitbd.com",
    phone: "+880 1711-100003",
    department: "Sales",
    designation: "Sales Executive",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2022-08-01",
    terminationDate: null,
    reportingManagerId: "emp-1",
    dateOfBirth: "1992-11-02",
    gender: "MALE",
    address: "House 9, Road 2, Uttara, Dhaka",
    emergencyContact: { name: "Nasrin Islam", relation: "Spouse", phone: "+880 1811-900003" },
    bankInfo: { bankName: "Dutch-Bangla Bank", accountNumber: "1520304052", branchName: "Uttara" },
    basicSalaryBdt: 65000,
    documents: [],
    createdAt: "2022-08-01T09:00:00",
    updatedAt: "2022-08-01T09:00:00",
  },
  {
    id: "emp-4",
    employeeCode: "EMP-0004",
    name: "Tanvir Ahmed",
    photoUrl: null,
    email: "tanvir.ahmed@coreitbd.com",
    phone: "+880 1711-100004",
    department: "Engineering",
    designation: "Tech Lead",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2022-09-12",
    terminationDate: null,
    reportingManagerId: "emp-2",
    dateOfBirth: "1990-02-18",
    gender: "MALE",
    address: "House 21, Road 7, Mohammadpur, Dhaka",
    emergencyContact: { name: "Sultana Ahmed", relation: "Mother", phone: "+880 1811-900004" },
    bankInfo: { bankName: "BRAC Bank", accountNumber: "1520304053", branchName: "Mohammadpur" },
    basicSalaryBdt: 130000,
    documents: [],
    createdAt: "2022-09-12T09:00:00",
    updatedAt: "2022-09-12T09:00:00",
  },
  {
    id: "emp-5",
    employeeCode: "EMP-0005",
    name: "Nusrat Jahan",
    photoUrl: null,
    email: "nusrat@coreitbd.com",
    phone: "+880 1711-100005",
    department: "Sales",
    designation: "Sales Executive",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2023-01-20",
    terminationDate: null,
    reportingManagerId: "emp-1",
    dateOfBirth: "1994-07-30",
    gender: "FEMALE",
    address: "House 6, Road 3, Bashundhara, Dhaka",
    emergencyContact: { name: "Jahangir Alam", relation: "Father", phone: "+880 1811-900005" },
    bankInfo: { bankName: "City Bank", accountNumber: "1520304054", branchName: "Bashundhara" },
    basicSalaryBdt: 62000,
    documents: [],
    createdAt: "2023-01-20T09:00:00",
    updatedAt: "2023-01-20T09:00:00",
  },
  {
    id: "emp-6",
    employeeCode: "EMP-0006",
    name: "Imran Chowdhury",
    photoUrl: null,
    email: "imran@coreitbd.com",
    phone: "+880 1711-100006",
    department: "Engineering",
    designation: "Senior Software Engineer",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2023-03-05",
    terminationDate: null,
    reportingManagerId: "emp-4",
    dateOfBirth: "1993-04-09",
    gender: "MALE",
    address: "House 33, Road 9, Mirpur, Dhaka",
    emergencyContact: { name: "Rehana Chowdhury", relation: "Spouse", phone: "+880 1811-900006" },
    bankInfo: { bankName: "Dutch-Bangla Bank", accountNumber: "1520304055", branchName: "Mirpur" },
    basicSalaryBdt: 105000,
    documents: [],
    createdAt: "2023-03-05T09:00:00",
    updatedAt: "2023-03-05T09:00:00",
  },
  {
    id: "emp-7",
    employeeCode: "EMP-0007",
    name: "Sabrina Akter",
    photoUrl: null,
    email: "sabrina@coreitbd.com",
    phone: "+880 1711-100007",
    department: "Design",
    designation: "UI/UX Designer",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2023-05-15",
    terminationDate: null,
    reportingManagerId: "emp-2",
    dateOfBirth: "1995-09-25",
    gender: "FEMALE",
    address: "House 17, Road 4, Lalmatia, Dhaka",
    emergencyContact: { name: "Akter Hossain", relation: "Father", phone: "+880 1811-900007" },
    bankInfo: { bankName: "BRAC Bank", accountNumber: "1520304056", branchName: "Lalmatia" },
    basicSalaryBdt: 90000,
    documents: [],
    createdAt: "2023-05-15T09:00:00",
    updatedAt: "2023-05-15T09:00:00",
  },
  {
    id: "emp-8",
    employeeCode: "EMP-0008",
    name: "Mahfuz Rahman",
    photoUrl: null,
    email: "mahfuz@coreitbd.com",
    phone: "+880 1711-100008",
    department: "QA",
    designation: "QA Engineer",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2023-07-01",
    terminationDate: null,
    reportingManagerId: "emp-4",
    dateOfBirth: "1996-01-11",
    gender: "MALE",
    address: "House 8, Road 6, Rampura, Dhaka",
    emergencyContact: { name: "Rahman Ali", relation: "Father", phone: "+880 1811-900008" },
    bankInfo: { bankName: "City Bank", accountNumber: "1520304057", branchName: "Rampura" },
    basicSalaryBdt: 68000,
    documents: [],
    createdAt: "2023-07-01T09:00:00",
    updatedAt: "2023-07-01T09:00:00",
  },
  {
    id: "emp-9",
    employeeCode: "EMP-0009",
    name: "Shirin Sultana",
    photoUrl: null,
    email: "shirin@coreitbd.com",
    phone: "+880 1711-100009",
    department: "HR",
    designation: "HR Manager",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2023-02-01",
    terminationDate: null,
    reportingManagerId: "emp-1",
    dateOfBirth: "1988-12-05",
    gender: "FEMALE",
    address: "House 25, Road 8, Baridhara, Dhaka",
    emergencyContact: { name: "Sultan Mahmud", relation: "Spouse", phone: "+880 1811-900009" },
    bankInfo: { bankName: "Dutch-Bangla Bank", accountNumber: "1520304058", branchName: "Baridhara" },
    basicSalaryBdt: 95000,
    documents: [],
    createdAt: "2023-02-01T09:00:00",
    updatedAt: "2023-02-01T09:00:00",
  },
  {
    id: "emp-10",
    employeeCode: "EMP-0010",
    name: "Kamrul Hasan",
    photoUrl: null,
    email: "kamrul@coreitbd.com",
    phone: "+880 1711-100010",
    department: "DevOps",
    designation: "DevOps Engineer",
    employmentType: "FULL_TIME",
    status: "ON_LEAVE",
    joinDate: "2023-09-18",
    terminationDate: null,
    reportingManagerId: "emp-4",
    dateOfBirth: "1991-10-19",
    gender: "MALE",
    address: "House 14, Road 12, Khilgaon, Dhaka",
    emergencyContact: { name: "Hasan Mia", relation: "Father", phone: "+880 1811-900010" },
    bankInfo: { bankName: "BRAC Bank", accountNumber: "1520304059", branchName: "Khilgaon" },
    basicSalaryBdt: 100000,
    documents: [],
    createdAt: "2023-09-18T09:00:00",
    updatedAt: "2026-08-01T09:00:00",
  },
  {
    id: "emp-11",
    employeeCode: "EMP-0011",
    name: "Rumana Haque",
    photoUrl: null,
    email: "rumana@coreitbd.com",
    phone: "+880 1711-100011",
    department: "Finance",
    designation: "Accountant",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2024-01-08",
    terminationDate: null,
    reportingManagerId: "emp-1",
    dateOfBirth: "1994-05-27",
    gender: "FEMALE",
    address: "House 3, Road 1, Malibagh, Dhaka",
    emergencyContact: { name: "Haque Mia", relation: "Father", phone: "+880 1811-900011" },
    bankInfo: { bankName: "City Bank", accountNumber: "1520304060", branchName: "Malibagh" },
    basicSalaryBdt: 60000,
    documents: [],
    createdAt: "2024-01-08T09:00:00",
    updatedAt: "2024-01-08T09:00:00",
  },
  {
    id: "emp-12",
    employeeCode: "EMP-0012",
    name: "Ashraful Alam",
    photoUrl: null,
    email: "ashraful@coreitbd.com",
    phone: "+880 1711-100012",
    department: "Marketing",
    designation: "Marketing Executive",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2024-04-22",
    terminationDate: null,
    reportingManagerId: "emp-1",
    dateOfBirth: "1997-08-14",
    gender: "MALE",
    address: "House 19, Road 10, Shyamoli, Dhaka",
    emergencyContact: { name: "Alam Hossain", relation: "Father", phone: "+880 1811-900012" },
    bankInfo: { bankName: "Dutch-Bangla Bank", accountNumber: "1520304061", branchName: "Shyamoli" },
    basicSalaryBdt: 58000,
    documents: [],
    createdAt: "2024-04-22T09:00:00",
    updatedAt: "2024-04-22T09:00:00",
  },
  {
    id: "emp-13",
    employeeCode: "EMP-0013",
    name: "Jannatul Ferdous",
    photoUrl: null,
    email: "jannatul@coreitbd.com",
    phone: "+880 1711-100013",
    department: "Product",
    designation: "Product Manager",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joinDate: "2024-06-10",
    terminationDate: null,
    reportingManagerId: "emp-2",
    dateOfBirth: "1990-12-30",
    gender: "FEMALE",
    address: "House 27, Road 13, Gulshan, Dhaka",
    emergencyContact: { name: "Ferdous Karim", relation: "Spouse", phone: "+880 1811-900013" },
    bankInfo: { bankName: "BRAC Bank", accountNumber: "1520304062", branchName: "Gulshan" },
    basicSalaryBdt: 120000,
    documents: [],
    createdAt: "2024-06-10T09:00:00",
    updatedAt: "2024-06-10T09:00:00",
  },
  {
    id: "emp-14",
    employeeCode: "EMP-0014",
    name: "Sabbir Hossain",
    photoUrl: null,
    email: "sabbir@coreitbd.com",
    phone: "+880 1711-100014",
    department: "Engineering",
    designation: "Software Engineer",
    employmentType: "CONTRACT",
    status: "ACTIVE",
    joinDate: "2025-02-17",
    terminationDate: null,
    reportingManagerId: "emp-4",
    dateOfBirth: "1998-03-08",
    gender: "MALE",
    address: "House 31, Road 15, Badda, Dhaka",
    emergencyContact: { name: "Hossain Miah", relation: "Father", phone: "+880 1811-900014" },
    bankInfo: { bankName: "City Bank", accountNumber: "1520304063", branchName: "Badda" },
    basicSalaryBdt: 55000,
    documents: [],
    createdAt: "2025-02-17T09:00:00",
    updatedAt: "2025-02-17T09:00:00",
  },
  {
    id: "emp-15",
    employeeCode: "EMP-0015",
    name: "Mim Akhter",
    photoUrl: null,
    email: "mim@coreitbd.com",
    phone: "+880 1711-100015",
    department: "Engineering",
    designation: "Software Engineer",
    employmentType: "INTERN",
    status: "ACTIVE",
    joinDate: "2026-06-01",
    terminationDate: null,
    reportingManagerId: "emp-4",
    dateOfBirth: "2001-01-22",
    gender: "FEMALE",
    address: "House 5, Road 2, Adabor, Dhaka",
    emergencyContact: { name: "Akhter Ali", relation: "Father", phone: "+880 1811-900015" },
    bankInfo: null,
    basicSalaryBdt: 20000,
    documents: [],
    createdAt: "2026-06-01T09:00:00",
    updatedAt: "2026-06-01T09:00:00",
  },
  {
    id: "emp-16",
    employeeCode: "EMP-0016",
    name: "Delwar Hossain",
    photoUrl: null,
    email: "delwar@coreitbd.com",
    phone: "+880 1711-100016",
    department: "Sales",
    designation: "Sales Executive",
    employmentType: "FULL_TIME",
    status: "TERMINATED",
    joinDate: "2022-11-03",
    terminationDate: "2026-04-30",
    reportingManagerId: "emp-1",
    dateOfBirth: "1989-06-16",
    gender: "MALE",
    address: "House 40, Road 16, Tejgaon, Dhaka",
    emergencyContact: { name: "Hossain Begum", relation: "Mother", phone: "+880 1811-900016" },
    bankInfo: { bankName: "Dutch-Bangla Bank", accountNumber: "1520304064", branchName: "Tejgaon" },
    basicSalaryBdt: 62000,
    documents: [],
    createdAt: "2022-11-03T09:00:00",
    updatedAt: "2026-04-30T09:00:00",
  },
]
