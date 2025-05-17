import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { KpiDashboard } from "../pages/KpiDashboard"
import { MemoryRouter } from "react-router-dom"
import { act } from "react"

vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token")

vi.mock("../utils/api", () => ({
  getKpi: vi.fn().mockResolvedValue({
    completedTasks: 10,
    pendingTasks: 5,
    averageCompletionTime: 3.5,
    tasksByPriority: {
      HIGH: 5,
      MEDIUM: 7,
      LOW: 3,
    },
    tasksByStatus: {
      TODO: 5,
      INPROGRESS: 3,
      DONE: 10,
    },
    tasksByUser: [
      { userId: 1, userName: "User 1", completedTasks: 5 },
      { userId: 2, userName: "User 2", completedTasks: 3 },
    ],
  }),
  fetchUsers: vi.fn().mockResolvedValue([
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
  ]),
  fetchSprints: vi.fn().mockResolvedValue([
    { id: 1, name: "Sprint 1" },
    { id: 2, name: "Sprint 2" },
  ]),
}))

import React from "react"

vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie">{children}</div>,
    BarChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ children }: { children?: React.ReactNode }) => <div data-testid="bar">{children}</div>,
    XAxis: ({ children }: { children?: React.ReactNode }) => <div data-testid="x-axis">{children}</div>,
    YAxis: ({ children }: { children?: React.ReactNode }) => <div data-testid="y-axis">{children}</div>,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Cell: () => <div data-testid="cell" />,
    LineChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    Line: ({ children }: { children?: React.ReactNode }) => <div data-testid="line">{children}</div>,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    AreaChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
    Area: ({ children }: { children?: React.ReactNode }) => <div data-testid="area">{children}</div>,
    LabelList: ({ children }: { children?: React.ReactNode }) => <div data-testid="label-list">{children}</div>,
    Label: ({ content }: { content?: any }) => {
      if (typeof content === "function") {
        return content({ cx: 100, cy: 100 })
      }
      return <div data-testid="label" />
    },
    PolarRadiusAxis: ({ children }: { children?: React.ReactNode }) => <div data-testid="polar-radius-axis">{children}</div>,
    RadialBar: ({ children }: { children?: React.ReactNode }) => <div data-testid="radial-bar">{children}</div>,
    RadialBarChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="radial-bar-chart">{children}</div>,
    Rectangle: (props: any) => <div data-testid="rectangle" {...props} />,
  }
})

vi.mock("../components/Layout", () => ({
  Layout: ({ children }: { children?: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

describe("KpiDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders correctly", async () => {
    render(
      <MemoryRouter>
        <KpiDashboard />
      </MemoryRouter>
    )

    expect(screen.getByTestId("layout")).toBeInTheDocument()
    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    
  })
})
