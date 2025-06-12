"use client";

import {
  fetchProjects,
  fetchSprints,
  fetchUsers,
  Project,
  Sprint,
  User,
} from "@/utils/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Calendar,
  FolderOpen,
  Users,
  List,
} from "lucide-react";

// Define your interfaces

enum SprintStatus {
  PLANNED = "PLANNED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        // Fetch all data in parallel
        const [projectsResponse, sprintsResponse, usersResponse] =
          await Promise.all([
            // Replace with your actual API calls
            fetchProjects(token),
            fetchSprints(token),
            fetchUsers(token),
          ]);

        setProjects(projectsResponse);
        setSprints(sprintsResponse);
        setUsers(usersResponse);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUserById = (id: number) => {
    return users.find((user) => user.id === id);
  };

  const getProjectSprints = (projectId: number) => {
    return sprints.filter((sprint) => sprint.projectId === projectId);
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
        <p className="text-gray-600">Manage your projects and their sprints</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const creator = getUserById(project.createdBy);
          const projectSprints = getProjectSprints(project.id);

          return (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.startDate)}
                      </div>
                      {creator && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          by {creator.username}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Sprints List */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <List className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-900">
                      Sprints ({projectSprints.length})
                    </h4>
                  </div>

                  {projectSprints.length > 0 ? (
                    <div className="space-y-2">
                      {projectSprints.map((sprint) => (
                        <div
                          key={sprint.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {sprint.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              sprint.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : sprint.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : sprint.status === "PLANNED"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {sprint.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <List className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No sprints yet</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or create a new project
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </div>
      )}
    </div>
  );
}
