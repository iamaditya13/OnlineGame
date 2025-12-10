"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Smile, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [isOpen, setIsOpen] = useState(false)
  const [customTaunts, setCustomTaunts] = useState<string[]>([])
  const [newTaunt, setNewTaunt] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const EMOJIS = ["😀", "😂", "😎", "😭", "😡", "👍", "👎", "🔥", "💀", "👻", "❤️", "🎉", "🤔", "👀", "🤝", "👋"]
  const TAUNTS = [
    "Good game!", "Nice move!", "Oof!", "Checkmate!", 
    "Thinking...", "Lucky!", "Rematch?", "Too easy!",
    "Oops!", "Well played!", "Close one!", "Hurry up!"
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const saved = localStorage.getItem("custom-taunts")
    if (saved) {
      try {
        setCustomTaunts(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse custom taunts", e)
      }
    }
  }, [])

  const saveCustomTaunts = (taunts: string[]) => {
    setCustomTaunts(taunts)
    localStorage.setItem("custom-taunts", JSON.stringify(taunts))
  }

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

  const handleEmojiClick = (emoji: string) => {
    setInput((prev) => prev + emoji)
  }

  const handleTauntClick = (taunt: string) => {
    onSendMessage(taunt)
    setIsOpen(false)
  }

  const handleAddTaunt = () => {
    if (newTaunt.trim()) {
      const updated = [...customTaunts, newTaunt.trim()]
      saveCustomTaunts(updated)
      setNewTaunt("")
    }
  }

  const handleDeleteTaunt = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = customTaunts.filter((_, i) => i !== index)
    saveCustomTaunts(updated)
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
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 border-border text-foreground bg-transparent">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 bg-popover border-border" side="top" align="start">
              <Tabs defaultValue="emojis" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-secondary">
                  <TabsTrigger value="emojis">Emojis</TabsTrigger>
                  <TabsTrigger value="taunts">Taunts</TabsTrigger>
                </TabsList>
                <TabsContent value="emojis" className="p-2">
                  <div className="grid grid-cols-4 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl hover:bg-secondary p-2 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="taunts" className="p-2">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        value={newTaunt} 
                        onChange={(e) => setNewTaunt(e.target.value)}
                        placeholder="New taunt..."
                        className="h-8 text-xs bg-input border-border text-foreground"
                      />
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 shrink-0 bg-secondary text-secondary-foreground"
                        onClick={handleAddTaunt}
                        disabled={!newTaunt.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                      {customTaunts.map((taunt, i) => (
                        <div key={`custom-${i}`} className="flex items-center group">
                          <button
                            onClick={() => handleTauntClick(taunt)}
                            className="flex-1 text-sm text-left px-3 py-2 hover:bg-secondary rounded transition-colors text-foreground truncate"
                          >
                            {taunt}
                          </button>
                          <button 
                            onClick={(e) => handleDeleteTaunt(i, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {customTaunts.length > 0 && <div className="h-px bg-border my-1" />}
                      {TAUNTS.map((taunt) => (
                        <button
                          key={taunt}
                          onClick={() => handleTauntClick(taunt)}
                          className="text-sm text-left px-3 py-2 hover:bg-secondary rounded transition-colors text-foreground"
                        >
                          {taunt}
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

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
