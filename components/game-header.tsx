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
} from "lucide-react"

interface GameHeaderProps {
  playerCountry: Country | null
  gameStats: GameStats
  actionHistory: ActionHistory[]
  events: GameEvent[]
  onShowEventHistory: () => void
}

export function GameHeader({ playerCountry, gameStats, actionHistory, events, onShowEventHistory }: GameHeaderProps) {
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

  const recentActions = actionHistory.slice(-15).reverse()

  // Calcular progreso hacia la dominación mundial
  const totalCountries = 30
  const stableCountries = gameStats.countriesControlled
  const progressPercentage = Math.round((stableCountries / totalCountries) * 100)

  return (
    <div className="space-y-2">
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white">GeoPolitics 2025</h1>
              </div>

              {playerCountry && (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">{playerCountry.name}</span>
                  <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                    {playerCountry.president}
                  </Badge>
                </div>
              )}

              {/* Objetivo del juego */}
              <div className="flex items-center gap-2 bg-purple-900/30 px-3 py-1 rounded-lg border border-purple-500/30">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Dominación Mundial: {progressPercentage}%</span>
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Primera fila de estadísticas */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Año {gameStats.currentYear}</span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">PIB: ${gameStats.globalGDP}T</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  Territorios: {gameStats.countriesControlled}/{totalCountries}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Población: {gameStats.globalPopulation}B</span>
              </div>

              <Badge variant={gameStats.globalStability >= 70 ? "default" : "destructive"}>
                Estabilidad: {gameStats.globalStability}%
              </Badge>
            </div>

            {/* Segunda fila de estadísticas avanzadas */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              {/* Indicador de Caos */}
              <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded-lg border border-gray-600/30">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300 text-sm">Caos:</span>
                <span className={`font-semibold ${getChaosColor(gameStats.chaosLevel)}`}>
                  {gameStats.chaosLevel}%
                </span>
              </div>

              {/* Contador de eventos */}
              <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded-lg border border-gray-600/30">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Eventos:</span>
                <span className="text-blue-400 font-semibold">{gameStats.eventsThisSession}</span>
                {gameStats.negativeEventsBlocked > 0 && (
                  <span className="text-green-400 text-xs">({gameStats.negativeEventsBlocked} bloq.)</span>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowEventHistory}
                  className="border-purple-600 hover:border-purple-500 relative bg-transparent"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Eventos
                  {events.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                      {events.length > 99 ? "99+" : events.length}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="border-gray-600 hover:border-gray-500"
                >
                  <History className="w-4 h-4 mr-1" />
                  Historial
                  {showHistory ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </Button>
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
