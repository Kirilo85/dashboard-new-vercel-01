"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useDataStore } from "@/lib/data-store"
import { Plus, Trash2, Shield, Key } from "lucide-react"
import type { Position } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

export function UserManagementTab() {
  const { users, clients, addUser, deleteUser } = useDataStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [position, setPosition] = useState<Position>("Team Lead")
  const [assignedClients, setAssignedClients] = useState<string[]>([])

  const resetForm = () => {
    setUsername("")
    setPassword("")
    setName("")
    setPosition("Team Lead")
    setAssignedClients([])
  }

  const handleSave = () => {
    if (!username || !password || !name) return

    addUser({
      username,
      password,
      name,
      position,
      assignedClients,
    })

    setDialogOpen(false)
    resetForm()
  }

  const toggleClient = (clientId: string) => {
    setAssignedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  const positions: Position[] = [
    "Super Admin",
    "Senior Team Lead",
    "Team Lead",
    "Assistant Team Lead",
    "Operations Manager",
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., john.smith" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
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
              {position !== "Super Admin" && (
                <div className="space-y-2">
                  <Label>Assigned Clients</Label>
                  <div className="space-y-2 border rounded-md p-3">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={client.id}
                          checked={assignedClients.includes(client.id)}
                          onCheckedChange={() => toggleClient(client.id)}
                        />
                        <label htmlFor={client.id} className="text-sm cursor-pointer">
                          {client.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleSave} className="w-full" disabled={!username || !password || !name}>
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => {
              const clientNames = user.assignedClients
                .map((id) => clients.find((c) => c.id === id)?.name)
                .filter(Boolean)
                .join(", ")

              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{user.name}</div>
                      <Badge variant={user.position === "Super Admin" ? "default" : "outline"}>{user.position}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        {user.username}
                      </span>
                      {clientNames && <span>• Clients: {clientNames}</span>}
                    </div>
                  </div>
                  {user.position !== "Super Admin" && (
                    <Button size="icon" variant="ghost" onClick={() => deleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
