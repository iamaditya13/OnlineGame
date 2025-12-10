"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GameTutorialProps {
  gameType: string
  open: boolean
  onClose: () => void
}

const TUTORIALS: Record<string, { title: string; instructions: string[] }> = {
  "tic-tac-toe": {
    title: "How to Play Tic-Tac-Toe",
    instructions: [
      "The game is played on a 3x3 grid.",
      "Player 1 is X, Player 2 is O.",
      "Take turns placing your mark in an empty square.",
      "The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner.",
      "If all 9 squares are full and no player has 3 marks in a row, the game is a draw."
    ]
  },
  "connect-4": {
    title: "How to Play Connect 4",
    instructions: [
      "The game is played on a 7x6 grid.",
      "Players take turns dropping colored discs from the top into a seven-column grid.",
      "The pieces fall straight down, occupying the next available space within the column.",
      "The objective is to be the first to form a horizontal, vertical, or diagonal line of four of one's own discs."
    ]
  },
  "chess": {
    title: "How to Play Chess",
    instructions: [
      "Each player starts with 16 pieces: one king, one queen, two rooks, two knights, two bishops, and eight pawns.",
      "The goal is to checkmate the opponent's king.",
      "Checkmate happens when the king is in a position to be captured (in check) and there is no way to move the king out of capture.",
      "Pieces move in specific ways: Rooks move straight, Bishops diagonal, Knights in an L-shape, Queens straight or diagonal, Kings one square in any direction.",
      "Pawns move forward one square, but capture diagonally."
    ]
  },
  "gomoku": {
    title: "How to Play Gomoku",
    instructions: [
      "The game is played on a 15x15 grid.",
      "Players take turns placing stones of their color on an empty intersection.",
      "The winner is the first player to form an unbroken chain of five stones horizontally, vertically, or diagonally."
    ]
  },
  "secret-code": {
    title: "How to Play Secret Code",
    instructions: [
      "The computer generates a secret code of 4 colors.",
      "You have 10 attempts to guess the code.",
      "After each guess, you get feedback:",
      "Correct: Number of colors that are correct and in the correct position.",
      "Misplaced: Number of colors that are correct but in the wrong position."
    ]
  },
  "go-fish": {
    title: "How to Play Go Fish",
    instructions: [
      "The goal is to collect the most sets of 4 cards of the same rank (books).",
      "Ask your opponent for a rank that you already hold in your hand.",
      "If they have it, they must give you all cards of that rank.",
      "If they don't, they say 'Go Fish' and you draw from the deck.",
      "If you get the card you asked for, you go again."
    ]
  },
  "battleship": {
    title: "How to Play Battleship",
    instructions: [
      "First, place your 5 ships on the grid. You can rotate them by pressing 'R' or using the toggle.",
      "Once the game starts, take turns firing shots at the opponent's grid.",
      "If you hit a ship, you get another turn.",
      "The goal is to sink all of your opponent's ships before they sink yours."
    ]
  },
  "war": {
    title: "How to Play War",
    instructions: [
      "The deck is divided evenly between two players.",
      "Each player reveals the top card of their deck.",
      "The player with the higher card takes both cards.",
      "If the cards are equal, it's War! Each player puts one card face down and one face up. The higher face-up card wins all cards."
    ]
  },
  "rummy": {
    title: "How to Play Rummy",
    instructions: [
      "The goal is to form sets (3 or 4 of a kind) or runs (3+ consecutive cards of same suit).",
      "Draw a card from the deck or discard pile at the start of your turn.",
      "Discard a card at the end of your turn.",
      "Declare 'Rummy' when you have formed valid melds with all your cards."
    ]
  }
}

export function GameTutorial({ gameType, open, onClose }: GameTutorialProps) {
  const tutorial = TUTORIALS[gameType]

  if (!tutorial) return null

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{tutorial.title}</DialogTitle>
          <DialogDescription>Read the instructions before you start.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-foreground">
              {tutorial.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </ScrollArea>
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-primary text-primary-foreground">
            Got it, Let's Play!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
