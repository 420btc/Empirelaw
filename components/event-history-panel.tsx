"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import type { GameEvent } from "@/lib/types"
import {
  X,
  History,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface EventHistoryPanelProps {
  events: GameEvent[]
  onClose: () => void
}

export function EventHistoryPanel({ events, onClose }: EventHistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")

  const getEventIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle
      case "warning":
        return AlertTriangle
      case "error":
        return XCircle
      default:
        return Info
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500/30 bg-green-900/10"
      case "warning":
        return "border-yellow-500/30 bg-yellow-900/10"
      case "error":
        return "border-red-500/30 bg-red-900/10"
      default:
        return "border-blue-500/30 bg-blue-900/10"
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400 border-green-400"
      case "warning":
        return "text-yellow-400 border-yellow-400"
      case "error":
        return "text-red-400 border-red-400"
      default:
        return "text-blue-400 border-blue-400"
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? "s" : ""}`
    return `hace ${seconds} segundo${seconds > 1 ? "s" : ""}`
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filtrar y ordenar eventos
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === "all" || event.type === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      return sortBy === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    })

  const eventTypeStats = {
    total: events.length,
    success: events.filter((e) => e.type === "success").length,
    warning: events.filter((e) => e.type === "warning").length,
    error: events.filter((e) => e.type === "error").length,
    info: events.filter((e) => e.type === "info").length,
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[85vh] bg-slate-900 border-purple-500/30 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <History className="w-6 h-6" />
              Cronología de Eventos
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-gray-300">
              Total: {eventTypeStats.total}
            </Badge>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Éxitos: {eventTypeStats.success}
            </Badge>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Advertencias: {eventTypeStats.warning}
            </Badge>
            <Badge variant="outline" className="text-red-400 border-red-400">
              Errores: {eventTypeStats.error}
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Info: {eventTypeStats.info}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {/* Controles de filtrado */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-gray-600"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="success">Éxitos</option>
              <option value="warning">Advertencias</option>
              <option value="error">Errores</option>
              <option value="info">Información</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
              className="border-gray-600"
            >
              {sortBy === "newest" ? (
                <TrendingDown className="w-4 h-4 mr-2" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              {sortBy === "newest" ? "Más recientes" : "Más antiguos"}
            </Button>
          </div>

          {/* Lista de eventos */}
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => {
                  const Icon = getEventIcon(event.type)

                  return (
                    <Card
                      key={event.id}
                      className={`${getEventColor(event.type)} border transition-all hover:scale-[1.02] hover:shadow-lg`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{event.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                  {event.type}
                                </Badge>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(event.timestamp)}
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-3">{event.description}</p>

                            {event.effects && event.effects.length > 0 && (
                              <div className="space-y-1 mb-3">
                                <p className="text-xs font-medium text-gray-400">Efectos:</p>
                                {event.effects.map((effect, effectIndex) => (
                                  <div key={effectIndex} className="text-xs text-gray-400 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                                    <span>{effect}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateTime(event.timestamp)}
                              </div>
                              <div className="text-gray-600">#{events.length - index}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No se encontraron eventos</p>
                  <p className="text-sm">
                    {searchTerm || filterType !== "all"
                      ? "Intenta cambiar los filtros de búsqueda"
                      : "Los eventos aparecerán aquí conforme ocurran"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
