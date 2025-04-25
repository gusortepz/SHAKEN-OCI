"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"

interface TaskFormProps {
  onAddTask: (description: string) => Promise<void>
  isLoading: boolean
}

export function TaskForm({ onAddTask, isLoading }: TaskFormProps) {
  const [description, setDescription] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    await onAddTask(description)
    setDescription("")
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-10">
      <form onSubmit={handleSubmit} className="relative w-full">
        <Input
          placeholder="Add a new task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            if (!description) {
              setIsFocused(false)
            }
          }}
          className="w-full h-12 pr-[120px] transition-all duration-300 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-gray-400 rounded-lg"
          disabled={isLoading}
        />
        <div
          className={`absolute right-1 top-1 transition-opacity duration-300 ${
            isFocused || description
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <Button
            type="submit"
            disabled={isLoading || !description.trim()}
            className="h-10 px-4 gap-2 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="animate-fade-in">Adding...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 animate-fade-in" />
                <span className="animate-fade-in">Add Task</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}