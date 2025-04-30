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

vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children }) => <div data-testid="pie">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ children }) => <div data-testid="bar">{children}</div>,
    XAxis: ({ children }) => <div data-testid="x-axis">{children}</div>,
    YAxis: ({ children }) => <div data-testid="y-axis">{children}</div>,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Cell: () => <div data-testid="cell" />,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    Line: ({ children }) => <div data-testid="line">{children}</div>,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: ({ children }) => <div data-testid="area">{children}</div>,
    LabelList: ({ children }) => <div data-testid="label-list">{children}</div>,
    Label: ({ content }) => {
      if (typeof content === "function") {
        return content({ cx: 100, cy: 100 })
      }
      return <div data-testid="label" />
    },
    PolarRadiusAxis: ({ children }) => <div data-testid="polar-radius-axis">{children}</div>,
    RadialBar: ({ children }) => <div data-testid="radial-bar">{children}</div>,
    RadialBarChart: ({ children }) => <div data-testid="radial-bar-chart">{children}</div>,
    Rectangle: (props) => <div data-testid="rectangle" {...props} />,
  }
})

vi.mock("../components/Layout", () => ({
  Layout: ({ children }) => <div data-testid="layout">{children}</div>,
}))

