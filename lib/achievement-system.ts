import type { Country, GameEvent, ActionHistory } from "./types"

//------------------------------------------------------------
// Sistema de Logros y Progresión
//------------------------------------------------------------

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  progress: number
  maxProgress: number
  unlocked: boolean
  reward: {
    type: "money" | "stability" | "influence" | "special"
    amount: number
    description: string
  }
  category: "economic" | "military" | "diplomatic" | "conquest" | "survival" | "special"
}

export interface PlayerLevel {
  level: number
  xp: number
  xpToNext: number
  title: string
  perks: string[]
}

export interface PowerUpgrade {
  id: string
  name: string
  description: string
  cost: number
  unlocked: boolean
  level: number
  maxLevel: number
  effect: string
}

//------------------------------------------------------------
// Definición de Logros
//------------------------------------------------------------
export const ACHIEVEMENTS: Achievement[] = [
  // Logros Económicos (Comunes - se obtienen rápido)
  {
    id: "first_billion",
    name: "💰 Primer Billón",
    description: "Alcanza $1,000B de PIB",
    icon: "💰",
    rarity: "common",
    progress: 0,
    maxProgress: 1000,
    unlocked: false,
    reward: { type: "money", amount: 500, description: "+$500B bonus" },
    category: "economic"
  },
  {
    id: "economic_growth",
    name: "📈 Crecimiento Acelerado",
    description: "Obtén +$200B en una sola actualización económica",
    icon: "📈",
    rarity: "common",
    progress: 0,
    maxProgress: 200,
    unlocked: false,
    reward: { type: "stability", amount: 10, description: "+10% estabilidad" },
    category: "economic"
  },
  {
    id: "debt_master",
    name: "💳 Maestro de la Deuda",
    description: "Emite deuda internacional 3 veces",
    icon: "💳",
    rarity: "rare",
    progress: 0,
    maxProgress: 3,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Desbloquea emisión de deuda ilimitada" },
    category: "economic"
  },

  // Logros de Conquista (Emocionantes)
  {
    id: "first_conquest",
    name: "🏴 Primera Conquista",
    description: "Conquista tu primer territorio",
    icon: "🏴",
    rarity: "common",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "money", amount: 1000, description: "+$1,000B bonus de conquista" },
    category: "conquest"
  },
  {
    id: "empire_builder",
    name: "👑 Constructor de Imperio",
    description: "Controla 5 territorios",
    icon: "👑",
    rarity: "rare",
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: "influence", amount: 25, description: "+25% influencia diplomática" },
    category: "conquest"
  },
  {
    id: "world_dominator",
    name: "🌍 Dominador Mundial",
    description: "Controla 15 territorios",
    icon: "🌍",
    rarity: "legendary",
    progress: 0,
    maxProgress: 15,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Desbloquea acciones de superpotencia" },
    category: "conquest"
  },

  // Logros Militares
  {
    id: "military_action",
    name: "⚔️ Primera Acción Militar",
    description: "Ejecuta tu primera acción militar",
    icon: "⚔️",
    rarity: "common",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "money", amount: 300, description: "+$300B presupuesto militar" },
    category: "military"
  },
  {
    id: "distant_conqueror",
    name: "🚀 Conquistador a Distancia",
    description: "Realiza una conquista a distancia",
    icon: "🚀",
    rarity: "epic",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "50% descuento en conquistas a distancia" },
    category: "military"
  },

  // Logros Diplomáticos
  {
    id: "first_alliance",
    name: "🤝 Primera Alianza",
    description: "Mejora relaciones diplomáticas a +50",
    icon: "🤝",
    rarity: "common",
    progress: 0,
    maxProgress: 50,
    unlocked: false,
    reward: { type: "stability", amount: 15, description: "+15% estabilidad por diplomacia" },
    category: "diplomatic"
  },
  {
    id: "trade_master",
    name: "🚛 Maestro del Comercio",
    description: "Completa 10 transacciones comerciales exitosas",
    icon: "🚛",
    rarity: "rare",
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: "money", amount: 800, description: "+$800B de ganancias comerciales" },
    category: "diplomatic"
  },

  // Logros de Supervivencia
  {
    id: "crisis_survivor",
    name: "🛡️ Superviviente de Crisis",
    description: "Sobrevive con menos del 20% de estabilidad",
    icon: "🛡️",
    rarity: "rare",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "stability", amount: 30, description: "+30% estabilidad de emergencia" },
    category: "survival"
  },
  {
    id: "comeback_king",
    name: "🔥 Rey del Regreso",
    description: "Recupera 50% de estabilidad en 5 minutos",
    icon: "🔥",
    rarity: "epic",
    progress: 0,
    maxProgress: 50,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Regeneración de estabilidad +100%" },
    category: "survival"
  },

  // Logros Especiales (Secretos)
  {
    id: "chaos_master",
    name: "🌪️ Maestro del Caos",
    description: "Causa que el caos global supere el 80%",
    icon: "🌪️",
    rarity: "legendary",
    progress: 0,
    maxProgress: 80,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Inmunidad a eventos negativos" },
    category: "special"
  },
  {
    id: "speed_runner",
    name: "⚡ Corredor Veloz",
    description: "Conquista 3 países en 10 minutos",
    icon: "⚡",
    rarity: "epic",
    progress: 0,
    maxProgress: 3,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Todas las acciones cuestan 50% menos" },
    category: "special"
  }
]

//------------------------------------------------------------
// Sistema de Niveles y Títulos
//------------------------------------------------------------
export const LEVEL_TITLES = [
  { level: 1, title: "🌱 Líder Novato", xpRequired: 0 },
  { level: 2, title: "🏛️ Político Ambicioso", xpRequired: 100 },
  { level: 3, title: "⚔️ Comandante Regional", xpRequired: 300 },
  { level: 4, title: "🌟 Estratega Veterano", xpRequired: 600 },
  { level: 5, title: "👑 Señor de la Guerra", xpRequired: 1000 },
  { level: 6, title: "🌍 Conquistador Continental", xpRequired: 1500 },
  { level: 7, title: "🔥 Emperador Temido", xpRequired: 2200 },
  { level: 8, title: "⚡ Dominador Supremo", xpRequired: 3000 },
  { level: 9, title: "🌌 Maestro del Mundo", xpRequired: 4000 },
  { level: 10, title: "👹 Tirano Absoluto", xpRequired: 5500 }
]

//------------------------------------------------------------
// Funciones de Progresión
//------------------------------------------------------------
export function calculateXPGain(action: string, success: boolean, impact: number = 1): number {
  const baseXP = {
    "economic_investment": 15,
    "military_action": 25,
    "diplomatic_alliance": 20,
    "conquest": 100,
    "special_conquest": 150,
    "trade_executed": 10,
    "debt_emission": 30,
    "crisis_survival": 50
  }

  const xp = (baseXP[action as keyof typeof baseXP] || 10) * impact
  return success ? xp : Math.floor(xp * 0.3) // 30% XP si falla
}

export function checkAchievements(
  achievements: Achievement[],
  playerCountry: Country,
  countries: Country[],
  gameEvents: GameEvent[],
  actionHistory: ActionHistory[],
  gameStats: any
): { updatedAchievements: Achievement[], newUnlocks: Achievement[] } {
  const updatedAchievements = [...achievements]
  const newUnlocks: Achievement[] = []

  updatedAchievements.forEach((achievement, index) => {
    if (achievement.unlocked) return

    let newProgress = achievement.progress

    switch (achievement.id) {
      case "first_billion":
        newProgress = Math.min(playerCountry.economy.gdp, achievement.maxProgress)
        break
      case "economic_growth":
        if (playerCountry.lastGDPGrowth) {
          newProgress = Math.max(newProgress, playerCountry.lastGDPGrowth)
        }
        break
      case "debt_master":
        newProgress = actionHistory.filter(a => a.type === "debt_emission" && a.success).length
        break
      case "first_conquest":
      case "empire_builder":
      case "world_dominator":
        newProgress = countries.filter(c => c.ownedBy === playerCountry.id).length
        break
      case "military_action":
        newProgress = actionHistory.filter(a => a.type === "military_action" && a.success).length > 0 ? 1 : 0
        break
      case "distant_conqueror":
        newProgress = actionHistory.filter(a => 
          a.type === "special_conquest" && 
          a.success && 
          a.actionName.includes("Distancia")
        ).length > 0 ? 1 : 0
        break
      case "first_alliance":
        const maxRelation = Math.max(
          ...Object.values(playerCountry.diplomaticRelations || {}),
          0
        )
        newProgress = Math.min(maxRelation, achievement.maxProgress)
        break
      case "trade_master":
        newProgress = actionHistory.filter(a => a.type === "trade_executed" && a.success).length
        break
      case "crisis_survivor":
        newProgress = playerCountry.stability <= 20 ? 1 : 0
        break
      case "comeback_king":
        // Lógica más compleja - requeriría tracking temporal
        break
      case "chaos_master":
        newProgress = Math.min(gameStats.chaosLevel, achievement.maxProgress)
        break
      case "speed_runner":
        // Lógica temporal - requeriría timestamps
        break
    }

    updatedAchievements[index].progress = newProgress

    // Verificar si se desbloqueó
    if (newProgress >= achievement.maxProgress && !achievement.unlocked) {
      updatedAchievements[index].unlocked = true
      newUnlocks.push(updatedAchievements[index])
    }
  })

  return { updatedAchievements, newUnlocks }
}

export function getPlayerLevel(totalXP: number): PlayerLevel {
  let currentLevel = 1
  let currentTitle = LEVEL_TITLES[0].title

  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_TITLES[i].xpRequired) {
      currentLevel = LEVEL_TITLES[i].level
      currentTitle = LEVEL_TITLES[i].title
      break
    }
  }

  const nextLevelIndex = Math.min(currentLevel, LEVEL_TITLES.length - 1)
  const xpToNext = nextLevelIndex < LEVEL_TITLES.length - 1 
    ? LEVEL_TITLES[nextLevelIndex].xpRequired - totalXP
    : 0

  const perks = []
  if (currentLevel >= 2) perks.push("💰 +10% ingresos económicos")
  if (currentLevel >= 3) perks.push("⚔️ -20% costo acciones militares")
  if (currentLevel >= 4) perks.push("🤝 +15% efectividad diplomática")
  if (currentLevel >= 5) perks.push("🏴 -30% costo conquistas")
  if (currentLevel >= 6) perks.push("🛡️ +25% resistencia a crisis")
  if (currentLevel >= 7) perks.push("🌪️ Inmunidad a 50% eventos negativos")
  if (currentLevel >= 8) perks.push("⚡ Todas las acciones 2x más rápidas")
  if (currentLevel >= 9) perks.push("👑 Conquistas instantáneas disponibles")
  if (currentLevel >= 10) perks.push("🌌 Poder absoluto desbloqueado")

  return {
    level: currentLevel,
    xp: totalXP,
    xpToNext,
    title: currentTitle,
    perks
  }
} 