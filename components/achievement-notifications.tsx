"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Achievement } from "@/lib/achievement-system"
import { Trophy, Star, Crown, Zap } from "lucide-react"

interface AchievementNotificationsProps {
  achievements: Achievement[]
  onDismiss?: (achievementId: string) => void
}

export function AchievementNotifications({ achievements, onDismiss }: AchievementNotificationsProps) {
  const [visibleAchievements, setVisibleAchievements] = useState<Achievement[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sistema simplificado: mostrar todos los logros a la vez
  useEffect(() => {
    if (achievements.length === 0) {
      setVisibleAchievements([])
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Detectar nuevos logros
    const currentIds = visibleAchievements.map(a => a.id)
    const newAchievements = achievements.filter(a => !currentIds.includes(a.id))

    if (newAchievements.length > 0) {
      console.log(`🏆 Mostrando ${newAchievements.length} logros simultáneamente`)
      
      // Mostrar todos los nuevos logros inmediatamente
      setVisibleAchievements(prev => [...prev, ...newAchievements])

      // Auto-dismiss todos después de 2.5 segundos
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        console.log(`🎊 Ocultando todos los logros`)
        setVisibleAchievements([])
        timeoutRef.current = null
      }, 2500) // 2.5 segundos
    }
  }, [achievements, visibleAchievements])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getRarityIcon = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case "common": return <Star className="w-4 h-4 text-gray-400" />
      case "rare": return <Star className="w-4 h-4 text-blue-400" />
      case "epic": return <Crown className="w-4 h-4 text-purple-400" />
      case "legendary": return <Zap className="w-4 h-4 text-yellow-400" />
    }
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case "common": return "border-gray-500 bg-gray-900/90"
      case "rare": return "border-blue-500 bg-blue-900/90"
      case "epic": return "border-purple-500 bg-purple-900/90"
      case "legendary": return "border-yellow-500 bg-yellow-900/90"
    }
  }

  const getRarityText = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case "common": return "Común"
      case "rare": return "Raro"
      case "epic": return "Épico"
      case "legendary": return "Legendario"
    }
  }

  const handleDismiss = (achievementId: string) => {
    console.log(`🗑️ Ocultando logro: ${achievementId}`)
    
    // Remover de la lista visible
    setVisibleAchievements(prev => prev.filter(a => a.id !== achievementId))
    
    onDismiss?.(achievementId)
  }

  if (visibleAchievements.length === 0) return null

  return (
    <>
      {/* CSS personalizado para la animación de la barra de tiempo */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
      
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-xs">
      {visibleAchievements.map((achievement, index) => (
        <Card
          key={achievement.id}
          className={`${getRarityColor(achievement.rarity)} border-2 shadow-2xl backdrop-blur-sm 
                     animate-in slide-in-from-right duration-700 hover:scale-105 transition-all
                     cursor-pointer group relative overflow-hidden
                     animate-pulse hover:animate-none`}
          style={{ 
            animationDelay: `${index * 100}ms`,
            transform: 'translateX(0)',
            opacity: 1
          }}
          onClick={() => handleDismiss(achievement.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              {/* Ícono principal MÁS PEQUEÑO */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Contenido MÁS COMPACTO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-bold text-white text-xs truncate">
                    🏆 LOGRO
                  </h3>
                  {getRarityIcon(achievement.rarity)}
                </div>
                
                <h4 className="font-semibold text-white text-sm mb-1">
                  {achievement.name}
                </h4>
                
                <p className="text-gray-300 text-xs mb-1 leading-tight line-clamp-2">
                  {achievement.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      achievement.rarity === "legendary" ? "border-yellow-400 text-yellow-400" :
                      achievement.rarity === "epic" ? "border-purple-400 text-purple-400" :
                      achievement.rarity === "rare" ? "border-blue-400 text-blue-400" :
                      "border-gray-400 text-gray-400"
                    }`}
                  >
                    {getRarityText(achievement.rarity)}
                  </Badge>

                  <div className="text-xs text-green-400 font-medium">
                    {achievement.reward.description}
                  </div>
                </div>

                {/* Barra de tiempo restante MÁS PEQUEÑA */}
                <div className="mt-1 w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-[2500ms] ease-linear"
                    style={{ 
                      width: "100%",
                      animation: "shrink 2.5s linear forwards"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Efectos simplificados */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Solo 2 partículas pequeñas */}
              <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute bottom-2 right-4 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping" 
                   style={{ animationDelay: "1s" }} />
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </>
  )
} 