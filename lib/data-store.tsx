"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Client, TeamMember, AttendanceRecord, User } from "./types"

interface DataStoreContextType {
  clients: Client[]
  teamMembers: TeamMember[]
  attendance: AttendanceRecord[]
  users: User[]
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addTeamMember: (member: Omit<TeamMember, "id">) => void
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void
  addAttendance: (record: Omit<AttendanceRecord, "id">) => void
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => void
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

const MOCK_CLIENTS: Client[] = [
  { id: "client-1", name: "Behavior Frontiers", code: "BF", active: true },
  { id: "client-2", name: "CK Dermatology", code: "CKD", active: true },
  { id: "client-3", name: "MedLab Solutions", code: "MLS", active: true },
]

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-1",
    name: "Sarah Johnson",
    position: "Senior Team Lead",
    clientId: "client-1",
    shift: "09:00-17:00",
    active: true,
  },
  {
    id: "tm-2",
    name: "Michael Brown",
    position: "Team Lead",
    clientId: "client-1",
    shift: "09:00-17:00",
    teamLeadId: "tm-1",
    active: true,
  },
  {
    id: "tm-3",
    name: "Emily Davis",
    position: "Medical Biller",
    clientId: "client-1",
    shift: "15:00-23:00",
    teamLeadId: "tm-2",
    active: true,
  },
  {
    id: "tm-4",
    name: "David Wilson",
    position: "Medical Coder",
    clientId: "client-1",
    shift: "15:00-23:00",
    teamLeadId: "tm-2",
    active: true,
  },
]

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "admin",
      password: "admin123",
      name: "System Administrator",
      position: "Super Admin",
      assignedClients: [],
      createdAt: new Date().toISOString(),
    },
  ])

  const addClient = (client: Omit<Client, "id">) => {
    const newClient = { ...client, id: `client-${Date.now()}` }
    setClients((prev) => [...prev, newClient])
  }

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...client } : c)))
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  const addTeamMember = (member: Omit<TeamMember, "id">) => {
    const newMember = { ...member, id: `tm-${Date.now()}` }
    setTeamMembers((prev) => [...prev, newMember])
  }

  const updateTeamMember = (id: string, member: Partial<TeamMember>) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...member } : m)))
  }

  const deleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const addAttendance = (record: Omit<AttendanceRecord, "id">) => {
    const newRecord = { ...record, id: `att-${Date.now()}` }
    setAttendance((prev) => [...prev, newRecord])
  }

  const updateAttendance = (id: string, record: Partial<AttendanceRecord>) => {
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, ...record } : a)))
  }

  const addUser = (user: Omit<User, "id" | "createdAt">) => {
    const newUser = { ...user, id: `user-${Date.now()}`, createdAt: new Date().toISOString() }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, user: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <DataStoreContext.Provider
      value={{
        clients,
        teamMembers,
        attendance,
        users,
        addClient,
        updateClient,
        deleteClient,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addAttendance,
        updateAttendance,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (context === undefined) {
    throw new Error("useDataStore must be used within a DataStoreProvider")
  }
  return context
}
