"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { Plus, Pencil, Trash2, Users, Building2 } from "lucide-react"
import type { Position } from "@/lib/types"

export function TeamManagementTab() {
  const { user } = useAuth()
  const {
    clients,
    teamMembers,
    addClient,
    updateClient,
    deleteClient,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
  } = useDataStore()

  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<string>("all")

  // Client form state
  const [clientName, setClientName] = useState("")
  const [clientCode, setClientCode] = useState("")

  // Member form state
  const [memberName, setMemberName] = useState("")
  const [memberPosition, setMemberPosition] = useState<Position>("Medical Biller")
  const [memberClientId, setMemberClientId] = useState("")
  const [memberShift, setMemberShift] = useState("09:00-17:00")
  const [memberTeamLeadId, setMemberTeamLeadId] = useState<string>("")

  const myClients = useMemo(() => {
    if (user?.position === "Super Admin") {
      return clients
    }
    return clients.filter((c) => user?.assignedClients.includes(c.id))
  }, [clients, user])

  const filteredMembers = useMemo(() => {
    let members = teamMembers.filter((tm) => tm.active)

    if (user?.position !== "Super Admin") {
      const clientIds = myClients.map((c) => c.id)
      members = members.filter((tm) => clientIds.includes(tm.clientId))
    }

    if (selectedClient !== "all") {
      members = members.filter((tm) => tm.clientId === selectedClient)
    }

    return members
  }, [teamMembers, myClients, selectedClient, user])

  const handleSaveClient = () => {
    if (editingClient) {
      updateClient(editingClient.id, { name: clientName, code: clientCode })
    } else {
      addClient({ name: clientName, code: clientCode, active: true })
    }
    setClientDialogOpen(false)
    resetClientForm()
  }

  const handleSaveMember = () => {
    const memberData = {
      name: memberName,
      position: memberPosition,
      clientId: memberClientId,
      shift: memberShift,
      teamLeadId: memberTeamLeadId || undefined,
      active: true,
    }

    if (editingMember) {
      updateTeamMember(editingMember.id, memberData)
    } else {
      addTeamMember(memberData)
    }
    setMemberDialogOpen(false)
    resetMemberForm()
  }

  const resetClientForm = () => {
    setClientName("")
    setClientCode("")
    setEditingClient(null)
  }

  const resetMemberForm = () => {
    setMemberName("")
    setMemberPosition("Medical Biller")
    setMemberClientId("")
    setMemberShift("09:00-17:00")
    setMemberTeamLeadId("")
    setEditingMember(null)
  }

  const openEditClient = (client: any) => {
    setEditingClient(client)
    setClientName(client.name)
    setClientCode(client.code)
    setClientDialogOpen(true)
  }

  const openEditMember = (member: any) => {
    setEditingMember(member)
    setMemberName(member.name)
    setMemberPosition(member.position)
    setMemberClientId(member.clientId)
    setMemberShift(member.shift)
    setMemberTeamLeadId(member.teamLeadId || "")
    setMemberDialogOpen(true)
  }

  const positions: Position[] = [
    "Senior Team Lead",
    "Team Lead",
    "Assistant Team Lead",
    "Medical Biller",
    "Medical Coder",
    "QA Specialist",
    "Operations Manager",
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
        <p className="text-muted-foreground">Manage clients, teams, and members</p>
      </div>

      {/* Clients Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Clients
          </CardTitle>
          {user?.position === "Super Admin" && (
            <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetClientForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g., Behavior Frontiers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Code</Label>
                    <Input value={clientCode} onChange={(e) => setClientCode(e.target.value)} placeholder="e.g., BF" />
                  </div>
                  <Button onClick={handleSaveClient} className="w-full">
                    {editingClient ? "Update Client" : "Add Client"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {myClients.map((client) => {
              const memberCount = teamMembers.filter((tm) => tm.clientId === client.id && tm.active).length

              return (
                <Card key={client.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{client.name}</div>
                        <div className="text-sm text-muted-foreground">Code: {client.code}</div>
                        <div className="text-sm text-muted-foreground mt-1">{memberCount} team members</div>
                      </div>
                      {user?.position === "Super Admin" && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditClient(client)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteClient(client.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4 flex-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by client" />
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
          <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetMemberForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingMember ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={memberPosition} onValueChange={(v) => setMemberPosition(v as Position)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={memberClientId} onValueChange={setMemberClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {myClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shift</Label>
                  <Input
                    value={memberShift}
                    onChange={(e) => setMemberShift(e.target.value)}
                    placeholder="e.g., 09:00-17:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reports To (Optional)</Label>
                  <Select value={memberTeamLeadId} onValueChange={setMemberTeamLeadId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {filteredMembers
                        .filter((tm) => tm.id !== editingMember?.id)
                        .map((tm) => (
                          <SelectItem key={tm.id} value={tm.id}>
                            {tm.name} - {tm.position}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveMember} className="w-full" disabled={!memberName || !memberClientId}>
                  {editingMember ? "Update Member" : "Add Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const client = clients.find((c) => c.id === member.clientId)
              const teamLead = teamMembers.find((tm) => tm.id === member.teamLeadId)

              return (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.position} • {client?.name} • {member.shift}
                      {teamLead && ` • Reports to: ${teamLead.name}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{member.position}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEditMember(member)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteTeamMember(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {filteredMembers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No team members found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
