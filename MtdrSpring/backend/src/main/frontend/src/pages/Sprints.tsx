"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { fetchSprints, fetchProjects, type Sprint, type Project } from "@/utils/api"
import { toast } from "sonner"
import { SprintsTable } from "@/components/sprintsTable"
import { SprintFormDialog } from "@/components/sprintForm"
import { SprintViewDialog } from "@/components/sprintDialog"

export function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("token") || ""
        const [sprintsData, projectsData] = await Promise.all([fetchSprints(token), fetchProjects(token)])
        console.log("Fetched sprints:", sprintsData)
        setSprints(sprintsData)
        setProjects(projectsData)
      } catch (error) {
        console.error("Error loading sprints data:", error)
        toast.error("Failed to load sprints", {
          description: "Please try again or contact support.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreateSprint = (newSprint: Sprint) => {
    setSprints((prev) => [newSprint, ...prev])
    toast.success("Sprint created", {
      description: `Sprint "${newSprint.name}" has been created.`,
    })
  }

  const handleUpdateSprint = (updatedSprint: Sprint) => {
    setSprints((prev) => prev.map((sprint) => (sprint.id === updatedSprint.id ? updatedSprint : sprint)))
    toast.success("Sprint updated", {
      description: `Sprint "${updatedSprint.name}" has been updated.`,
    })
    setSelectedSprint(null)
  }

  const handleDeleteSprint = (id: number) => {
    setSprints((prev) => prev.filter((sprint) => sprint.id !== id))
    toast.success("Sprint deleted", {
      description: "The sprint has been removed.",
    })
    setSelectedSprint(null)
  }

  const handleViewSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint)
    setIsViewDialogOpen(true)
  }

  const filteredSprints = sprints.filter((sprint) => {
    // Apply status filter
    if (statusFilter !== "all" && sprint.status !== statusFilter) {
      return false
    }

    // Apply project filter
    if (projectFilter !== "all" && sprint.projectId !== Number(projectFilter)) {
      return false
    }

    return true
  })

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Sprints</h1>
            <p className="text-muted-foreground">Manage your project sprints</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Sprint
          </Button>
        </div>
        <div className="space-y-4 mb-6">
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter sprints by status or project</CardDescription>
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-muted/40 p-1">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="PLANNED" className="flex-1">
                    Planned
                  </TabsTrigger>
                  <TabsTrigger value="ACTIVE" className="flex-1">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="COMPLETED" className="flex-1">
                    Completed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Project</h3>
              <Tabs value={projectFilter} onValueChange={setProjectFilter} className="w-full">
                <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-muted/40 p-1">
                  <TabsTrigger value="all" className="flex-1">
                    All Projects
                  </TabsTrigger>
                  {projects.map((project) => (
                    <TabsTrigger key={project.id} value={project.id.toString()} className="flex-1">
                      {project.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <SprintsTable sprints={filteredSprints} projects={projects} onViewSprint={handleViewSprint} />
        )}

        {/* Create Sprint Dialog */}
        <SprintFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSave={handleCreateSprint}
          projects={projects}
        />

        {/* View/Edit Sprint Dialog */}
        {selectedSprint && (
          <SprintViewDialog
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            sprint={selectedSprint}
            projects={projects}
            onUpdate={handleUpdateSprint}
            onDelete={handleDeleteSprint}
          />
        )}
      </div>
  )
}
