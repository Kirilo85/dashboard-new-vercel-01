"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { CalendarIcon, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getMemberBradfordScore } from "@/lib/bradford-factor"
import { BradfordFactorBadge } from "@/components/bradford-factor-badge"

export function AttendanceTab() {
  const { user } = useAuth()
  const { clients, teamMembers, attendance, addAttendance, updateAttendance } = useDataStore()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedClient, setSelectedClient] = useState<string>("all")

  const dateStr = format(selectedDate, "yyyy-MM-dd")

  // Filter clients based on user permissions
  const myClients = useMemo(() => {
    if (user?.position === "Super Admin") {
      return clients
    }
    return clients.filter((c) => user?.assignedClients.includes(c.id))
  }, [clients, user])

  // Filter team members
  const filteredMembers = useMemo(() => {
    let members = teamMembers.filter((tm) => tm.active)

    if (user?.position !== "Super Admin") {
      const clientIds = myClients.map((c) => c.id)
      members = members.filter((tm) => clientIds.includes(tm.clientId))
    }

    if (selectedClient !== "all") {
      members = members.filter((tm) => tm.clientId === selectedClient)
    }

    return members.sort((a, b) => a.name.localeCompare(b.name))
  }, [teamMembers, myClients, selectedClient, user])

  const handleTimeChange = (memberId: string, field: "clockIn" | "clockOut", value: string) => {
    const existing = attendance.find((a) => a.date === dateStr && a.memberId === memberId)

    if (existing) {
      updateAttendance(existing.id, { [field]: value })
    } else {
      addAttendance({
        memberId,
        date: dateStr,
        [field]: value,
        breakMinutes: 0,
        leaveType: "none",
      })
    }
  }

  const handleLeaveChange = (memberId: string, leaveType: string) => {
    const existing = attendance.find((a) => a.date === dateStr && a.memberId === memberId)

    if (existing) {
      updateAttendance(existing.id, { leaveType: leaveType as any })
    } else {
      addAttendance({
        memberId,
        date: dateStr,
        breakMinutes: 0,
        leaveType: leaveType as any,
      })
    }
  }

  const handleValidate = (memberId: string) => {
    const existing = attendance.find((a) => a.date === dateStr && a.memberId === memberId)

    if (existing && user) {
      updateAttendance(existing.id, {
        validatedBy: user.id,
        validatedAt: new Date().toISOString(),
      })
    }
  }

  const calculateHours = (record: any) => {
    if (!record?.clockIn || !record?.clockOut) return 0
    const [inH, inM] = record.clockIn.split(":").map(Number)
    const [outH, outM] = record.clockOut.split(":").map(Number)
    const hours = outH + outM / 60 - (inH + inM / 60) - (record.breakMinutes || 0) / 60
    return Math.max(0, hours)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Tracking</h2>
          <p className="text-muted-foreground">Manage daily attendance for your team</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {myClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Attendance - {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left py-3 px-2">Employee</th>
                  <th className="text-left py-3 px-2">Position</th>
                  <th className="text-left py-3 px-2">Client</th>
                  <th className="text-left py-3 px-2">Clock In</th>
                  <th className="text-left py-3 px-2">Clock Out</th>
                  <th className="text-left py-3 px-2">Leave Type</th>
                  <th className="text-left py-3 px-2">Hours</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Bradford Factor</th>
                  <th className="text-left py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const record = attendance.find((a) => a.date === dateStr && a.memberId === member.id)
                  const client = clients.find((c) => c.id === member.clientId)
                  const hours = calculateHours(record)

                  return (
                    <tr key={member.id} className="border-b">
                      <td className="py-3 px-2">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.shift}</div>
                      </td>
                      <td className="py-3 px-2 text-sm">{member.position}</td>
                      <td className="py-3 px-2 text-sm">{client?.name}</td>
                      <td className="py-3 px-2">
                        <Input
                          type="time"
                          value={record?.clockIn || ""}
                          onChange={(e) => handleTimeChange(member.id, "clockIn", e.target.value)}
                          className="w-32"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="time"
                          value={record?.clockOut || ""}
                          onChange={(e) => handleTimeChange(member.id, "clockOut", e.target.value)}
                          className="w-32"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={record?.leaveType || "none"}
                          onValueChange={(value) => handleLeaveChange(member.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="vacation">Vacation</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2 font-medium">{hours.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        {record?.validatedBy ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validated
                          </Badge>
                        ) : record ? (
                          <Badge variant="outline">Pending</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted">
                            <X className="h-3 w-3 mr-1" />
                            Not Marked
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <BradfordFactorBadge score={getMemberBradfordScore(member.id, attendance, 12)} />
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleValidate(member.id)}
                          disabled={!record || !!record.validatedBy}
                        >
                          Validate
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No team members found for the selected filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
