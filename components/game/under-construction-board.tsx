"use client"

import { Construction } from "lucide-react"

interface UnderConstructionBoardProps {
  gameName: string
  description: string
  specs: string[]
}

export function UnderConstructionBoard({ gameName, description, specs }: UnderConstructionBoardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 max-w-lg text-center">
      <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <Construction className="w-10 h-10 text-yellow-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{gameName}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="w-full p-4 bg-secondary rounded-lg text-left">
        <h3 className="text-sm font-semibold text-foreground mb-3">Coming Soon - Planned Features:</h3>
        <ul className="space-y-2">
          {specs.map((spec, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary">•</span>
              {spec}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        This game is under construction and will be available in a future update.
      </p>
    </div>
  )
}
