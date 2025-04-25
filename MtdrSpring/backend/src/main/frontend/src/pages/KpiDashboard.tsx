"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowDown, CheckCircle, Clock, ListTodo, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/Layout"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Datos de KPI proporcionados
const sprintKpis = [
  {
    totalTasks: 1,
    completedTasks: 0,
    totalEstimatedTime: 3.0,
    totalRealTime: 0.0,
    totalStoryPoints: 0,
    id: 2,
    name: "Sprint1",
  },
  {
    totalTasks: 3,
    completedTasks: 1,
    totalEstimatedTime: 6.7,
    totalRealTime: 0.0,
    totalStoryPoints: 9,
    id: 3,
    name: "Sprint2",
  },
  {
    totalTasks: 1,
    completedTasks: 0,
    totalEstimatedTime: 2.0,
    totalRealTime: 0.0,
    totalStoryPoints: 0,
    id: 4,
    name: "Sprint3",
  },
]

const developerKpis = [
  {
    assigneeId: 1,
    totalTasks: 1,
    totalEstimatedTime: 2.0,
    totalRealTime: 0.0,
    totalStoryPoints: 4,
    completedTasks: 0,
    completionRate: 0.0,
  },
  {
    assigneeId: 2,
    totalTasks: 2,
    totalEstimatedTime: 4.7,
    totalRealTime: 0.0,
    totalStoryPoints: 5,
    completedTasks: 1,
    completionRate: 50.0,
  },
  {
    assigneeId: 4,
    totalTasks: 1,
    totalEstimatedTime: 3.0,
    totalRealTime: 0.0,
    totalStoryPoints: 0,
    completedTasks: 0,
    completionRate: 0.0,
  },
  {
    assigneeId: 3,
    totalTasks: 1,
    totalEstimatedTime: 2.0,
    totalRealTime: 0.0,
    totalStoryPoints: 0,
    completedTasks: 0,
    completionRate: 0.0,
  },
]

// Configuración para los gráficos de sprint
const sprintChartConfig = {
  totalTasks: {
    label: "Total Tasks",
    color: "hsl(var(--chart-1))",
  },
  completedTasks: {
    label: "Completed Tasks",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

// Configuración para los gráficos de desarrollador
const developerChartConfig = {
  totalTasks: {
    label: "Total Tasks",
    color: "hsl(var(--chart-1))",
  },
  completedTasks: {
    label: "Completed Tasks",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

// Configuración para el gráfico de tasa de finalización
const completionRateConfig = {
  completionRate: {
    label: "Completion Rate",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

// Configuración para el gráfico de puntos de historia
const storyPointsConfig = {
  dev1: {
    label: "Developer #1",
    color: "hsl(var(--chart-1))",
  },
  dev2: {
    label: "Developer #2",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

// Configuración para el gráfico de tiempo estimado
const timeEstimationConfig = {
  estimatedTime: {
    label: "Estimated Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// Configuración para el gráfico de tendencia de tareas
const taskTrendConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--chart-2))",
  },
  sprint1: {
    label: "Sprint1",
    color: "hsl(var(--chart-1))",
  },
  sprint2: {
    label: "Sprint2",
    color: "hsl(var(--chart-2))",
  },
  sprint3: {
    label: "Sprint3",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

// Configuración para el gráfico de eficiencia
const efficiencyConfig = {
  efficiency: {
    label: "Efficiency",
    color: "hsl(var(--chart-1))",
  },
  dev1: {
    label: "Developer #1",
    color: "hsl(var(--chart-1))",
  },
  dev2: {
    label: "Developer #2",
    color: "hsl(var(--chart-2))",
  },
  dev3: {
    label: "Developer #3",
    color: "hsl(var(--chart-3))",
  },
  dev4: {
    label: "Developer #4",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function KpiDashboard() {
  const [selectedSprint, setSelectedSprint] = useState<string>("all")

  // Filtrar datos según el sprint seleccionado
  const filteredSprintKpis =
    selectedSprint === "all" ? sprintKpis : sprintKpis.filter((sprint) => sprint.id.toString() === selectedSprint)

  // Filtrar desarrolladores según el sprint seleccionado (simulado, ya que no tenemos relación directa)
  // En un caso real, necesitaríamos datos que relacionen desarrolladores con sprints
  const filteredDeveloperKpis = selectedSprint === "all" ? developerKpis : developerKpis // En un caso real, filtrar por sprint

  // Calcular totales para las tarjetas de métricas basados en los datos filtrados
  const totalTasks = filteredSprintKpis.reduce((acc, sprint) => acc + sprint.totalTasks, 0)
  const completedTasks = filteredSprintKpis.reduce((acc, sprint) => acc + sprint.completedTasks, 0)
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const totalStoryPoints = filteredSprintKpis.reduce((acc, sprint) => acc + sprint.totalStoryPoints, 0)
  const totalEstimatedTime = filteredSprintKpis.reduce((acc, sprint) => acc + sprint.totalEstimatedTime, 0)

  // Preparar datos para gráficos con los datos filtrados
  const sprintChartData = filteredSprintKpis.map((sprint) => ({
    name: sprint.name,
    totalTasks: sprint.totalTasks,
    completedTasks: sprint.completedTasks,
  }))

  const developerChartData = filteredDeveloperKpis.map((dev) => ({
    name: `Dev #${dev.assigneeId}`,
    totalTasks: dev.totalTasks,
    completedTasks: dev.completedTasks,
  }))

  const developerCompletionData = filteredDeveloperKpis.map((dev) => ({
    name: `Dev #${dev.assigneeId}`,
    completionRate: dev.completionRate,
  }))

  // Datos para el gráfico de puntos de historia (solo incluir desarrolladores con puntos)
  const storyPointsData = filteredDeveloperKpis
    .filter((dev) => dev.totalStoryPoints > 0)
    .map((dev) => ({
      name: `Dev #${dev.assigneeId}`,
      value: dev.totalStoryPoints,
      fill: `var(--color-dev${dev.assigneeId})`,
    }))

  // Datos para el gráfico de tiempo estimado por sprint
  const timeEstimationData = filteredSprintKpis.map((sprint) => ({
    name: sprint.name,
    estimatedTime: sprint.totalEstimatedTime,
  }))

  // Datos para el gráfico radial de eficiencia (relación entre tareas completadas y totales)
  const efficiencyData = [
    {
      name: "Project Efficiency",
      efficiency: completionRate,
      fill: "var(--color-efficiency)",
    },
  ]

  // Datos para el gráfico de área de tendencia de tareas
  const taskTrendData = filteredSprintKpis.map((sprint) => ({
    sprint: sprint.name,
    tasks: sprint.totalTasks,
  }))

  // Datos para el gráfico de línea de tiempo estimado por desarrollador
  const devTimeData = filteredDeveloperKpis.map((dev) => ({
    name: `Dev #${dev.assigneeId}`,
    estimatedTime: dev.totalEstimatedTime,
  }))

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">
            {selectedSprint === "all"
              ? "Project KPI Dashboard"
              : `KPI Dashboard - ${sprintKpis.find((s) => s.id.toString() === selectedSprint)?.name || ""}`}
          </h1>

          <Select value={selectedSprint} onValueChange={setSelectedSprint}>
            <SelectTrigger className="w-[180px] mt-4 md:mt-0">
              <SelectValue placeholder="All Sprints" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              {sprintKpis.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id.toString()}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalTasks}</div>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedSprint === "all"
                  ? "Across all sprints"
                  : `In ${sprintKpis.find((s) => s.id.toString() === selectedSprint)?.name || ""}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                <div className="flex items-center text-red-500">
                  <ArrowDown className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Story Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalStoryPoints}</div>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total story points{" "}
                {selectedSprint === "all"
                  ? "across all sprints"
                  : `in ${sprintKpis.find((s) => s.id.toString() === selectedSprint)?.name || ""}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalEstimatedTime.toFixed(1)}h</div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total estimated hours{" "}
                {selectedSprint === "all"
                  ? "for all tasks"
                  : `in ${sprintKpis.find((s) => s.id.toString() === selectedSprint)?.name || ""}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de barras para rendimiento de sprint */}
          <Card>
            <CardHeader>
              <CardTitle>Sprint Performance</CardTitle>
              <CardDescription>Tasks by sprint</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sprintChartConfig} className="h-[300px]">
                <BarChart data={sprintChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="totalTasks"
                    fill="var(--color-totalTasks)"
                    radius={4}
                    activeBar={({ ...props }) => {
                      return (
                        <Rectangle
                          {...props}
                          fillOpacity={0.8}
                          stroke={props.fill}
                          strokeDasharray={4}
                          strokeDashoffset={4}
                        />
                      )
                    }}
                  />
                  <Bar dataKey="completedTasks" fill="var(--color-completedTasks)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de área para tendencia de tareas */}
          <Card>
            <CardHeader>
              <CardTitle>Task Trend</CardTitle>
              <CardDescription>Task count evolution across sprints</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={taskTrendConfig} className="h-[300px]">
                <AreaChart data={taskTrendData}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-tasks)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-tasks)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="sprint" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="var(--color-tasks)"
                    fillOpacity={1}
                    fill="url(#colorTasks)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de línea para tiempo estimado por desarrollador */}
          <Card>
            <CardHeader>
              <CardTitle>Developer Time Estimation</CardTitle>
              <CardDescription>Estimated time by developer</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={timeEstimationConfig} className="h-[300px]">
                <LineChart data={devTimeData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="estimatedTime"
                    stroke="var(--color-estimatedTime)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-estimatedTime)" }}
                    activeDot={{ r: 6 }}
                  >
                    <LabelList
                      dataKey="estimatedTime"
                      position="top"
                      formatter={(value: number) => `${value}h`}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico radial para eficiencia del proyecto */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Project Efficiency</CardTitle>
              <CardDescription>Task completion rate</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={efficiencyConfig} className="mx-auto aspect-square max-h-[250px]">
                <RadialBarChart data={efficiencyData} innerRadius={60} outerRadius={120} startAngle={180} endAngle={0}>
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {completionRate.toFixed(1)}%
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 4} className="fill-muted-foreground">
                                Efficiency
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  <RadialBar
                    dataKey="efficiency"
                    cornerRadius={10}
                    fill="var(--color-efficiency)"
                    background={{ fill: "var(--muted)" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {completionRate > 30 ? (
                  <>
                    Trending up from last sprint <TrendingUp className="h-4 w-4 text-green-500" />
                  </>
                ) : (
                  <>
                    Trending down from last sprint <ArrowDown className="h-4 w-4 text-red-500" />
                  </>
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Tercera fila de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de barras horizontal para tasa de finalización por desarrollador */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Developer Completion Rate</CardTitle>
              <CardDescription>Percentage of tasks completed by developer</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={completionRateConfig} className="h-[250px]">
                <BarChart
                  data={developerCompletionData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid horizontal strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                  <ChartTooltip content={<ChartTooltipContent valueFormatter={(value) => `${value}%`} />} />
                  <Bar dataKey="completionRate" fill="var(--color-completionRate)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de pastel para distribución de puntos de historia */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Story Points Distribution</CardTitle>
              <CardDescription>By developer</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={storyPointsConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={storyPointsData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {storyPointsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                                {totalStoryPoints}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Story Points
                              </tspan>
                            </text>
                          )
                        }
                        return null
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                <div className="flex gap-2">
                  {storyPointsData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span>
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Cuarta fila de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Gráfico de barras para rendimiento de desarrollador */}
          <Card>
            <CardHeader>
              <CardTitle>Developer Performance</CardTitle>
              <CardDescription>Tasks and completion rates by developer</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={developerChartConfig} className="h-[300px]">
                <BarChart data={developerChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="totalTasks" fill="var(--color-totalTasks)" radius={4} />
                  <Bar dataKey="completedTasks" fill="var(--color-completedTasks)" radius={4} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de línea para tiempo estimado por sprint */}
          <Card>
            <CardHeader>
              <CardTitle>Sprint Time Estimation</CardTitle>
              <CardDescription>Estimated time by sprint</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={timeEstimationConfig} className="h-[300px]">
                <LineChart data={timeEstimationData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="estimatedTime"
                    stroke="var(--color-estimatedTime)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-estimatedTime)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
