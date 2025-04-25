"use client"

import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Login } from "./pages/Login"
import { Dashboard } from "./pages/Dashboard"
import { KpiDashboard } from "./pages/KpiDashboard"
import { Layout } from "./components/Layout"
import { ThemeProvider } from "@/components/theme-provider"
import { parse } from "date-fns"
import { Toaster } from "sonner"

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get("date")

  // Parse date from URL if available
  const selectedDate = dateParam ? parse(dateParam, "yyyy-MM-dd", new Date()) : undefined

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <Dashboard selectedDate={selectedDate} />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="/kpi" element={isAuthenticated ? <KpiDashboard /> : <Navigate to="/login" />} />
      {/* Add more routes as needed */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Layout>
              <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                <p>This is a placeholder for the Dashboard page.</p>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/team"
        element={
          isAuthenticated ? (
            <Layout>
              <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Team</h1>
                <p>This is a placeholder for the Team page.</p>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Layout>
              <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <p>This is a placeholder for the Settings page.</p>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}
