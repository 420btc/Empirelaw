export interface Country {
  id: string
  name: string
  president: string
  ideology: string
  economy: {
    gdp: number
    debt: number // Deuda como % del PIB
    resources: string[]
    resourceProduction: {
      [resource: string]: number // Cantidad producida por turno
    }
    resourceReserves: {
      [resource: string]: number // Cantidad almacenada
    }
  }
  population: number
  stability: number
  legalSystem: "natural" | "positiva"
  isSovereign: boolean
  ownedBy?: string
  neighbors?: string[]
  conspiracyInfluence?: {
    geoengineering?: number
    masonic?: number
    legal?: number
  }
  alliances?: string[]
  geopoliticalBlock?: string
  militaryStrength?: number
  diplomaticRelations?: {
    [countryId: string]: number
  }
  powerLevel?: "superpower" | "major" | "regional" | "minor"
  // Nuevo: Sistema de karma/consecuencias
  playerKarma?: number // Acumulativo de acciones negativas del jugador contra este país
  lastPlayerAction?: {
    type: string
    timestamp: number
    severity: number // 1-10
  }
  // Nuevo: Sistema económico dinámico
  lastGDPGrowth?: number // Último crecimiento del PIB
  playerBonus?: number // Bonus que genera para el jugador (si es territorio conquistado)
}

export interface GameEvent {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  description: string
  effects?: string[]
  countryEffects?: {
    [countryId: string]: {
      stabilityChange?: number
      economyChange?: number
      populationChange?: number
      debtChange?: number
      resourceEffects?: {
        [resource: string]: number
      }
    }
  }
  globalEffects?: {
    resourcePriceChanges?: {
      [resource: string]: number
    }
  }
  timestamp: number
  // Nuevo: Metadatos del evento
  isPlayerTriggered?: boolean // Si fue causado por acciones del jugador
  targetedCountry?: string // País específicamente afectado por karma
  chaosLevel?: number // Nivel de caos cuando se generó
}

export interface GameAction {
  id: string
  type: string
  sourceCountry: string
  targetCountry: string
  cost: number
  timestamp: number
  parameters?: any
  // Nuevo: Severidad de la acción
  severity?: number // 1-10, para calcular karma
}

export interface GameStats {
  currentYear: number
  globalGDP: number
  globalPopulation: number
  globalStability: number
  countriesControlled: number
  globalDebt: number
  // Nuevo: Métricas de caos
  chaosLevel: number // 0-100, basado en estabilidad global y eventos recientes
  eventsThisSession: number
  negativeEventsBlocked: number // Eventos negativos bloqueados por alto caos
}

export interface ActionResult {
  success: boolean
  updatedCountries: Country[]
  event?: GameEvent
}

export interface DiplomaticMessage {
  id: string
  from: string
  to: string
  type: "trade_offer" | "alliance_proposal" | "threat" | "peace_treaty" | "resource_request"
  message: string
  parameters?: any
  timestamp: number
}

export interface ActionHistory {
  id: string
  type: string
  actionName: string
  sourceCountry: string
  sourceCountryName: string
  targetCountry: string
  targetCountryName: string
  cost: number
  success: boolean
  timestamp: number
  result?: string
  severity?: number // Nuevo: para rastrear impacto
}

export interface TradeOffer {
  id: string
  fromCountry: string
  toCountry: string
  offering: {
    [resource: string]: number
  }
  requesting: {
    [resource: string]: number
  }
  pricePerUnit: number
  totalValue: number
  status: "pending" | "accepted" | "rejected" | "expired"
  timestamp: number
  expiresAt: number
}

export interface ResourcePrice {
  resource: string
  currentPrice: number
  trend: "up" | "down" | "stable"
  weeklyChange: number
  demand: number
  supply: number
}

export interface TradeHistory {
  id: string
  fromCountry: string
  toCountry: string
  resource: string
  quantity: number
  pricePerUnit: number
  totalValue: number
  timestamp: number
}

// Nuevo: Definición de bloques geopolíticos
export interface GeopoliticalBlock {
  id: string
  name: string
  members: string[]
  leader?: string
  mutualDefense: boolean
  economicCooperation: boolean
  description: string
}

// Nuevo: Sistema de control de caos
export interface ChaosController {
  globalChaosLevel: number
  recentEvents: GameEvent[]
  blockedEvents: number
  lastEventTime: number
  countryKarmaMap: { [countryId: string]: number }
}
