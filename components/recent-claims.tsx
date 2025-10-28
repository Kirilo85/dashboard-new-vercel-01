"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const claims = [
  {
    id: "CLM-2024-001",
    patient: "John Smith",
    amount: "$1,250.00",
    status: "approved",
    date: "2024-01-15",
  },
  {
    id: "CLM-2024-002",
    patient: "Sarah Johnson",
    amount: "$890.00",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "CLM-2024-003",
    patient: "Michael Brown",
    amount: "$2,100.00",
    status: "approved",
    date: "2024-01-13",
  },
  {
    id: "CLM-2024-004",
    patient: "Emily Davis",
    amount: "$650.00",
    status: "rejected",
    date: "2024-01-12",
  },
  {
    id: "CLM-2024-005",
    patient: "David Wilson",
    amount: "$1,800.00",
    status: "pending",
    date: "2024-01-11",
  },
]

const statusStyles = {
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  rejected: "bg-rose-500/15 text-rose-600 border-rose-500/20",
}

export function RecentClaims() {
  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div key={claim.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {claim.patient
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{claim.patient}</p>
            <p className="text-sm text-muted-foreground">{claim.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusStyles[claim.status as keyof typeof statusStyles]}>
              {claim.status}
            </Badge>
            <div className="font-medium">{claim.amount}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
