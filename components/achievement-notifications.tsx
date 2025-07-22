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

interface QueuedAchievement extends Achievement {
  isVisible: boolean
  showTime: number
}

export function AchievementNotifications({ achievements, onDismiss }: AchievementNotificationsProps) {
  const [queuedAchievements, setQueuedAchievements] = useState<QueuedAchievement[]>([])
  const [visibleAchievements, setVisibleAchievements] = useState<QueuedAchievement[]>([])
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  // Sistema de cascada: cuando llegan nuevos logros, los ponemos en cola
  useEffect(() => {
    if (achievements.length === 0) {
      // Si no hay logros, limpiar todo
      setQueuedAchievements([])
      setVisibleAchievements([])
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current = []
      return
    }

    // Detectar nuevos logros que no están en la cola actual
    const currentIds = queuedAchievements.map(a => a.id)
    const newAchievements = achievements.filter(a => !currentIds.includes(a.id))

    if (newAchievements.length > 0) {
      console.log(`🏆 Nuevos logros detectados: ${newAchievements.length}`)
      
      // Agregar nuevos logros a la cola con cascada
      const newQueuedAchievements = newAchievements.map((achievement, index) => ({
        ...achievement,
        isVisible: false,
        showTime: Date.now() + (index * 1500) // 1.5 segundos entre cada logro
      }))

      setQueuedAchievements(prev => [...prev, ...newQueuedAchievements])

      // Programar la aparición escalonada
      newQueuedAchievements.forEach((queuedAchievement, index) => {
        const timeout = setTimeout(() => {
          console.log(`🎊 Mostrando logro: ${queuedAchievement.name}`)
          
          setQueuedAchievements(prev => 
            prev.map(qa => 
              qa.id === queuedAchievement.id 
                ? { ...qa, isVisible: true }
                : qa
            )
          )
          
          setVisibleAchievements(prev => [...prev, { ...queuedAchievement, isVisible: true }])

          // Auto-dismiss después de 6 segundos
          const dismissTimeout = setTimeout(() => {
            handleDismiss(queuedAchievement.id)
          }, 6000)
          
          timeoutRefs.current.push(dismissTimeout)

        }, index * 1500) // 1.5 segundos entre cada logro
        
        timeoutRefs.current.push(timeout)
      })
    }
  }, [achievements])

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
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
    
    // Remover de ambas listas
    setVisibleAchievements(prev => prev.filter(a => a.id !== achievementId))
    setQueuedAchievements(prev => prev.filter(a => a.id !== achievementId))
    
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
      
      <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
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
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Ícono principal */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg animate-pulse">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm truncate">
                    🏆 ¡LOGRO DESBLOQUEADO!
                  </h3>
                  {getRarityIcon(achievement.rarity)}
                </div>
                
                <h4 className="font-semibold text-white text-base mb-1">
                  {achievement.name}
                </h4>
                
                <p className="text-gray-300 text-xs mb-2 leading-tight">
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

                  <div className="text-xs text-green-400 font-semibold">
                    {achievement.reward.description}
                  </div>
                </div>

                {/* Barra de progreso completa */}
                <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Barra de tiempo restante */}
                <div className="mt-1 w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-[6000ms] ease-linear"
                    style={{ 
                      width: "100%",
                      animation: "shrink 6s linear forwards"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Efectos de partículas mejorados */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Brillo de aparición */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse" />
              
              {/* Partículas flotantes */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute top-4 right-6 w-1 h-1 bg-yellow-300 rounded-full animate-ping" 
                   style={{ animationDelay: "0.5s" }} />
              <div className="absolute top-6 right-4 w-1 h-1 bg-yellow-500 rounded-full animate-ping" 
                   style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-2 right-8 w-1 h-1 bg-orange-400 rounded-full animate-ping" 
                   style={{ animationDelay: "1.5s" }} />
              
              {/* Efecto de destello inicial */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse opacity-50" />
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </>
  )
} 