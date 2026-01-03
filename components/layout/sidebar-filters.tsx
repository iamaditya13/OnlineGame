"use client"

import { cn } from "@/lib/utils"
import { Gamepad2, Square, Spade, Brain, CircleDot } from "lucide-react"

interface SidebarFiltersProps {
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

const FILTERS = [
  { id: "all", label: "All Games", icon: Gamepad2 },
  { id: "board", label: "Board Games", icon: Square },
  { id: "card", label: "Card Games", icon: Spade },
  { id: "strategy", label: "Strategy", icon: Brain },
  { id: "classic", label: "Classic", icon: CircleDot },
]

export function SidebarFilters({ selectedFilter, onFilterChange }: SidebarFiltersProps) {
  return (
    <aside className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-border bg-sidebar p-4 block">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider hidden lg:block">Categories</h2>
      <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-1 pb-2 lg:pb-0 scrollbar-hide">
        {FILTERS.map((filter) => {
          const Icon = filter.icon
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "flex-none lg:w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap",
                selectedFilter === filter.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
