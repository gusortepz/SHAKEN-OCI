"use client";

import { type ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import type { DateRange } from "react-day-picker";

interface LayoutProps {
  children: ReactNode;
  setIsAuthenticated?: (value: boolean) => void;
}

export function Layout({ children, setIsAuthenticated }: LayoutProps) {
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);

  const handleDateRangeSelect = (dateRange: DateRange | undefined) => {
    setSelectedDateRange(dateRange);
    // The actual filtering will be handled in the Dashboard component
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Sidebar
        selectedDateRange={selectedDateRange}
        onDateRangeSelect={handleDateRangeSelect}
        setIsAuthenticated={setIsAuthenticated || (() => {})}
      />

      <div className="md:ml-[70px] lg:ml-[280px] transition-all duration-300">
        <main className="py-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
