"use client"

import { type ReactNode, useState } from "react"
import { Sidebar } from "./Sidebar"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    // The actual filtering will be handled in the Dashboard component
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar selectedDate={selectedDate} onDateSelect={handleDateSelect} />

      <div className="md:ml-[70px] lg:ml-[280px] transition-all duration-300">
        <main className="py-6">{children}</main>
      </div>
    </div>
  )
}
