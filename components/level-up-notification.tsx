"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PlayerLevel } from "@/lib/achievement-system"
import { Crown, Sparkles, Zap, Star } from "lucide-react"

interface LevelUpNotificationProps {
  show: boolean
  playerLevel: PlayerLevel
  onDismiss?: () => void
}

export function LevelUpNotification({ show, playerLevel, onDismiss }: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="border-4 border-yellow-400 bg-gradient-to-br from-yellow-900/90 to-orange-900/90 
                       shadow-2xl backdrop-blur-sm max-w-md w-full mx-4 relative overflow-hidden">
        
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 animate-pulse" />
        
        {/* Rayos de luz */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-yellow-400/50 to-transparent 
                         transform -translate-x-1/2 animate-pulse" />
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/50 to-transparent 
                         transform -translate-y-1/2 animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <CardContent className="p-8 text-center relative z-10">
          {/* Ícono principal */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 
                             flex items-center justify-center shadow-2xl animate-bounce">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              {/* Efectos de partículas alrededor */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-spin" />
              <Zap className="absolute -bottom-2 -left-2 w-6 h-6 text-orange-400 animate-pulse" />
              <Star className="absolute top-2 -left-4 w-4 h-4 text-yellow-300 animate-ping" />
              <Star className="absolute -top-4 left-2 w-4 h-4 text-orange-300 animate-ping" 
                   style={{ animationDelay: "0.5s" }} />
            </div>
          </div>

          {/* Texto principal */}
          <h1 className="text-3xl font-bold text-white mb-2 animate-pulse">
            🎊 ¡SUBIDA DE NIVEL!
          </h1>
          
          <div className="text-6xl font-bold text-yellow-400 mb-4 animate-bounce">
            {playerLevel.level}
          </div>

          <h2 className="text-xl font-semibold text-white mb-4">
            {playerLevel.title}
          </h2>

          {/* XP y progreso */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>XP Total: {playerLevel.xp.toLocaleString()}</span>
              <span>Siguiente: {playerLevel.xpToNext > 0 ? playerLevel.xpToNext.toLocaleString() : "MAX"}</span>
            </div>
            
            {playerLevel.xpToNext > 0 && (
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                  style={{ 
                    width: `${100 - (playerLevel.xpToNext / (playerLevel.xpToNext + 100)) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>

          {/* Beneficios desbloqueados */}
          {playerLevel.perks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">🎁 Nuevos Beneficios:</h3>
              <div className="space-y-2">
                {playerLevel.perks.slice(-2).map((perk, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="border-yellow-400 text-yellow-400 text-sm py-1 px-3 animate-pulse"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {perk}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recompensa */}
          <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Recompensa de Nivel</span>
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-300">
              +${(playerLevel.level * 200).toLocaleString()}B PIB
            </div>
          </div>

          {/* Botón para cerrar */}
          <button
            onClick={() => {
              setIsVisible(false)
              onDismiss?.()
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 
                       text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 
                       transition-all duration-200 animate-pulse"
          >
            ¡Continuar Conquistando!
          </button>
        </CardContent>

        {/* Efectos de partículas flotantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  )
} 