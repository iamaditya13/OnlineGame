"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SecretCodeState } from "@/lib/game-logic"
import { SECRET_CODE_COLORS, SECRET_CODE_LENGTH } from "@/lib/game-logic"

interface SecretCodeBoardProps {
  secretCodeState: SecretCodeState
  onGuess: (colors: string[]) => void
  disabled?: boolean
}

const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
}

export function SecretCodeBoard({ secretCodeState, onGuess, disabled = false }: SecretCodeBoardProps) {
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(SECRET_CODE_LENGTH).fill(""))
  const [selectedSlot, setSelectedSlot] = useState(0)

  const { guesses, maxGuesses, gameOver, won, secretCode } = secretCodeState

  const handleColorSelect = (color: string) => {
    const newGuess = [...currentGuess]
    newGuess[selectedSlot] = color
    setCurrentGuess(newGuess)
    // Auto-advance to next empty slot
    const nextEmpty = newGuess.findIndex((c, i) => i > selectedSlot && c === "")
    if (nextEmpty !== -1) {
      setSelectedSlot(nextEmpty)
    } else if (selectedSlot < SECRET_CODE_LENGTH - 1) {
      setSelectedSlot(selectedSlot + 1)
    }
  }

  const handleSubmit = () => {
    if (currentGuess.every((c) => c !== "")) {
      onGuess(currentGuess)
      setCurrentGuess(Array(SECRET_CODE_LENGTH).fill(""))
      setSelectedSlot(0)
    }
  }

  const handleClear = () => {
    setCurrentGuess(Array(SECRET_CODE_LENGTH).fill(""))
    setSelectedSlot(0)
  }

  const handleSlotClick = (index: number) => {
    setSelectedSlot(index)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-secondary rounded-xl max-w-md w-full">
      <div className="text-center">
        <h3 className="font-semibold text-foreground">Secret Code (Mastermind)</h3>
        <p className="text-sm text-muted-foreground">
          Crack the {SECRET_CODE_LENGTH}-color code! ({guesses.length}/{maxGuesses} guesses)
        </p>
      </div>

      {gameOver && (
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card w-full">
          <span className={cn("text-sm font-medium", won ? "text-green-500" : "text-red-500")}>
            {won ? "You cracked the code!" : "Game Over! The secret code was:"}
          </span>
          <div className="flex gap-2">
            {secretCode.map((color, i) => (
              <div key={i} className={cn("w-10 h-10 rounded-full shadow-md", COLOR_CLASSES[color])} />
            ))}
          </div>
        </div>
      )}

      {/* Previous guesses */}
      <div className="space-y-3 w-full max-h-64 overflow-auto">
        {guesses.map((guess, i) => (
          <div key={i} className="flex items-center gap-4 justify-between p-2 bg-card rounded-lg">
            <span className="text-xs text-muted-foreground w-6 font-mono">{i + 1}.</span>
            <div className="flex gap-1">
              {guess.colors.map((color, j) => (
                <div key={j} className={cn("w-8 h-8 rounded-full shadow-sm", COLOR_CLASSES[color])} />
              ))}
            </div>
            <div className="flex gap-1 items-center min-w-[60px] justify-end">
              {/* Black pegs - correct position */}
              {Array(guess.feedback.correct)
                .fill(null)
                .map((_, k) => (
                  <div key={`c-${k}`} className="w-3 h-3 rounded-full bg-foreground" title="Correct position" />
                ))}
              {/* White pegs - wrong position */}
              {Array(guess.feedback.misplaced)
                .fill(null)
                .map((_, k) => (
                  <div
                    key={`m-${k}`}
                    className="w-3 h-3 rounded-full bg-muted-foreground border border-foreground"
                    title="Wrong position"
                  />
                ))}
              {/* Empty slots */}
              {Array(SECRET_CODE_LENGTH - guess.feedback.correct - guess.feedback.misplaced)
                .fill(null)
                .map((_, k) => (
                  <div key={`e-${k}`} className="w-3 h-3 rounded-full bg-card border border-border" />
                ))}
            </div>
          </div>
        ))}
      </div>

      {!gameOver && (
        <>
          {/* Current guess */}
          <div className="flex gap-2">
            {currentGuess.map((color, i) => (
              <button
                key={i}
                onClick={() => handleSlotClick(i)}
                className={cn(
                  "w-12 h-12 rounded-full border-2 transition-all",
                  selectedSlot === i ? "border-primary ring-2 ring-primary/50 scale-110" : "border-border",
                  color ? COLOR_CLASSES[color] : "bg-card",
                )}
              />
            ))}
          </div>

          {/* Color palette */}
          <div className="flex gap-2 flex-wrap justify-center">
            {SECRET_CODE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                disabled={disabled}
                className={cn(
                  "w-10 h-10 rounded-full transition-transform hover:scale-110 shadow-md",
                  "border-2 border-transparent hover:border-white/50",
                  COLOR_CLASSES[color],
                )}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleClear} variant="outline" className="border-border text-foreground bg-transparent">
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={disabled || currentGuess.some((c) => c === "")}
              className="bg-primary text-primary-foreground"
            >
              Submit Guess
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Black peg = correct color & position | White peg = correct color, wrong position
          </p>
        </>
      )}
    </div>
  )
}
