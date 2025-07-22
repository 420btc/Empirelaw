"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    setVisibleAchievements(achievements)
  }, [achievements])

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
    setVisibleAchievements(prev => prev.filter(a => a.id !== achievementId))
    onDismiss?.(achievementId)
  }

  if (visibleAchievements.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {visibleAchievements.map((achievement, index) => (
        <Card
          key={achievement.id}
          className={`${getRarityColor(achievement.rarity)} border-2 shadow-2xl backdrop-blur-sm 
                     animate-in slide-in-from-right duration-500 hover:scale-105 transition-all
                     cursor-pointer group`}
          style={{ animationDelay: `${index * 200}ms` }}
          onClick={() => handleDismiss(achievement.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Ícono principal */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 
                               flex items-center justify-center text-2xl shadow-lg animate-pulse">
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
              </div>
            </div>

            {/* Efectos de partículas */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute top-4 right-6 w-1 h-1 bg-yellow-300 rounded-full animate-ping" 
                   style={{ animationDelay: "0.5s" }} />
              <div className="absolute top-6 right-4 w-1 h-1 bg-yellow-500 rounded-full animate-ping" 
                   style={{ animationDelay: "1s" }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 