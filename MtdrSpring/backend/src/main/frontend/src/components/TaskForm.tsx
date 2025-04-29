"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchUsers, fetchSprints } from "../utils/api"

interface TaskFormProps {
  onAddTask: (taskData: any) => Promise<void>
  isLoading: boolean
}

export function TaskForm({ onAddTask, isLoading }: TaskFormProps) {
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("LOW")
  const [assignee, setAssignee] = useState<string | undefined>(undefined)
  const [sprint, setSprint] = useState<string | undefined>(undefined)
  const [storyPoints, setStoryPoints] = useState<string | undefined>(undefined)
  const [estimatedTime, setEstimatedTime] = useState<string | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("token") || ""
        const fetchedUsers = await fetchUsers(token)
        setUsers(fetchedUsers || [])
      } catch (error) {
        console.error("Failed to fetch users:", error)
      }
    }

    loadUsers()
  }, [])

  // Load sprints
  useEffect(() => {
    const loadSprints = async () => {
      try {
        const token = localStorage.getItem("token") || ""
        const fetchedSprints = await fetchSprints(token)
        setSprints(fetchedSprints || [])
      } catch (error) {
        console.error("Failed to fetch sprints:", error)
      }
    }

    loadSprints()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) return

    const taskData = {
      description,
      priority,
      assignee: assignee ? Number.parseInt(assignee) : undefined,
      sprintId: sprint ? Number.parseInt(sprint) : null,
      storyPoints: storyPoints ? Number.parseInt(storyPoints) : null,
      estimatedTime: estimatedTime ? Number.parseInt(estimatedTime) : null,
      status: "TODO",
      createdBy: 1, // Default to current user
    }

    await onAddTask(taskData)
    resetForm()
    setOpen(false)
  }

  const resetForm = () => {
    setDescription("")
    setPriority("LOW")
    setAssignee(undefined)
    setSprint(undefined)
    setStoryPoints(undefined)
    setEstimatedTime(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Array.isArray(users) &&
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name || user.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint">Sprint</Label>
            <Select value={sprint} onValueChange={setSprint}>
              <SelectTrigger id="sprint">
                <SelectValue placeholder="Select sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Array.isArray(sprints) &&
                  sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id.toString()}>
                      {sprint.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                value={storyPoints || ""}
                onChange={(e) => setStoryPoints(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (h)</Label>
              <Input
                id="estimatedTime"
                type="number"
                min="0"
                value={estimatedTime || ""}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !description.trim()} className="w-full">
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Adding...
              </>
            ) : (
              "Add Task"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
