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
  playerId: string
  isPlayer1: boolean
}

const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
}

const NUMBER_CLASSES = "bg-slate-700 text-white font-bold flex items-center justify-center text-lg"
const LETTER_CLASSES = "bg-indigo-600 text-white font-bold flex items-center justify-center text-lg"

export function SecretCodeBoard({ secretCodeState, onGuess, disabled = false, playerId, isPlayer1 }: SecretCodeBoardProps) {
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(SECRET_CODE_LENGTH).fill(""))
  const [selectedSlot, setSelectedSlot] = useState(0)

  const { guesses, maxGuesses, phase, player1Secret, player2Secret, currentPlayer, winner, codeType } = secretCodeState
  const type = codeType || 'colors'

  const mySecret = isPlayer1 ? player1Secret : player2Secret
  const opponentSecret = isPlayer1 ? player2Secret : player1Secret
  const myGuesses = guesses.filter(g => g.playerId === playerId)
  
  // My ID tag for currentPlayer check
  const myPlayerTag = isPlayer1 ? "player1" : "player2"
  const isMyTurn = currentPlayer === myPlayerTag

  const getPool = () => {
    if (type === 'numbers') return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    if (type === 'letters') return ["A", "B", "C", "D", "E", "F"]
    return SECRET_CODE_COLORS
  }

  const renderPeg = (value: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg"
    }
    
    if (type === 'colors') {
      return <div className={cn(sizeClasses[size], "rounded-full shadow-md", COLOR_CLASSES[value] || "bg-card")} />
    }
    
    const baseClass = type === 'numbers' ? NUMBER_CLASSES : LETTER_CLASSES
    return (
      <div className={cn(sizeClasses[size], "rounded-full shadow-md", baseClass)}>
        {value}
      </div>
    )
  }

  const handleColorSelect = (color: string) => {
    const newGuess = [...currentGuess]
    newGuess[selectedSlot] = color
    setCurrentGuess(newGuess)
    // Auto-advance
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

  // Setup Phase Rendering
  if (phase === "setup") {
    if (mySecret) {
      return (
        <div className="flex flex-col items-center gap-6 p-8 bg-secondary rounded-xl text-center">
          <div className="animate-pulse">
            <h3 className="text-xl font-bold mb-2">Code Set!</h3>
            <p className="text-muted-foreground">Waiting for opponent to set their secret code...</p>
          </div>
          <div className="flex gap-2 opacity-70">
            {mySecret.map((val, i) => <div key={i}>{renderPeg(val, "md")}</div>)}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center gap-6 p-6 bg-secondary rounded-xl max-w-md w-full">
        <h3 className="font-semibold text-xl">Create Your Secret Code</h3>
        <p className="text-sm text-muted-foreground">
          Choose a combination for your opponent to guess.
        </p>

        {/* Input Area */}
        <div className="flex gap-2 mb-4">
          {currentGuess.map((value, i) => (
            <button
              key={i}
              onClick={() => setSelectedSlot(i)}
              className={cn(
                "rounded-full border-2 transition-all p-0 overflow-hidden",
                selectedSlot === i ? "border-primary ring-2 ring-primary/50 scale-110" : "border-border",
              )}
            >
              {value ? renderPeg(value, "lg") : <div className="w-12 h-12 bg-card" />}
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {getPool().map((value) => (
            <button
              key={value}
              onClick={() => handleColorSelect(value)}
              className="rounded-full transition-transform hover:scale-110 shadow-md p-0 overflow-hidden"
            >
              {renderPeg(value, "md")}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full">
           <Button onClick={handleClear} variant="outline" className="flex-1">Clear</Button>
           <Button onClick={handleSubmit} disabled={currentGuess.some(c => c === "")} className="flex-1">Set Secret Code</Button>
        </div>
      </div>
    )
  }

  // Playing / Finished Phase
  const gameWon = winner === playerId
  const gameLost = winner && winner !== playerId

  return (
    <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-secondary rounded-xl max-w-md w-full">
      <div className="text-center w-full relative">
        <h3 className="font-semibold text-foreground">
           {phase === 'finished' ? (gameWon ? "Victory!" : "Defeat!") : (isMyTurn ? "Your Turn" : "Opponent's Turn")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {phase === 'finished' 
             ? gameWon ? "You cracked the code!" : "Opponent cracked your code!" 
             : `Guess the opponent's code (${myGuesses.length}/${maxGuesses})`}
        </p>
        
        {/* Opponent's Code Reveal if Finished */}
        {phase === 'finished' && opponentSecret && (
          <div className="mt-4 p-3 bg-card rounded-lg border border-border animate-in fade-in zoom-in">
            <p className="text-xs text-muted-foreground mb-2">Opponent's Secret:</p>
            <div className="flex justify-center gap-2">
              {opponentSecret.map((val, i) => <div key={i}>{renderPeg(val, "md")}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Guess History */}
      <div className="space-y-2 w-full max-h-64 overflow-y-auto px-1 scrollbar-thin">
        {myGuesses.map((guess, i) => (
          <div key={i} className="flex items-center gap-2 justify-between p-2 bg-card rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground w-4 font-mono">{i + 1}.</span>
            <div className="flex gap-1">
              {guess.colors.map((value, j) => (
                <div key={j}>{renderPeg(value, "sm")}</div>
              ))}
            </div>
            <div className="flex gap-0.5 items-center justify-end">
              {/* Feedback Pegs */}
              {Array(guess.feedback.correct).fill(0).map((_, k) => (
                 <div key={`c-${k}`} className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" title="Correct position" />
              ))}
              {Array(guess.feedback.misplaced).fill(0).map((_, k) => (
                 <div key={`m-${k}`} className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300 shadow-sm" title="Wrong position" />
              ))}
              {Array(MAX_FEEDBACK_SLOTS - guess.feedback.correct - guess.feedback.misplaced).fill(0).map((_, k) => (
                 <div key={`e-${k}`} className="w-2.5 h-2.5 rounded-full bg-transparent border border-border" />
              ))}
            </div>
          </div>
        ))}
        {myGuesses.length === 0 && (
           <div className="text-center py-8 text-muted-foreground text-sm italic opacity-50">
             No guesses yet. Start cracking the code!
           </div>
        )}
      </div>

      {/* Input Area (Only if playing and my turn) */}
      {phase === 'playing' && (
        <div className={cn("w-full transition-opacity duration-200", !isMyTurn && "opacity-50 pointer-events-none")}>
          <div className="flex flex-col items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
             <div className="flex gap-2">
              {currentGuess.map((value, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSlot(i)}
                  className={cn(
                    "rounded-full border-2 transition-all p-0 overflow-hidden",
                    selectedSlot === i ? "border-primary ring-2 ring-primary/50 scale-105" : "border-border",
                  )}
                >
                  {value ? renderPeg(value, "lg") : <div className="w-12 h-12 bg-card/80" />}
                </button>
              ))}
            </div>
            
            <div className="flex gap-1.5 flex-wrap justify-center px-2">
              {getPool().map((value) => (
                <button
                  key={value}
                  onClick={() => handleColorSelect(value)}
                  disabled={disabled}
                  className="rounded-full hover:scale-110 active:scale-95 transition-transform"
                >
                  {renderPeg(value, "md")}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full mt-1">
               <Button onClick={handleClear} variant="ghost" size="sm" className="flex-1">Clear</Button>
               <Button onClick={handleSubmit} size="sm" disabled={disabled || currentGuess.some(c => c === "")} className="flex-[2]">
                 {isMyTurn ? "Submit Guess" : "Waiting..."}
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const MAX_FEEDBACK_SLOTS = 4
