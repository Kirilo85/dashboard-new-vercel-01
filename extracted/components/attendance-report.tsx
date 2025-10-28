"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const attendanceReportData = [
  { month: "Jan", attended: 186, missed: 24, cancelled: 12 },
  { month: "Feb", attended: 205, missed: 19, cancelled: 15 },
  { month: "Mar", attended: 237, missed: 28, cancelled: 18 },
  { month: "Apr", attended: 273, missed: 31, cancelled: 22 },
  { month: "May", attended: 209, missed: 25, cancelled: 14 },
  { month: "Jun", attended: 264, missed: 33, cancelled: 20 },
]

export function AttendanceReport() {
  const data = attendanceReportData || []

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend />
        <Bar dataKey="attended" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} name="Attended" />
        <Bar dataKey="missed" fill="hsl(24 95% 53%)" radius={[4, 4, 0, 0]} name="Missed" />
        <Bar dataKey="cancelled" fill="hsl(346 77% 50%)" radius={[4, 4, 0, 0]} name="Cancelled" />
      </BarChart>
    </ResponsiveContainer>
  )
}
