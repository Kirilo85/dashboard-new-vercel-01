"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, AlertTriangle } from "lucide-react"
import { useMemo } from "react"
import { getMemberBradfordScore } from "@/lib/bradford-factor"
import { BradfordFactorBadge } from "@/components/bradford-factor-badge"

export function OverviewTab() {
  const { user } = useAuth()
  const { clients, teamMembers, attendance } = useDataStore()

  const myClients = useMemo(() => {
    if (user?.position === "Super Admin") {
      return clients
    }
    return clients.filter((c) => user?.assignedClients.includes(c.id))
  }, [clients, user])

  const myTeamMembers = useMemo(() => {
    const clientIds = myClients.map((c) => c.id)
    return teamMembers.filter((tm) => clientIds.includes(tm.clientId) && tm.active)
  }, [myClients, teamMembers])

  const today = new Date().toISOString().slice(0, 10)

  const todayAttendance = useMemo(() => {
    const memberIds = myTeamMembers.map((tm) => tm.id)
    return attendance.filter((a) => a.date === today && memberIds.includes(a.memberId))
  }, [attendance, today, myTeamMembers])

  const presentCount = todayAttendance.filter((a) => a.clockIn && !a.leaveType).length
  const onLeaveCount = todayAttendance.filter((a) => a.leaveType && a.leaveType !== "none").length
  const absentCount = myTeamMembers.length - todayAttendance.length

  const totalHours = useMemo(() => {
    return todayAttendance.reduce((sum, record) => {
      if (record.clockIn && record.clockOut) {
        const [inH, inM] = record.clockIn.split(":").map(Number)
        const [outH, outM] = record.clockOut.split(":").map(Number)
        const hours = outH + outM / 60 - (inH + inM / 60) - record.breakMinutes / 60
        return sum + Math.max(0, hours)
      }
      return sum
    }, 0)
  }, [todayAttendance])

  const thisWeekHours = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
    const mondayStr = monday.toISOString().slice(0, 10)

    const memberIds = myTeamMembers.map((tm) => tm.id)
    const weekRecords = attendance.filter((a) => a.date >= mondayStr && memberIds.includes(a.memberId))

    return weekRecords.reduce((sum, record) => {
      if (record.clockIn && record.clockOut) {
        const [inH, inM] = record.clockIn.split(":").map(Number)
        const [outH, outM] = record.clockOut.split(":").map(Number)
        const hours = outH + outM / 60 - (inH + inM / 60) - record.breakMinutes / 60
        return sum + Math.max(0, hours)
      }
      return sum
    }, 0)
  }, [attendance, myTeamMembers])

  const validatedCount = todayAttendance.filter((a) => a.validatedBy).length

  const bradfordStats = useMemo(() => {
    const scores = myTeamMembers.map((member) => ({
      member,
      score: getMemberBradfordScore(member.id, attendance, 12),
    }))

    const highRisk = scores.filter((s) => s.score.level === "high" || s.score.level === "critical").length
    const concerns = scores.filter((s) => s.score.level === "medium").length

    return { scores, highRisk, concerns }
  }, [myTeamMembers, attendance])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Attendance analytics for your teams</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTeamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Across {myClients.length} clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {myTeamMembers.length > 0 ? Math.round((presentCount / myTeamMembers.length) * 100) : 0}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onLeaveCount}</div>
            <p className="text-xs text-muted-foreground">Scheduled leave today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentCount}</div>
            <p className="text-xs text-muted-foreground">Not marked present</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</div>
            <p className="text-xs text-muted-foreground">Total logged hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekHours.toFixed(1)} hrs</div>
            <p className="text-xs text-muted-foreground">Week to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validatedCount}/{todayAttendance.length}
            </div>
            <p className="text-xs text-muted-foreground">Records approved today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Bradford Factor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <div>
                  <div className="font-medium text-rose-600">High Risk</div>
                  <div className="text-xs text-muted-foreground">Score ≥ 200 (requires action)</div>
                </div>
                <div className="text-3xl font-bold text-rose-600">{bradfordStats.highRisk}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div>
                  <div className="font-medium text-amber-600">Medium Concern</div>
                  <div className="text-xs text-muted-foreground">Score 50-124 (monitor)</div>
                </div>
                <div className="text-3xl font-bold text-amber-600">{bradfordStats.concerns}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Bradford Factor = S² × D (S=absence spells, D=days absent over 12 months)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Attendance Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bradfordStats.scores
                .filter((s) => s.score.level !== "low")
                .sort((a, b) => b.score.score - a.score.score)
                .slice(0, 5)
                .map(({ member, score }) => (
                  <div key={member.id} className="flex items-center justify-between pb-2 border-b last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.position}</div>
                    </div>
                    <BradfordFactorBadge score={score} />
                  </div>
                ))}
              {bradfordStats.scores.filter((s) => s.score.level !== "low").length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                  All team members have good attendance!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myClients.map((client) => {
              const clientMembers = myTeamMembers.filter((tm) => tm.clientId === client.id)
              const clientAttendance = todayAttendance.filter((a) => clientMembers.some((tm) => tm.id === a.memberId))
              const clientPresent = clientAttendance.filter((a) => a.clockIn && !a.leaveType).length

              return (
                <div key={client.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {clientMembers.length} team members • {client.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {clientPresent}/{clientMembers.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Present today</div>
                  </div>
                </div>
              )
            })}
            {myClients.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No clients assigned</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
