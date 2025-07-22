"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Achievement } from "@/lib/achievement-system"
import { X, Trophy, Star, Crown, Zap, Filter, Search } from "lucide-react"

interface AchievementsPanelProps {
  achievements: Achievement[]
  onClose: () => void
}

export function AchievementsPanel({ achievements, onClose }: AchievementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)

  // Estadísticas de logros
  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const completionPercentage = Math.round((unlockedAchievements / totalAchievements) * 100)

  // Filtrar logros
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== "all" && achievement.category !== selectedCategory) return false
    if (selectedRarity !== "all" && achievement.rarity !== selectedRarity) return false
    if (showUnlockedOnly && !achievement.unlocked) return false
    return true
  })

  // Agrupar por categorías
  const categories = {
    all: "Todos",
    economic: "Económicos",
    military: "Militares", 
    diplomatic: "Diplomáticos",
    conquest: "Conquista",
    survival: "Supervivencia",
    special: "Especiales"
  }

  const rarities = {
    all: "Todas",
    common: "Común",
    rare: "Raro",
    epic: "Épico",
    legendary: "Legendario"
  }

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
      case "common": return "border-gray-500 bg-gray-900/20"
      case "rare": return "border-blue-500 bg-blue-900/20"
      case "epic": return "border-purple-500 bg-purple-900/20"
      case "legendary": return "border-yellow-500 bg-yellow-900/20"
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      economic: "💰",
      military: "⚔️",
      diplomatic: "🤝",
      conquest: "🏴",
      survival: "🛡️",
      special: "✨"
    }
    return icons[category as keyof typeof icons] || "🏆"
  }

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min(100, (achievement.progress / achievement.maxProgress) * 100)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-6xl h-[90vh] max-h-[90vh] bg-slate-900 border-yellow-500/30 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <CardTitle className="text-yellow-400 text-2xl">🏆 Salón de Logros</CardTitle>
                <p className="text-gray-400 text-sm">
                  {unlockedAchievements}/{totalAchievements} logros desbloqueados ({completionPercentage}%)
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Barra de progreso general */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Progreso General</span>
              <span className="text-yellow-400 font-bold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
            {/* Filtros */}
            <div className="flex items-center gap-4 mb-4 flex-wrap flex-shrink-0">
              <TabsList className="grid grid-cols-7 w-full max-w-3xl">
                {Object.entries(categories).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {key !== "all" && getCategoryIcon(key)} {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  value={selectedRarity} 
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="bg-slate-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                >
                  {Object.entries(rarities).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>

                <Button
                  variant={showUnlockedOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                  className="text-xs"
                >
                  Solo Desbloqueados
                </Button>
              </div>
            </div>

            {/* Lista de logros */}
            {Object.entries(categories).map(([categoryKey, categoryLabel]) => (
              <TabsContent key={categoryKey} value={categoryKey} className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {filteredAchievements
                      .filter(a => categoryKey === "all" || a.category === categoryKey)
                      .map((achievement) => (
                      <Card 
                        key={achievement.id} 
                        className={`${getRarityColor(achievement.rarity)} border-2 ${
                          achievement.unlocked 
                            ? "shadow-lg" 
                            : "opacity-75 grayscale"
                        } hover:scale-105 transition-all duration-200`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {/* Ícono del logro */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                              achievement.unlocked 
                                ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg" 
                                : "bg-gray-700"
                            }`}>
                              {achievement.unlocked ? "🏆" : "🔒"}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold text-sm truncate ${
                                  achievement.unlocked ? "text-white" : "text-gray-400"
                                }`}>
                                  {achievement.name}
                                </h3>
                                {getRarityIcon(achievement.rarity)}
                              </div>
                              
                              <p className={`text-xs leading-tight mb-2 ${
                                achievement.unlocked ? "text-gray-300" : "text-gray-500"
                              }`}>
                                {achievement.description}
                              </p>

                              {/* Progreso */}
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Progreso</span>
                                  <span className={achievement.unlocked ? "text-green-400" : "text-yellow-400"}>
                                    {achievement.unlocked ? "COMPLETADO" : `${achievement.progress}/${achievement.maxProgress}`}
                                  </span>
                                </div>
                                <Progress 
                                  value={getProgressPercentage(achievement)} 
                                  className="h-2"
                                />
                              </div>

                              {/* Recompensa */}
                              <div className={`text-xs p-2 rounded border ${
                                achievement.unlocked 
                                  ? "bg-green-900/30 border-green-500/30 text-green-400" 
                                  : "bg-gray-900/30 border-gray-600/30 text-gray-400"
                              }`}>
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="font-semibold">Recompensa:</span>
                                </div>
                                <p>{achievement.reward.description}</p>
                              </div>
                            </div>
                          </div>

                          {/* Badge de rareza */}
                          <div className="flex justify-between items-center">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                achievement.rarity === "legendary" ? "border-yellow-400 text-yellow-400" :
                                achievement.rarity === "epic" ? "border-purple-400 text-purple-400" :
                                achievement.rarity === "rare" ? "border-blue-400 text-blue-400" :
                                "border-gray-400 text-gray-400"
                              }`}
                            >
                              {rarities[achievement.rarity]}
                            </Badge>

                            <Badge variant="outline" className="border-cyan-500 text-cyan-400 text-xs">
                              {categories[achievement.category as keyof typeof categories]}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredAchievements.filter(a => categoryKey === "all" || a.category === categoryKey).length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay logros en esta categoría</p>
                      <p className="text-sm">Ajusta los filtros para ver más logros</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 