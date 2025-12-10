"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: number
}

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  currentUserId: string
}

export function ChatPanel({ messages, onSendMessage, currentUserId }: ChatPanelProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center">No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.userId === currentUserId ? "items-end" : "items-start"}`}>
                <span className="text-xs text-muted-foreground mb-1">{msg.username}</span>
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] ${
                    msg.userId === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="bg-input border-border text-foreground"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-primary text-primary-foreground shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
