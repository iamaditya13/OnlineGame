"use client"

import { Users } from "lucide-react"

const MOCK_FRIENDS = [
  { id: "1", username: "Alex", status: "online", game: "Gomoku" },
  { id: "2", username: "Sam", status: "online", game: null },
  { id: "3", username: "Jordan", status: "away", game: null },
  { id: "4", username: "Casey", status: "offline", game: null },
]

export function SidebarFriends() {
  return (
    <aside className="w-64 border-l border-border bg-sidebar p-4 hidden xl:block">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Friends</h2>
      </div>
      <div className="space-y-2">
        {MOCK_FRIENDS.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
                {friend.username[0]}
              </div>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar",
                  friend.status === "online" && "bg-green-500",
                  friend.status === "away" && "bg-yellow-500",
                  friend.status === "offline" && "bg-muted",
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{friend.username}</p>
              {friend.game && <p className="text-xs text-primary truncate">Playing {friend.game}</p>}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
