"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocalUser } from "@/hooks/use-local-user"
import { useSocket } from "@/hooks/use-socket"
import { Header } from "@/components/layout/header"
import { SidebarFilters } from "@/components/layout/sidebar-filters"
import { GameCard } from "@/components/ui/game-card"
import { CreateRoomModal } from "@/components/ui/create-room-modal"
import { UsernameModal } from "@/components/ui/username-modal"
import { TutorialOverlay } from "@/components/ui/tutorial-overlay"
import { ProfileDialog } from "@/components/ui/profile-dialog"

const GAMES = [
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    description: "Classic 3x3 grid. Get three in a row to win. Quick and turn-based.",
    playerCount: "2 players",
    duration: "2-5 min",
    image: "/tic-tac-toe-game-board-with-x-and-o-symbols-on-blu.jpg",
    category: ["classic", "strategy", "board"],
  },
  {
    id: "connect-4",
    title: "Connect 4",
    description: "Drop colored discs into a 7x6 grid. First to connect four in a row wins.",
    playerCount: "2 players",
    duration: "5-10 min",
    image: "/connect-four-game-board-with-red-and-yellow-chips-.jpg",
    category: ["classic", "strategy", "board"],
  },
  {
    id: "chess",
    title: "Chess",
    description: "Classic strategy game. Checkmate the opponent's king.",
    playerCount: "2 players",
    duration: "15-30 min",
    image: "/chess-game-board-with-pieces-strategy-classic.jpg",
    category: ["classic", "strategy", "board"],
  },
  {
    id: "gomoku",
    title: "Gomoku",
    description: "Strategic game on a 15x15 grid. Place stones to get five in a row.",
    playerCount: "2 players",
    duration: "10-20 min",
    image: "/gomoku-five-in-a-row-game-with-black-and-white-sto.jpg",
    category: ["strategy", "board"],
  },
  {
    id: "secret-code",
    title: "Secret Code",
    description: "Mastermind-style code breaker. Guess the secret code with feedback each round.",
    playerCount: "1-2 players",
    duration: "10-15 min",
    image: "/mastermind-code-breaking-game-with-colorful-pegs-a.jpg",
    category: ["strategy", "classic"],
  },
  {
    id: "go-fish",
    title: "Go Fish",
    description: "Classic card match game. Collect sets of four by asking for ranks.",
    playerCount: "2-4 players",
    duration: "10-20 min",
    image: "/go-fish-card-game-with-playing-cards-and-fish-illu.jpg",
    category: ["card", "classic"],
  },
  {
    id: "battleship",
    title: "Battleship",
    description: "Naval strategy: place a fleet and try to sink opponent ships.",
    playerCount: "2 players",
    duration: "15-30 min",
    image: "/battleship-naval-combat-game-with-ships-and-grid-b.jpg",
    category: ["strategy", "board"],
  },
  {
    id: "war",
    title: "War",
    description: "Simple high-card battle game. Highest card wins each round.",
    playerCount: "2 players",
    duration: "10-20 min",
    image: "/war-card-game-two-playing-cards-face-off-battle-re.jpg",
    category: ["card"],
  },
  {
    id: "rummy",
    title: "Rummy",
    description: "Form sets and runs from your hand and be the first to declare.",
    playerCount: "2-4 players",
    duration: "15-30 min",
    image: "/rummy-card-game-hand-of-cards-with-sets-and-runs-g.jpg",
    category: ["card", "strategy"],
  },
]

export default function LobbyPage() {
  const router = useRouter()
  const { user, isLoading, isSigningIn, createUser, logout, refreshUser } = useLocalUser()
  const { createRoom } = useSocket(user?._id)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<string | undefined>()

  // Check if tutorial should be shown - DISABLED per user request
  // useEffect(() => {
  //   if (user && !user.hasSeenTutorial) {
  //     setTutorialOpen(true)
  //   }
  // }, [user])

  // Listen for manual tutorial and profile triggers
  useEffect(() => {
    const handleOpenTutorial = () => setTutorialOpen(true)
    const handleOpenProfile = () => {
      // @ts-ignore - refreshUser exists in our modified hook
      useLocalUser().refreshUser()
      setProfileOpen(true)
    }

    document.addEventListener("open-tutorial", handleOpenTutorial)
    document.addEventListener("open-profile", handleOpenProfile)
    
    return () => {
      document.removeEventListener("open-tutorial", handleOpenTutorial)
      document.removeEventListener("open-profile", handleOpenProfile)
    }
  }, [])

  const handleTutorialClose = () => {
    setTutorialOpen(false)
    if (user && !user.hasSeenTutorial) {
      // @ts-ignore - updateTutorialStatus exists in our modified hook
      useLocalUser().updateTutorialStatus(true)
    }
  }

  const filteredGames = useMemo(() => {
    return GAMES.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = selectedFilter === "all" || game.category.includes(selectedFilter)
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, selectedFilter])

  const handlePlayGame = (gameId: string) => {
    setSelectedGame(gameId)
    setCreateModalOpen(true)
  }

  const handleCreateRoom = (gameType: string, mode: string, isAiGame: boolean, difficulty: 'easy' | 'medium' | 'hard') => {
    const roomCode = createRoom(gameType, mode, isAiGame, difficulty)
    router.push(`/room/${roomCode}?game=${gameType}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UsernameModal open={!user} onSubmit={createUser} isLoading={isSigningIn} />
      
      <TutorialOverlay open={tutorialOpen} onClose={handleTutorialClose} />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} user={user} onLogout={logout} />

      <CreateRoomModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateRoom={handleCreateRoom}
        selectedGame={selectedGame}
      />

      <Header
        username={user?.username}
        onCreateRoom={() => setCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex">
        <SidebarFilters selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Game Catalog</h1>
              <p className="text-muted-foreground">Click on any game to start playing</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  description={game.description}
                  playerCount={game.playerCount}
                  duration={game.duration}
                  image={game.image}
                  onPlay={() => handlePlayGame(game.id)}
                />
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No games found matching your criteria.</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
