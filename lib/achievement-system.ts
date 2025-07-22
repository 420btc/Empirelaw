import type { Country, GameEvent, ActionHistory } from "./types"

//------------------------------------------------------------
// Sistema de Logros y Progresión
//------------------------------------------------------------

export interface Achievement {
  /**
   * Indica si el logro ya fue revisado por el jugador (para badge de no vistos)
   */
  seen?: boolean;
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
  },

  // NUEVOS LOGROS ECONÓMICOS
  {
    id: "economic_powerhouse",
    name: "🏭 Potencia Económica",
    description: "Alcanza $50,000B de PIB",
    icon: "🏭",
    rarity: "epic",
    progress: 0,
    maxProgress: 50000,
    unlocked: false,
    reward: { type: "money", amount: 5000, description: "+$5,000B bonus económico" },
    category: "economic"
  },
  {
    id: "resource_monopoly",
    name: "💎 Monopolio de Recursos",
    description: "Controla 10 tipos de recursos diferentes",
    icon: "💎",
    rarity: "rare",
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Precios de recursos +25%" },
    category: "economic"
  },
  {
    id: "debt_free",
    name: "💳 Libre de Deuda",
    description: "Reduce tu deuda nacional a 0%",
    icon: "💳",
    rarity: "epic",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "stability", amount: 20, description: "+20% estabilidad permanente" },
    category: "economic"
  },
  {
    id: "trade_empire",
    name: "🚢 Imperio Comercial",
    description: "Completa 50 transacciones comerciales",
    icon: "🚢",
    rarity: "rare",
    progress: 0,
    maxProgress: 50,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Comercio internacional +50% ganancias" },
    category: "economic"
  },

  // NUEVOS LOGROS MILITARES
  {
    id: "war_machine",
    name: "🔫 Máquina de Guerra",
    description: "Ejecuta 25 acciones militares exitosas",
    icon: "🔫",
    rarity: "rare",
    progress: 0,
    maxProgress: 25,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Acciones militares -30% costo" },
    category: "military"
  },
  {
    id: "nuclear_power",
    name: "☢️ Poder Nuclear",
    description: "Alcanza 90+ fuerza militar",
    icon: "☢️",
    rarity: "epic",
    progress: 0,
    maxProgress: 90,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Intimidación nuclear: -50% resistencia enemiga" },
    category: "military"
  },
  {
    id: "defensive_master",
    name: "🛡️ Maestro Defensivo",
    description: "Sobrevive 10 ataques enemigos",
    icon: "🛡️",
    rarity: "rare",
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: "stability", amount: 15, description: "+15% resistencia a ataques" },
    category: "military"
  },

  // NUEVOS LOGROS DIPLOMÁTICOS
  {
    id: "peacemaker",
    name: "🕊️ Pacificador",
    description: "Mejora 5 relaciones diplomáticas a +75",
    icon: "🕊️",
    rarity: "epic",
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Diplomacia +100% efectividad" },
    category: "diplomatic"
  },
  {
    id: "united_nations",
    name: "🌐 Naciones Unidas",
    description: "Mantén +50 relación con 10 países",
    icon: "🌐",
    rarity: "legendary",
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Inmunidad a sanciones internacionales" },
    category: "diplomatic"
  },
  {
    id: "enemy_of_the_state",
    name: "💀 Enemigo del Estado",
    description: "Mantén -75 relación con 5 países",
    icon: "💀",
    rarity: "epic",
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Acciones agresivas +50% efectividad" },
    category: "diplomatic"
  },

  // NUEVOS LOGROS DE CONQUISTA
  {
    id: "continental_power",
    name: "🌍 Poder Continental",
    description: "Controla 10 territorios",
    icon: "🌍",
    rarity: "epic",
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Territorios generan +25% ingresos" },
    category: "conquest"
  },
  {
    id: "superpower_status",
    name: "⭐ Estatus de Superpotencia",
    description: "Alcanza nivel de poder 'superpotencia'",
    icon: "⭐",
    rarity: "legendary",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Desbloquea acciones de superpotencia" },
    category: "conquest"
  },
  {
    id: "blitzkrieg",
    name: "⚡ Blitzkrieg",
    description: "Conquista 5 países en una hora",
    icon: "⚡",
    rarity: "legendary",
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Conquistas instantáneas desbloqueadas" },
    category: "conquest"
  },

  // NUEVOS LOGROS DE SUPERVIVENCIA
  {
    id: "phoenix_rising",
    name: "🔥 Fénix Renaciente",
    description: "Recupera de 10% a 80% estabilidad",
    icon: "🔥",
    rarity: "legendary",
    progress: 0,
    maxProgress: 70,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Regeneración automática de estabilidad" },
    category: "survival"
  },
  {
    id: "economic_collapse_survivor",
    name: "💔 Superviviente del Colapso",
    description: "Sobrevive con PIB menor a $500B",
    icon: "💔",
    rarity: "epic",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "money", amount: 2000, description: "+$2,000B ayuda de emergencia" },
    category: "survival"
  },
  {
    id: "isolation_master",
    name: "🏝️ Maestro del Aislamiento",
    description: "Mantén 0 alianzas por 30 minutos",
    icon: "🏝️",
    rarity: "rare",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Autosuficiencia: +30% todos los recursos" },
    category: "survival"
  },

  // NUEVOS LOGROS ESPECIALES
  {
    id: "puppet_master",
    name: "🎭 Maestro Titiritero",
    description: "Controla 20 territorios",
    icon: "🎭",
    rarity: "legendary",
    progress: 0,
    maxProgress: 20,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Control remoto: gobierna desde las sombras" },
    category: "special"
  },
  {
    id: "conspiracy_theorist",
    name: "👁️ Teórico de la Conspiración",
    description: "Ejecuta 15 acciones conspiracionales",
    icon: "👁️",
    rarity: "epic",
    progress: 0,
    maxProgress: 15,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Acciones ocultas: 50% menos detección" },
    category: "special"
  },
  {
    id: "fourth_reich",
    name: "🦅 Cuarto Reich",
    description: "Como Alemania, conquista Francia, Polonia e Italia",
    icon: "🦅",
    rarity: "legendary",
    progress: 0,
    maxProgress: 3,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Blitzkrieg europeo desbloqueado" },
    category: "special"
  },
  {
    id: "cold_war_victor",
    name: "❄️ Vencedor de la Guerra Fría",
    description: "Como USA o Rusia, derrota al otro",
    icon: "❄️",
    rarity: "legendary",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Hegemonía global desbloqueada" },
    category: "special"
  },
  {
    id: "african_unity",
    name: "🦁 Unidad Africana",
    description: "Como país africano, conquista 5 países africanos",
    icon: "🦁",
    rarity: "epic",
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Panafricanismo: +100% cooperación africana" },
    category: "special"
  },
  {
    id: "digital_empire",
    name: "💻 Imperio Digital",
    description: "Ejecuta 20 ciberataques exitosos",
    icon: "💻",
    rarity: "epic",
    progress: 0,
    maxProgress: 20,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Guerra cibernética avanzada desbloqueada" },
    category: "special"
  },
  {
    id: "oil_baron",
    name: "🛢️ Barón del Petróleo",
    description: "Controla 5 países productores de petróleo",
    icon: "🛢️",
    rarity: "legendary",
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Monopolio petrolero: controla precios globales" },
    category: "special"
  },

  // LOGROS DE TIEMPO Y VELOCIDAD
  {
    id: "marathon_ruler",
    name: "🏃 Gobernante Maratoniano",
    description: "Juega durante 2 horas continuas",
    icon: "🏃",
    rarity: "rare",
    progress: 0,
    maxProgress: 120, // minutos
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Resistencia: -25% fatiga en decisiones" },
    category: "special"
  },
  {
    id: "lightning_conquest",
    name: "⚡ Conquista Relámpago",
    description: "Conquista un país en menos de 5 minutos",
    icon: "⚡",
    rarity: "rare",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: "special", amount: 1, description: "Conquista rápida: -50% tiempo de conquista" },
    category: "conquest"
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
      case "economic_powerhouse":
        newProgress = Math.min(playerCountry.economy.gdp, achievement.maxProgress)
        break
      case "resource_monopoly":
        newProgress = playerCountry.economy.resources.length
        break
      case "debt_free":
        newProgress = playerCountry.economy.debt === 0 ? 1 : 0
        break
      case "trade_empire":
        newProgress = actionHistory.filter(a => a.type === "trade_executed" && a.success).length
        break
      case "war_machine":
        newProgress = actionHistory.filter(a => a.type === "military_action" && a.success).length
        break
      case "nuclear_power":
        newProgress = Math.min(playerCountry.militaryStrength || 0, achievement.maxProgress)
        break
      case "defensive_master":
        // Requeriría tracking de ataques recibidos
        break
      case "peacemaker":
        const positiveRelations = Object.values(playerCountry.diplomaticRelations || {}).filter(rel => rel >= 75).length
        newProgress = Math.min(positiveRelations, achievement.maxProgress)
        break
      case "united_nations":
        const strongAllies = Object.values(playerCountry.diplomaticRelations || {}).filter(rel => rel >= 50).length
        newProgress = Math.min(strongAllies, achievement.maxProgress)
        break
      case "enemy_of_the_state":
        const enemies = Object.values(playerCountry.diplomaticRelations || {}).filter(rel => rel <= -75).length
        newProgress = Math.min(enemies, achievement.maxProgress)
        break
      case "continental_power":
        newProgress = Math.min(countries.filter(c => c.ownedBy === playerCountry.id).length, achievement.maxProgress)
        break
      case "superpower_status":
        newProgress = playerCountry.powerLevel === "superpower" ? 1 : 0
        break
      case "blitzkrieg":
        // Requeriría tracking temporal
        break
      case "phoenix_rising":
        // Requeriría tracking de recuperación de estabilidad
        break
      case "economic_collapse_survivor":
        newProgress = playerCountry.economy.gdp < 500 ? 1 : 0
        break
      case "isolation_master":
        newProgress = (playerCountry.alliances || []).length === 0 ? 1 : 0
        break
      case "puppet_master":
        newProgress = Math.min(countries.filter(c => c.ownedBy === playerCountry.id).length, achievement.maxProgress)
        break
      case "conspiracy_theorist":
        const conspiracyActions = actionHistory.filter(a => 
          (a.type === "geoengineering" || a.type === "masonic_influence" || a.type === "media_manipulation") && a.success
        ).length
        newProgress = Math.min(conspiracyActions, achievement.maxProgress)
        break
      case "fourth_reich":
        if (playerCountry.id === "germany") {
          const conqueredTargets = ["france", "poland", "italy"].filter(target => 
            countries.find(c => c.id === target)?.ownedBy === playerCountry.id
          ).length
          newProgress = conqueredTargets
        }
        break
      case "cold_war_victor":
        if (playerCountry.id === "usa") {
          newProgress = countries.find(c => c.id === "russia")?.ownedBy === playerCountry.id ? 1 : 0
        } else if (playerCountry.id === "russia") {
          newProgress = countries.find(c => c.id === "usa")?.ownedBy === playerCountry.id ? 1 : 0
        }
        break
      case "african_unity":
        const africanCountries = ["nigeria", "south_africa", "ghana", "kenya", "morocco", "ethiopia"]
        if (africanCountries.includes(playerCountry.id)) {
          const conqueredAfrican = africanCountries.filter(target => 
            target !== playerCountry.id && countries.find(c => c.id === target)?.ownedBy === playerCountry.id
          ).length
          newProgress = Math.min(conqueredAfrican, achievement.maxProgress)
        }
        break
      case "digital_empire":
        newProgress = Math.min(actionHistory.filter(a => a.type === "cyber_attack" && a.success).length, achievement.maxProgress)
        break
      case "oil_baron":
        const oilCountries = ["usa", "russia", "saudi_arabia", "iran", "nigeria"]
        const controlledOilCountries = oilCountries.filter(target => 
          countries.find(c => c.id === target)?.ownedBy === playerCountry.id || target === playerCountry.id
        ).length
        newProgress = Math.min(controlledOilCountries, achievement.maxProgress)
        break
      case "marathon_ruler":
        // Requeriría tracking de tiempo de juego
        break
      case "lightning_conquest":
        // Requeriría tracking temporal
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