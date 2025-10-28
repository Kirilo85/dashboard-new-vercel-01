export type Position =
  | "Super Admin"
  | "Senior Team Lead"
  | "Team Lead"
  | "Assistant Team Lead"
  | "Medical Biller"
  | "Medical Coder"
  | "QA Specialist"
  | "Operations Manager"

export interface User {
  id: string
  username: string
  password: string
  name: string
  position: Position
  assignedClients: string[]
  createdAt: string
}

export interface Client {
  id: string
  name: string
  code: string
  active: boolean
}

export interface TeamMember {
  id: string
  name: string
  position: Position
  clientId: string
  shift: string
  teamLeadId?: string
  active: boolean
}

export interface AttendanceRecord {
  id: string
  memberId: string
  date: string
  clockIn?: string
  clockOut?: string
  breakMinutes: number
  leaveType?: "none" | "sick" | "vacation" | "holiday" | "unpaid"
  notes?: string
  validatedBy?: string
  validatedAt?: string
}

export const POSITION_HIERARCHY: Record<Position, number> = {
  "Super Admin": 100,
  "Senior Team Lead": 80,
  "Team Lead": 60,
  "Assistant Team Lead": 40,
  "Medical Biller": 20,
  "Medical Coder": 20,
  "QA Specialist": 30,
  "Operations Manager": 70,
}
