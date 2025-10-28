import type { AttendanceRecord } from "./types"

export interface BradfordScore {
  score: number
  spells: number
  days: number
  level: "low" | "medium" | "high" | "critical"
  description: string
}

export const BRADFORD_THRESHOLDS = {
  LOW: 50,
  MEDIUM: 125,
  HIGH: 200,
  CRITICAL: 400,
}

export function calculateBradfordFactor(absences: AbsencePeriod[]): BradfordScore {
  const spells = absences.length
  const days = absences.reduce((sum, period) => sum + period.days, 0)
  const score = spells * spells * days

  let level: BradfordScore["level"]
  let description: string

  if (score < BRADFORD_THRESHOLDS.LOW) {
    level = "low"
    description = "Good attendance"
  } else if (score < BRADFORD_THRESHOLDS.MEDIUM) {
    level = "medium"
    description = "Monitor attendance"
  } else if (score < BRADFORD_THRESHOLDS.HIGH) {
    level = "high"
    description = "Attendance concern - verbal warning"
  } else if (score < BRADFORD_THRESHOLDS.CRITICAL) {
    level = "critical"
    description = "Serious attendance issue - written warning"
  } else {
    level = "critical"
    description = "Critical attendance issue - disciplinary action"
  }

  return {
    score,
    spells,
    days,
    level,
    description,
  }
}

export interface AbsencePeriod {
  startDate: string
  endDate: string
  days: number
  type: "sick" | "unpaid"
}

export function extractAbsencePeriods(records: AttendanceRecord[], startDate: Date, endDate: Date): AbsencePeriod[] {
  const absenceRecords = records
    .filter((r) => {
      const recordDate = new Date(r.date)
      return (
        recordDate >= startDate &&
        recordDate <= endDate &&
        (r.leaveType === "sick" || r.leaveType === "unpaid") &&
        !r.clockIn
      )
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  if (absenceRecords.length === 0) return []

  const periods: AbsencePeriod[] = []
  let currentPeriod: AbsencePeriod | null = null

  absenceRecords.forEach((record) => {
    if (!currentPeriod) {
      currentPeriod = {
        startDate: record.date,
        endDate: record.date,
        days: 1,
        type: record.leaveType as "sick" | "unpaid",
      }
    } else {
      const lastDate = new Date(currentPeriod.endDate)
      const currentDate = new Date(record.date)
      const dayDiff = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (dayDiff === 1 && record.leaveType === currentPeriod.type) {
        currentPeriod.endDate = record.date
        currentPeriod.days++
      } else {
        periods.push(currentPeriod)
        currentPeriod = {
          startDate: record.date,
          endDate: record.date,
          days: 1,
          type: record.leaveType as "sick" | "unpaid",
        }
      }
    }
  })

  if (currentPeriod) {
    periods.push(currentPeriod)
  }

  return periods
}

export function getMemberBradfordScore(
  memberId: string,
  attendance: AttendanceRecord[],
  rollingMonths = 12,
): BradfordScore {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - rollingMonths)

  const memberRecords = attendance.filter((r) => r.memberId === memberId)
  const absences = extractAbsencePeriods(memberRecords, startDate, endDate)

  return calculateBradfordFactor(absences)
}
