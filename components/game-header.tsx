"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Country, GameStats, ActionHistory, GameEvent } from "@/lib/types"
import {
  Crown,
  Globe,
  TrendingUp,
  Users,
  Calendar,
  History,
  ChevronDown,
  ChevronUp,
  Bell,
  Target,
  AlertTriangle,
  Shield,
  MessageCircle,
  Star,
  Zap,
  Settings,
  Clock,
} from "lucide-react"

interface GameHeaderProps {
  unseenAchievementsCount?: number;
  playerCountry: Country | null
  gameStats: GameStats
  actionHistory: ActionHistory[]
  events: GameEvent[]
  onShowEventHistory: () => void
  onShowDiplomacy?: () => void
  onShowTrade?: () => void
  onShowAchievements?: () => void
  onShowAISettings?: () => void
  playerLevel?: {
    level: number
    xp: number
    xpToNext: number
    title: string
    perks: string[]
  }
  gameProgression?: {
    totalXP: number
    level: number
    achievements: string[]
    unlockedUpgrades: string[]
    lastAchievementTime: number
    streak: number
    playTime: number
  }
  eventStreak?: {
    type: string
    count: number
  }
  gameTime?: number
  isClockAnimating?: boolean
}

export function GameHeader({ playerCountry, gameStats, actionHistory, events, onShowEventHistory, onShowDiplomacy, onShowTrade, onShowAchievements, onShowAISettings, playerLevel, gameProgression, unseenAchievementsCount = 0, eventStreak, gameTime = 0, isClockAnimating = false }: GameHeaderProps) {
  const [showHistory, setShowHistory] = useState(false)

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, string> = {
      economic_investment: "💰",
      social_policy: "👥",
      military_action: "⚔️",
      geoengineering: "🌪️",
      masonic_influence: "👁️",
      diplomatic_alliance: "🤝",
      economic_sanction: "📉",
      cyber_attack: "💻",
      regime_change: "👑",
      trade_agreement: "🚛",
      world_event: "🌍",
      trade_executed: "💰",
      conquest: "🏴",
      special_conquest: "👑",
      contagion_event: "🌊",
    }
    return icons[actionType] || "⚡"
  }

  const getActionColor = (success: boolean) => {
    return success ? "text-green-400" : "text-red-400"
  }

  const getChaosColor = (chaosLevel: number) => {
    if (chaosLevel <= 25) return "text-green-400"
    if (chaosLevel <= 50) return "text-yellow-400"
    if (chaosLevel <= 75) return "text-orange-400"
    return "text-red-400"
  }

  const getChaosText = (chaosLevel: number) => {
    if (chaosLevel <= 25) return "Estable"
    if (chaosLevel <= 50) return "Moderado"
    if (chaosLevel <= 75) return "Alto"
    return "Crítico"
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatGameTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const recentActions = actionHistory.slice(-15).reverse()

  // Calcular progreso hacia la dominación mundial
  const totalCountries = 74
  const stableCountries = gameStats.countriesControlled
  const progressPercentage = Math.round((stableCountries / totalCountries) * 100)

  return (
    <div className="space-y-2">
      <Card className="bg-slate-800/50 border-cyan-500/30 min-h-[160px] max-h-[160px]">
        <CardContent className="p-4 h-full">
          <div className="flex flex-col gap-2 h-full justify-between">
            {/* Primera fila: Título y país del jugador */}
            <div className="flex items-center justify-between min-h-[52px] max-h-[52px] overflow-hidden">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-cyan-400" />
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      <span className="mr-1">Geo Law</span>
                      <span>Empire</span>
                    </h1>
                    <span className="text-xs text-cyan-400 font-medium -mt-1">2025</span>
                  </div>
                </div>
                
                {/* Reloj de tiempo de juego */}
                <div className={`flex items-center gap-2 bg-slate-800/70 px-3 py-2 rounded-lg border transition-all duration-500 ${
                  isClockAnimating 
                    ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20 scale-105' 
                    : 'border-slate-600/50'
                }`}>
                  <Clock className={`w-4 h-4 transition-all duration-500 ${
                    isClockAnimating 
                      ? 'text-yellow-400 animate-pulse' 
                      : 'text-slate-400'
                  }`} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-mono font-bold transition-colors duration-500 ${
                      isClockAnimating ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {formatGameTime(gameTime)}
                    </span>
                    <span className="text-xs text-slate-400">Tiempo de Juego</span>
                  </div>
                  {isClockAnimating && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                  )}
                </div>
              </div>

              {playerCountry && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-semibold">{playerCountry.name}</span>
                    <Badge variant="outline" className="border-cyan-500 text-cyan-400 text-xs">
                      {playerCountry.president}
                    </Badge>
                  </div>

                  {/* Progresión del jugador */}
                  {playerLevel && gameProgression && (
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">Lv.{playerLevel.level}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="text-xs text-gray-300 truncate max-w-24" title={playerLevel.title}>
                          {playerLevel.title.replace(/[🌱🏛️⚔️🌟👑🌍🔥⚡🌌👹]/g, '')}
                        </div>
                        <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                            style={{ 
                              width: playerLevel.xpToNext > 0 
                                ? `${Math.max(10, 100 - (playerLevel.xpToNext / (playerLevel.xpToNext + 50)) * 100)}%`
                                : "100%"
                            }}
                          />
                        </div>
                      </div>

                      {gameProgression.streak > 0 && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-400" />
                          <span className="text-orange-400 font-bold text-xs">{gameProgression.streak}</span>
                        </div>
                      )}
                      
                      {/* Racha de eventos */}
                      {eventStreak && eventStreak.count >= 2 && (
                        <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded border border-purple-500/30">
                          <div className={`w-2 h-2 rounded-full ${
                            eventStreak.type === 'positive' ? 'bg-green-400' :
                            eventStreak.type === 'negative' ? 'bg-red-400' :
                            'bg-yellow-400'
                          }`} />
                          <span className={`font-bold text-xs ${
                            eventStreak.type === 'positive' ? 'text-green-400' :
                            eventStreak.type === 'negative' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>
                            {eventStreak.count}x {eventStreak.type === 'positive' ? '📈' : eventStreak.type === 'negative' ? '📉' : '⚖️'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Segunda fila: Estadísticas principales en línea horizontal */}
            <div className="flex items-center justify-between gap-4 text-sm min-h-[32px] max-h-[32px] overflow-hidden">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300">Año {gameStats.currentYear}</span>
                </div>

                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-gray-300">PIB Global: ${gameStats.globalGDP}T</span>
                  {playerCountry && (
                    <Badge variant="outline" className="border-green-500 text-green-400 text-xs ml-1">
                      Tu PIB: ${playerCountry.economy.gdp}B
                      {playerCountry.lastGDPGrowth && (
                        <span className="ml-1">
                          {playerCountry.lastGDPGrowth > 0 ? '+' : ''}${playerCountry.lastGDPGrowth}B
                        </span>
                      )}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-300">
                    Territorios: {gameStats.countriesControlled}/{totalCountries}
                  </span>
                </div>

                <Badge variant={gameStats.globalStability >= 70 ? "default" : "destructive"} className="text-xs">
                  Estabilidad: {gameStats.globalStability}%
                </Badge>
              </div>

              {/* Estadísticas avanzadas a la derecha */}
              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                {/* Indicador de Caos */}
                <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded border border-gray-600/30">
                  <AlertTriangle className="w-3 h-3 text-orange-400" />
                  <span className="text-gray-300">Caos:</span>
                  <span className={`font-semibold ${getChaosColor(gameStats.chaosLevel)}`}>
                    {gameStats.chaosLevel}%
                  </span>
                </div>

                {/* Contador de eventos */}
                <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded border border-gray-600/30">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-300">Eventos:</span>
                  <span className="text-blue-400 font-semibold">{gameStats.eventsThisSession}</span>
                  {gameStats.negativeEventsBlocked > 0 && (
                    <span className="text-green-400">({gameStats.negativeEventsBlocked} bloq.)</span>
                  )}
                </div>

                {/* Botones de acción */}
                {playerCountry && onShowDiplomacy && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowDiplomacy}
                    className="bg-red-600 hover:bg-red-700 border-red-500 text-white font-semibold h-7 px-2 shadow-lg"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    <span className="text-xs">Diplomacia</span>
                  </Button>
                )}

                {playerCountry && onShowTrade && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowTrade}
                    className="bg-green-600 hover:bg-green-700 border-green-500 text-white font-semibold h-7 px-2 shadow-lg"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span className="text-xs">Comercio</span>
                  </Button>
                )}

                {onShowAISettings && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowAISettings}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-500 text-white font-semibold h-7 px-2 shadow-lg"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    <span className="text-xs">IA Config</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowEventHistory}
                  className="bg-purple-600 hover:bg-purple-700 border-purple-500 text-white font-semibold relative h-7 px-2 shadow-lg"
                >
                  <Bell className="w-3 h-3 mr-1" />
                  <span className="text-xs">Eventos</span>
                  {(() => {
                    const unseenCount = events.filter(event => !event.seen).length
                    return unseenCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs animate-pulse"
                      >
                        {unseenCount > 99 ? "99+" : unseenCount}
                      </Badge>
                    )
                  })()}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="border-gray-600 hover:border-gray-500 h-7 px-2"
                >
                  <History className="w-3 h-3 mr-1" />
                  <span className="text-xs">Historial</span>
                  {showHistory ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowAchievements}
                  className="bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white font-semibold relative h-7 px-2 shadow-lg"
                >
                  <Star className="w-3 h-3 mr-1" />
                  <span className="text-xs">Logros</span>
                  {unseenAchievementsCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                      {unseenAchievementsCount > 99 ? "99+" : unseenAchievementsCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Tercera fila: Dominación Mundial - Movida aquí */}
            <div className="flex items-center justify-center min-h-[32px] max-h-[32px] overflow-hidden">
              <div className="flex items-center gap-3 bg-purple-900/40 px-4 py-1 rounded-lg border border-purple-500/40">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-semibold">Dominación Mundial</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-purple-200 text-xs font-bold">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Historial de Acciones */}
      {showHistory && (
        <Card className="bg-slate-800/50 border-red-500/30 animate-in slide-in-from-top duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial de Acciones y Eventos
              </h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-gray-500 text-gray-400">
                  {actionHistory.length} entradas registradas
                </Badge>
                {gameStats.chaosLevel > 50 && (
                  <Badge variant="outline" className="border-orange-500 text-orange-400">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Caos Alto - Eventos Controlados
                  </Badge>
                )}
              </div>
            </div>

            {recentActions.length > 0 ? (
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {recentActions.map((action, index) => (
                    <div
                      key={action.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                        action.type === "world_event"
                          ? action.sourceCountryName.includes("Consecuencia")
                            ? "bg-red-900/20 border-red-600/30" // Eventos causados por el jugador
                            : "bg-purple-900/20 border-purple-600/30" // Eventos naturales
                          : action.type === "conquest"
                            ? "bg-green-900/20 border-green-600/30"
                            : "bg-slate-700/50 border-gray-600/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getActionIcon(action.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{action.actionName}</p>
                          <p className="text-xs text-gray-400">
                            {action.sourceCountryName}
                            {action.targetCountryName && action.targetCountryName !== action.sourceCountryName && (
                              <span> → {action.targetCountryName}</span>
                            )}
                          </p>
                          {action.result && (
                            <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{action.result}</p>
                          )}
                          {/* Nuevo: Mostrar severidad para eventos de karma */}
                          {action.severity && action.severity > 5 && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              <span className="text-xs text-red-400">Alta Severidad ({action.severity}/10)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <p className={`text-sm font-medium ${getActionColor(action.success)}`}>
                            {action.success ? "Éxito" : "Falló"}
                          </p>
                          <p className="text-xs text-gray-400">{formatTime(action.timestamp)}</p>
                        </div>
                        {action.cost > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ${action.cost}B
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay actividad registrada aún</p>
                <p className="text-xs">Las acciones y eventos aparecerán aquí</p>
              </div>
            )}

            {actionHistory.length > 15 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400">
                  Mostrando las últimas 15 entradas de {actionHistory.length} totales
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
