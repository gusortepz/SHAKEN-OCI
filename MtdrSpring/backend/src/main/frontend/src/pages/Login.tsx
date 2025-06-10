"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "@/utils/api";

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

export function Login({ setIsAuthenticated }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_BASE_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      navigate("/");

      toast.success("Login successful", {
        description: "Welcome back!",
      });
    } catch (err) {
      toast.error("Login failed", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Dark section with testimonial */}
      <div className="hidden md:flex md:w-1/2 bg-black text-white flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-boxes"
            >
              <path d="M7 21h10a2 2 0 0 0 2-2v-2H5v2a2 2 0 0 0 2 2Z" />
              <path d="M5 17V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10" />
              <path d="M9 17v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
            </svg>
            <span className="text-xl font-bold">Task Manager</span>
          </div>
        </div>
        <div>
          <blockquote className="text-2xl font-medium mb-4">
            "This app has saved me countless hours of work and helped me deliver
            stunning projects to my clients faster than ever before."
          </blockquote>
          <cite className="text-gray-400">Gustavo Ortiz</cite>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex flex-col p-4 md:p-10">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Log in</h1>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-11"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />

            <button
              type="submit"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-2">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
