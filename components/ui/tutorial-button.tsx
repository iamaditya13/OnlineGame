"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TutorialButtonProps {
  onClick: () => void
}

export function TutorialButton({ onClick }: TutorialButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onClick} className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Show Tutorial</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Show Tutorial</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
