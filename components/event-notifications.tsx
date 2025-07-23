"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GameEvent } from "@/lib/types"
import { X, AlertTriangle, Info, CheckCircle, XCircle, Clock } from "lucide-react"

interface EventNotificationsProps {
  events: GameEvent[]
  onDismiss: (eventId: string) => void
}

export function EventNotifications({ events, onDismiss }: EventNotificationsProps) {
  const [visibleEvents, setVisibleEvents] = useState<GameEvent[]>([])
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Obtener los eventos más recientes
    const recentEvents = events.slice(-3)
    
    // Identificar eventos completamente nuevos que no están en visibleEvents
    const newEvents = recentEvents.filter(event => 
      !visibleEvents.find(visible => visible.id === event.id)
    )

    if (newEvents.length > 0) {
      // Para cada evento nuevo, agregarlo arriba y remover el más antiguo si excede 3
      newEvents.forEach(newEvent => {
        setVisibleEvents(prev => {
          const updated = [newEvent, ...prev] // Nuevo evento arriba
          
          // Si tenemos más de 3, remover el más antiguo (último en el array)
          if (updated.length > 3) {
            const oldestEvent = updated[updated.length - 1]
            // Animar salida del más antiguo
            setAnimatingOut(animOut => new Set([...animOut, oldestEvent.id]))
            
            // Remover después de la animación
            setTimeout(() => {
              setVisibleEvents(current => current.filter(e => e.id !== oldestEvent.id))
              setAnimatingOut(animOut => {
                const newSet = new Set(animOut)
                newSet.delete(oldestEvent.id)
                return newSet
              })
            }, 500)
            
            return updated.slice(0, 3) // Mantener solo los 3 más recientes
          }
          
          return updated
        })
        
        // Auto-dismiss después de 8 segundos
        setTimeout(() => {
          handleDismiss(newEvent.id)
        }, 8000)
      })
    }
  }, [events])

  const handleDismiss = (eventId: string) => {
    // Iniciar animación de salida
    setAnimatingOut((prev) => new Set([...prev, eventId]))

    // Remover después de la animación de deslizamiento
    setTimeout(() => {
      setVisibleEvents((prev) => prev.filter((e) => e.id !== eventId))
      setAnimatingOut((prev) => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
      onDismiss(eventId)
    }, 500) // Aumentado para dar tiempo a la animación de deslizamiento
  }

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
        return "border-green-500/70 bg-green-900/60 shadow-green-500/30"
      case "warning":
        return "border-yellow-500/70 bg-yellow-900/60 shadow-yellow-500/30"
      case "error":
        return "border-red-500/70 bg-red-900/60 shadow-red-500/30"
      default:
        return "border-blue-500/70 bg-blue-900/60 shadow-blue-500/30"
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  if (visibleEvents.length === 0) return null

  const getTypeLabel = (type: string) => {
  switch (type) {
    case "success":
      return "Evento Positivo"
    case "warning":
      return "Aviso"
    case "error":
      return "Evento Negativo"
    default:
      return "Información"
  }
}

return (
    <div className="fixed bottom-4 left-4 space-y-3 z-50 max-w-sm flex flex-col-reverse">
      {visibleEvents.map((event, index) => {
        const Icon = getEventIcon(event.type)
        const isAnimatingOut = animatingOut.has(event.id)
        const isNewest = index === 0

        return (
          <Card
            key={event.id}
            className={`
              ${getEventColor(event.type)} 
              border shadow-lg backdrop-blur-sm
              transform transition-all duration-500 ease-in-out
              ${
                isAnimatingOut
                  ? "-translate-x-[120%] opacity-0 scale-90 rotate-[-2deg]"
                  : isNewest
                  ? "translate-x-0 opacity-100 scale-100 animate-in slide-in-from-left"
                  : "translate-x-0 opacity-100 scale-100"
              }
              hover:scale-105 hover:shadow-xl
            `}
            style={{
              animationDelay: isNewest ? "0ms" : `${index * 50}ms`,
              animationDuration: "400ms",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white text-sm truncate">{event.title}</h4>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(event.timestamp)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-white/10 opacity-70 hover:opacity-100"
                        onClick={() => handleDismiss(event.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 mb-2 line-clamp-2">{event.description}</p>

                  {event.effects && event.effects.length > 0 && (
                    <div className="space-y-1">
                      {event.effects.slice(0, 2).map((effect, effectIndex) => (
                        <div key={effectIndex} className="text-xs text-gray-400 flex items-center gap-1">
                          <div className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                          <span className="truncate">{effect}</span>
                        </div>
                      ))}
                      {event.effects.length > 2 && (
                        <div className="text-xs text-gray-500">+{event.effects.length - 2} más...</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de progreso para auto-dismiss */}
              <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-current opacity-70 rounded-full ${
                    isAnimatingOut ? '' : 'animate-countdown-shrink'
                  }`}
                  style={{
                    width: isAnimatingOut ? '0%' : '100%',
                    transformOrigin: 'left'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
