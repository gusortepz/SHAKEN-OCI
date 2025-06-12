"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { KpiDashboard } from "./pages/KpiDashboard";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import { SprintsPage } from "./pages/Sprints";

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setIsAuthenticated(!!e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" />
          ) : (
            <Login setIsAuthenticated={setIsAuthenticated} />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/kpi"
        element={isAuthenticated ? <KpiDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/team"
        element={
          isAuthenticated ? (
            <Layout>
              <Team />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/projects"
        element={
          isAuthenticated ? (
            <Layout>
              <Projects />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/sprints"
        element={
          isAuthenticated ? (
            <Layout>
              <SprintsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}
