"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  Download,
  Filter,
  Search,
  User,
  Users,
  Clock,
  Briefcase,
  BadgeCheck,
  AlertCircle,
  Plus,
  LayoutGrid,
  Moon,
  Sun,
  Pencil,
} from "lucide-react"

// Roles (ordered) + permissions
export const ROLE_ORDER = [
  "Medical Coder",
  "Medical Biller",
  "Assistant Team Lead",
  "Team Lead",
  "Senior Team Lead",
  "Account Manager",
  "Operations Manager",
  "HR",
  "Admin",
  "Super User",
] as const

export type Role = (typeof ROLE_ORDER)[number]

const ROLE_RANK: Record<Role, number> = ROLE_ORDER.reduce(
  (acc, r, i) => ({ ...acc, [r]: i }),
  {} as Record<Role, number>,
)

const canAddMember = (current: Role) => ROLE_RANK[current] >= ROLE_RANK["Assistant Team Lead"]
const canEditMember = (current: Role, target: Role) => ROLE_RANK[current] >= ROLE_RANK[target]

// Dummy data
const teams = ["CK Derm", "Behavior Frontiers", "Internal Ops", "MedLab2020", "SCI – TEAM MPP"] as const

const statuses = [
  { key: "present", label: "Present" },
  { key: "late", label: "Late" },
  { key: "pto", label: "PTO" },
  { key: "sick", label: "Sick" },
  { key: "wfh", label: "WFH" },
  { key: "absent", label: "Absent" },
] as const

type StatusKey = (typeof statuses)[number]["key"]

type Employee = {
  id: string
  name: string
  role: Role
  team: (typeof teams)[number]
  shift: string
  status: StatusKey
  hoursToday: number
  hoursMonth: number
  lateMins: number
  pto: number
  sick: number
  overtime: number
}

const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "Leonardo Dimov",
    role: "Medical Biller",
    team: "Behavior Frontiers",
    shift: "15:00–23:00 CEST",
    status: "present",
    hoursToday: 8,
    hoursMonth: 136,
    lateMins: 0,
    pto: 0,
    sick: 0,
    overtime: 2,
  },
  {
    id: "EMP-002",
    name: "Desanka Stamkova",
    role: "Medical Biller",
    team: "Behavior Frontiers",
    shift: "15:00–23:00 CEST",
    status: "late",
    hoursToday: 7.25,
    hoursMonth: 128,
    lateMins: 10,
    pto: 0,
    sick: 0,
    overtime: 0,
  },
  {
    id: "EMP-003",
    name: "Marija Crvenkovska",
    role: "Medical Coder",
    team: "CK Derm",
    shift: "09:00–17:00 CEST",
    status: "present",
    hoursToday: 8,
    hoursMonth: 140,
    lateMins: 0,
    pto: 0,
    sick: 0,
    overtime: 0.5,
  },
  {
    id: "EMP-004",
    name: "Abdula Ali",
    role: "Medical Biller",
    team: "Behavior Frontiers",
    shift: "15:00–23:00 CEST",
    status: "wfh",
    hoursToday: 8,
    hoursMonth: 132,
    lateMins: 0,
    pto: 0,
    sick: 0,
    overtime: 1,
  },
  {
    id: "EMP-005",
    name: "Nikolche Petrov",
    role: "Medical Biller",
    team: "Behavior Frontiers",
    shift: "15:00–23:00 CEST",
    status: "pto",
    hoursToday: 0,
    hoursMonth: 112,
    lateMins: 0,
    pto: 8,
    sick: 0,
    overtime: 0,
  },
  {
    id: "EMP-006",
    name: "Sanja Trajkov",
    role: "Medical Biller",
    team: "Behavior Frontiers",
    shift: "15:00–23:00 CEST",
    status: "sick",
    hoursToday: 0,
    hoursMonth: 96,
    lateMins: 0,
    pto: 0,
    sick: 8,
    overtime: 0,
  },
]

const statusStyles: Record<string, string> = {
  present: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  late: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  pto: "bg-sky-500/15 text-sky-600 border-sky-500/20",
  sick: "bg-rose-500/15 text-rose-600 border-rose-500/20",
  wfh: "bg-indigo-500/15 text-indigo-600 border-indigo-500/20",
  absent: "bg-neutral-500/15 text-neutral-700 border-neutral-500/20",
}

// Helpers
const ALL = "__ALL__"

function filterEmployees(
  list: Employee[],
  { query, team, role, status }: { query?: string; team?: string; role?: string; status?: string },
): Employee[] {
  const q = (query || "").toLowerCase()
  return list.filter((e) => {
    const matchesQuery = q ? e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) : true
    const matchesTeam = team ? e.team === team : true
    const matchesRole = role ? e.role === role : true
    const matchesStatus = status ? e.status === status : true
    return matchesQuery && matchesTeam && matchesRole && matchesStatus
  })
}

// Time options
const TIME_OPTIONS = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    }
  }
  return out
})()

function normalizeTime(t: string): string | null {
  if (!t) return null
  const cleaned = t.trim().replace(".", ":")
  const colon = cleaned.includes(":")
    ? cleaned
    : cleaned.length === 4
      ? `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`
      : cleaned
  const match = /^([0-2]?\d):([0-5]\d)$/.exec(colon)
  if (!match) return null
  const hh = Number.parseInt(match[1], 10)
  if (hh > 23) return null
  return `${String(hh).padStart(2, "0")}:${match[2]}`
}

function computeHours(start?: string, end?: string) {
  if (!start || !end) return 0
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const mins = eh * 60 + em - (sh * 60 + sm)
  return Math.max(0, mins) / 60
}

export type LeaveType =
  | "none"
  | "sick"
  | "vacation"
  | "us_ph"
  | "mk_ph"
  | "maternity"
  | "unpaid_absence"
  | "blood_donation"

type DailyRecord = {
  start?: string
  end?: string
  validatedByTL?: boolean
  leave?: LeaveType
}

type AttendanceState = Record<string, Record<string, DailyRecord>>

const US_2025_HOLIDAYS = [
  "2025-01-01",
  "2025-01-20",
  "2025-02-17",
  "2025-05-26",
  "2025-06-19",
  "2025-07-04",
  "2025-09-01",
  "2025-10-13",
  "2025-11-11",
  "2025-11-27",
  "2025-12-25",
]

const MK_2025_HOLIDAYS = [
  "2025-01-01",
  "2025-01-07",
  "2025-04-20",
  "2025-05-01",
  "2025-05-24",
  "2025-08-02",
  "2025-09-08",
  "2025-10-11",
  "2025-12-08",
]

const isHoliday = (key: string, type: "us_ph" | "mk_ph") =>
  (type === "us_ph" ? US_2025_HOLIDAYS : MK_2025_HOLIDAYS).includes(key)

const getWeekRangeKeys = (anchor: Date) => {
  const day = anchor.getDay()
  const mondayOffset = (day + 6) % 7
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

const creditForLeave = (leave?: LeaveType, key?: string) => {
  if (!leave) return 0
  if (["sick", "vacation", "maternity", "blood_donation"].includes(leave)) return 8
  if (leave === "us_ph" && key && isHoliday(key, "us_ph")) return 8
  if (leave === "mk_ph" && key && isHoliday(key, "mk_ph")) return 8
  return 0
}

const weeklyHours = (attMap: AttendanceState, empId: string, anchor: Date) =>
  getWeekRangeKeys(anchor).reduce((sum, k) => {
    const rec = attMap[k]?.[empId]
    const worked = rec ? computeHours(rec.start, rec.end) : 0
    return sum + worked + creditForLeave(rec?.leave, k)
  }, 0)

const monthlySummary = (attMap: AttendanceState, empId: string, anchor: Date) => {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const next = new Date(year, month + 1, 1)
  let worked = 0,
    credits = 0,
    workdays = 0
  for (let d = new Date(first); d < next; d.setDate(d.getDate() + 1)) {
    const key = new Date(d).toISOString().slice(0, 10)
    const rec = attMap[key]?.[empId]
    if (![0, 6].includes(new Date(key + "T00:00:00").getDay())) workdays++
    if (rec) {
      worked += computeHours(rec.start, rec.end)
      credits += creditForLeave(rec.leave, key)
    }
  }
  const expected = workdays * 8
  const net = worked + credits - expected
  return { worked, credits, expected, net }
}

function MetricCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string
  value: string
  icon: any
  hint?: string
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 opacity-70" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
      </CardContent>
    </Card>
  )
}

function TimePickerCell({
  value,
  onChange,
}: {
  value?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text")
          const norm = normalizeTime(text)
          if (norm) {
            e.preventDefault()
            onChange(norm)
          }
        }}
        className="w-[110px]"
      />
      <Select value={value ?? undefined} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {TIME_OPTIONS.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function HealthcareAttendanceDashboard() {
  const [currentUserRole, setCurrentUserRole] = React.useState<Role>("Team Lead")
  const [query, setQuery] = React.useState("")
  const [team, setTeam] = React.useState<string | undefined>()
  const [role, setRole] = React.useState<string | undefined>()
  const [status, setStatus] = React.useState<string | undefined>()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [dark, setDark] = React.useState(false)

  const [data, setData] = React.useState<Employee[]>(initialEmployees)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Employee | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editRole, setEditRole] = React.useState<Role | null>(null)

  const [attendance, setAttendance] = React.useState<AttendanceState>({})

  const [bulkStart, setBulkStart] = React.useState<string | undefined>()
  const [bulkEnd, setBulkEnd] = React.useState<string | undefined>()
  const [bulkLeave, setBulkLeave] = React.useState<LeaveType>("none")

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const filtered = React.useMemo(
    () => filterEmployees(data, { query, team, role, status }),
    [data, query, team, role, status],
  )

  const attendanceRate = `${Math.round(
    (filtered.filter((f) => f.status === "present" || f.status === "wfh").length / Math.max(filtered.length, 1)) * 100,
  )}%`

  const absentToday = `${filtered.filter((f) => ["pto", "sick", "absent"].includes(f.status)).length}`

  const overtimeHrs = `${filtered.reduce((acc, cur) => acc + cur.overtime, 0).toFixed(1)} hrs`

  const avgHours = `${(filtered.reduce((acc, cur) => acc + cur.hoursToday, 0) / Math.max(filtered.length, 1)).toFixed(
    1,
  )} h avg`

  const onTeamChange = (v: string) => setTeam(v === ALL ? undefined : v)
  const onRoleChange = (v: string) => setRole(v === ALL ? undefined : v)
  const onStatusChange = (v: string) => setStatus(v === ALL ? undefined : v)

  const toDateKey = (d: Date | undefined) => (d ? d.toISOString().slice(0, 10) : "")
  const todayKey = toDateKey(date)

  const setDaily = (empId: string, updater: (rec: DailyRecord) => DailyRecord) =>
    setAttendance((prev) => {
      const day = prev[todayKey] ?? {}
      const current = day[empId] ?? {}
      const updated = updater({ ...current })
      return { ...prev, [todayKey]: { ...day, [empId]: updated } }
    })

  const saveEdits = () => {
    if (!selected || !editRole) return
    if (!canEditMember(currentUserRole, selected.role)) return
    setData((prev) => prev.map((e) => (e.id === selected.id ? { ...e, name: editName, role: editRole } : e)))
    setSheetOpen(false)
  }

  const addMember = () => {
    if (!canAddMember(currentUserRole)) return
    const next = data.length + 1
    const draft: Employee = {
      id: `EMP-${String(next).padStart(3, "0")}`,
      name: "New Teammate",
      role: "Medical Biller",
      team: "Behavior Frontiers",
      shift: "09:00–17:00 CEST",
      status: "present",
      hoursToday: 0,
      hoursMonth: 0,
      lateMins: 0,
      pto: 0,
      sick: 0,
      overtime: 0,
    }
    setData((prev) => [draft, ...prev])
  }

  const applyBulk = () =>
    setAttendance((prev) => {
      const day = { ...(prev[todayKey] ?? {}) }
      filtered.forEach((emp) => {
        const cur = day[emp.id] ?? {}
        day[emp.id] = {
          ...cur,
          start: bulkStart ?? cur.start,
          end: bulkEnd ?? cur.end,
          leave: bulkLeave !== "none" ? bulkLeave : cur.leave,
        }
      })
      return { ...prev, [todayKey]: day }
    })

  const validateAll = () =>
    setAttendance((prev) => {
      const day = { ...(prev[todayKey] ?? {}) }
      filtered.forEach((emp) => {
        const cur = day[emp.id] ?? {}
        day[emp.id] = { ...cur, validatedByTL: true }
      })
      return { ...prev, [todayKey]: day }
    })

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5" />
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Healthcare Attendance Dashboard</h1>
            <p className="text-sm text-muted-foreground">Daily presence, hours, and trends across teams</p>
          </div>
          <Badge variant="outline" className="rounded-full ml-2">
            Lite
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={currentUserRole} onValueChange={(v) => setCurrentUserRole(v as Role)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Your role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_ORDER.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setDark((d) => !d)}>
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or ID"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Select onValueChange={onTeamChange} value={team ?? ALL}>
                <SelectTrigger>
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All teams</SelectItem>
                  {Array.from(teams).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select onValueChange={onRoleChange} value={role ?? ALL}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All roles</SelectItem>
                  {ROLE_ORDER.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select onValueChange={onStatusChange} value={status ?? ALL}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All statuses</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Attendance Rate" value={attendanceRate} icon={Users} hint="Present + WFH / total" />
        <MetricCard title="Absent Today" value={absentToday} icon={AlertCircle} hint="PTO + Sick + Absent" />
        <MetricCard title="Overtime (today)" value={overtimeHrs} icon={Clock} hint="Sum of overtime hours" />
        <MetricCard title="Avg Hours (today)" value={avgHours} icon={Briefcase} hint="Average per filtered group" />
      </div>

      {/* Shift Validation */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Shift Validation – Today
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground mr-2">Bulk fill (filtered):</div>
              <TimePickerCell value={bulkStart} onChange={setBulkStart} />
              <span className="text-xs text-muted-foreground">to</span>
              <TimePickerCell value={bulkEnd} onChange={setBulkEnd} />
              <Select value={bulkLeave} onValueChange={(v) => setBulkLeave(v as LeaveType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No leave</SelectItem>
                  <SelectItem value="sick">Sick leave</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="us_ph">US Public Holiday</SelectItem>
                  <SelectItem value="mk_ph">Macedonian Public Holiday</SelectItem>
                  <SelectItem value="maternity">Maternity leave</SelectItem>
                  <SelectItem value="unpaid_absence">Not covered absence</SelectItem>
                  <SelectItem value="blood_donation">Blood donation day</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={applyBulk}>
                Apply
              </Button>
              <Button onClick={validateAll}>Validate all</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Start</th>
                  <th className="py-2 pr-3">End</th>
                  <th className="py-2 pr-3">Leave</th>
                  <th className="py-2 pr-3">Hours</th>
                  <th className="py-2 pr-3">Validated</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const rec = attendance[todayKey]?.[emp.id] ?? {}
                  const hours = computeHours(rec.start, rec.end) + creditForLeave(rec.leave, todayKey)
                  const canValidate = ROLE_RANK[currentUserRole] >= ROLE_RANK["Assistant Team Lead"]
                  return (
                    <tr key={emp.id} className="border-t">
                      <td className="py-2 pr-3">
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.id}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <TimePickerCell
                          value={rec.start}
                          onChange={(v) => setDaily(emp.id, (r) => ({ ...r, start: v }))}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <TimePickerCell value={rec.end} onChange={(v) => setDaily(emp.id, (r) => ({ ...r, end: v }))} />
                      </td>
                      <td className="py-2 pr-3">
                        <Select
                          value={rec.leave ?? "none"}
                          onValueChange={(v) =>
                            setDaily(emp.id, (r) => ({
                              ...r,
                              leave: v as LeaveType,
                            }))
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="sick">Sick leave</SelectItem>
                            <SelectItem value="vacation">Vacation</SelectItem>
                            <SelectItem value="us_ph">US Public Holiday</SelectItem>
                            <SelectItem value="mk_ph">Macedonian Public Holiday</SelectItem>
                            <SelectItem value="maternity">Maternity leave</SelectItem>
                            <SelectItem value="unpaid_absence">Not covered absence</SelectItem>
                            <SelectItem value="blood_donation">Blood donation day</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">{hours.toFixed(2)} h</td>
                      <td className="py-2 pr-3">
                        {rec.validatedByTL ? (
                          <Badge variant="outline" className="text-emerald-600">
                            Validated
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <Button
                          size="sm"
                          disabled={!canValidate}
                          onClick={() => setDaily(emp.id, (r) => ({ ...r, validatedByTL: true }))}
                        >
                          Validate
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weekly & Monthly */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Weekly Hours (Mon–Sun)
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {filtered.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between border-b py-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {emp.name}
                  </div>
                  <div className="font-medium">{weeklyHours(attendance, emp.id, date || new Date()).toFixed(2)} h</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" />
              Monthly Summary (Overtime / Missing)
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {filtered.map((emp) => {
                const s = monthlySummary(attendance, emp.id, date || new Date())
                const netLabel = s.net >= 0 ? `${s.net.toFixed(2)} h OT` : `${Math.abs(s.net).toFixed(2)} h missing`
                return (
                  <div key={emp.id} className="grid grid-cols-5 gap-2 items-center border-b py-2">
                    <div className="col-span-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {emp.name}
                    </div>
                    <div className="text-xs text-muted-foreground">Worked {s.worked.toFixed(1)}h</div>
                    <div className="text-xs text-muted-foreground">Credits {s.credits.toFixed(1)}h</div>
                    <div className={cn("text-right font-medium", s.net >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {netLabel}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              Expected = workdays × 8h. Credits include Sick, Vacation, Maternity, Blood donation, and valid US/MK
              public holidays.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Roster */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Roster
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Quick filters
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button onClick={addMember} disabled={!canAddMember(currentUserRole)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add member
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canAddMember(currentUserRole) && (
                    <TooltipContent>You need Assistant Team Lead or higher to add members.</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px] pr-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((emp) => {
                const editable = canEditMember(currentUserRole, emp.role)
                return (
                  <Card key={emp.id} className="rounded-2xl hover:shadow-md transition-all">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium leading-tight flex items-center gap-2">
                              {emp.name}
                              {editable && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setSelected(emp)
                                    setEditName(emp.name)
                                    setEditRole(emp.role)
                                    setSheetOpen(true)
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {emp.id} • {emp.role} • {emp.team}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("rounded-full px-2.5 py-1 text-xs", statusStyles[emp.status])}
                        >
                          {emp.status}
                        </Badge>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Shift: {emp.shift}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Today: {emp.hoursToday}h
                        </div>
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4" />
                          Month: {emp.hoursMonth}h
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Late: {emp.lateMins}m
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        PTO {emp.pto}h • Sick {emp.sick}h • OT {emp.overtime}h
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Edit member</SheetTitle>
            <SheetDescription>Update name or role. Permissions apply by role rank.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole ?? undefined} onValueChange={(v) => setEditRole(v as Role)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_ORDER.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdits}
              disabled={!selected || !editRole || !canEditMember(currentUserRole, selected?.role as Role)}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
