import type { Country, GameEvent, GameAction, ActionResult } from "@/lib/types"

//------------------------------------------------------------
// Utility helpers
//------------------------------------------------------------
function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num))
}

function applyStabilityChange(country: Country, delta: number): Country {
  return { ...country, stability: clamp(country.stability + delta, 0, 100) }
}

//------------------------------------------------------------
// Sistema de Control de Caos Global
//------------------------------------------------------------
//------------------------------------------------------------
// Sistema de Generación Dinámica de PIB
//------------------------------------------------------------
export function calculateGDPGrowth(country: Country, countries: Country[], playerCountryId: string): number {
  let growthRate = 0

  // Factor 1: Estabilidad (más estabilidad = más crecimiento)
  const stabilityFactor = (country.stability / 100) * 0.03 // 0-3% base
  growthRate += stabilityFactor

  // Factor 2: Recursos naturales (más recursos = más crecimiento)
  const resourceCount = country.economy.resources.length
  const resourceFactor = Math.min(0.02, resourceCount * 0.003) // Máximo 2%
  growthRate += resourceFactor

  // Factor 3: Nivel de deuda (menos deuda = más crecimiento)
  const debtPenalty = Math.max(0, (country.economy.debt - 60) / 100 * 0.02) // Penalización si deuda > 60%
  growthRate -= debtPenalty

  // Factor 4: Relaciones diplomáticas (buenas relaciones = comercio = crecimiento)
  const avgDiplomaticRelation = country.diplomaticRelations 
    ? Object.values(country.diplomaticRelations).reduce((sum, rel) => sum + rel, 0) / Object.values(country.diplomaticRelations).length
    : 0
  const diplomaticFactor = Math.max(-0.01, Math.min(0.015, avgDiplomaticRelation / 100 * 0.015))
  growthRate += diplomaticFactor

  // Factor 5: Bonificación por superpotencia
  if (country.powerLevel === "superpower") growthRate += 0.005
  else if (country.powerLevel === "major") growthRate += 0.003

  // Factor 6: Penalización por países conquistados (costo de mantenimiento)
  if (country.id === playerCountryId) {
    const conqueredTerritories = countries.filter(c => c.ownedBy === playerCountryId).length
    const maintenancePenalty = conqueredTerritories * 0.002 // 0.2% por territorio
    growthRate -= maintenancePenalty
  }

  // Factor 7: Bonificación/penalización por territorio conquistado
  if (country.ownedBy === playerCountryId && country.id !== playerCountryId) {
    growthRate *= 0.34 // Solo 34% del crecimiento normal (66% reducción)
  }

  // Limitar crecimiento entre -2% y +5%
  growthRate = Math.max(-0.02, Math.min(0.05, growthRate))

  console.log(`📈 ${country.name} PIB growth: ${(growthRate * 100).toFixed(2)}% (Estab: ${(stabilityFactor * 100).toFixed(1)}%, Rec: ${(resourceFactor * 100).toFixed(1)}%, Deuda: -${(debtPenalty * 100).toFixed(1)}%, Dipl: ${(diplomaticFactor * 100).toFixed(1)}%)`)

  return growthRate
}

export function applyGDPGrowth(countries: Country[], playerCountryId: string): Country[] {
  return countries.map(country => {
    const growthRate = calculateGDPGrowth(country, countries, playerCountryId)
    const gdpIncrease = Math.round(country.economy.gdp * growthRate)
    
    // Aplicar ingresos de territorios conquistados al jugador
    let playerBonus = 0
    if (country.ownedBy === playerCountryId && country.id !== playerCountryId) {
      playerBonus = gdpIncrease // El jugador recibe el 100% de lo que genera el territorio
    }

    return {
      ...country,
      economy: {
        ...country.economy,
        gdp: Math.max(100, country.economy.gdp + gdpIncrease), // Mínimo 100B PIB
      },
      // Metadata para tracking
      lastGDPGrowth: gdpIncrease,
      playerBonus: playerBonus,
    }
  })
}

//------------------------------------------------------------
// Sistema de Ayuda Mutua Inteligente
//------------------------------------------------------------
export function provideMutualAidToCriticalCountries(countries: Country[], playerCountryId: string): {
  updatedCountries: Country[]
  aidEvents: GameEvent[]
} {
  const aidEvents: GameEvent[] = []
  let updatedCountries = [...countries]

  // Encontrar países en crisis crítica (estabilidad <= 25, no conquistados, no soberanos)
  const criticalCountries = countries.filter(c => 
    c.stability <= 25 && 
    !c.ownedBy && 
    !c.isSovereign && 
    c.id !== playerCountryId
  )

  criticalCountries.forEach(criticalCountry => {
    // Encontrar países vecinos estables que puedan ayudar
    const potentialHelpers = countries.filter(helper => {
      // Debe ser vecino o del mismo bloque
      const isNeighbor = criticalCountry.neighbors?.includes(helper.id) || helper.neighbors?.includes(criticalCountry.id)
      const sameBlock = helper.geopoliticalBlock === criticalCountry.geopoliticalBlock
      
      // Debe estar estable y tener capacidad económica
      const isStable = helper.stability >= 60
      const hasCapacity = helper.economy.gdp >= 1000
      const notInDebt = helper.economy.debt < 120
      
      // No debe ser el jugador ni estar conquistado por el jugador
      const notPlayerControlled = helper.id !== playerCountryId && helper.ownedBy !== playerCountryId
      
      return (isNeighbor || sameBlock) && isStable && hasCapacity && notInDebt && notPlayerControlled
    })

    if (potentialHelpers.length > 0) {
      // Seleccionar el mejor ayudante (más PIB y mejor estabilidad)
      const bestHelper = potentialHelpers.reduce((best, current) => {
        const bestScore = best.economy.gdp * (best.stability / 100)
        const currentScore = current.economy.gdp * (current.stability / 100)
        return currentScore > bestScore ? current : best
      })

      // Calcular ayuda proporcionada
      const aidAmount = Math.min(
        Math.round(bestHelper.economy.gdp * 0.05), // Máximo 5% del PIB del ayudante
        Math.round(criticalCountry.economy.gdp * 0.3)  // Máximo 30% del PIB del receptor
      )
      
      const stabilityBoost = Math.min(15, Math.max(5, Math.round(aidAmount / 100)))

      // Aplicar ayuda
      updatedCountries = updatedCountries.map(c => {
        if (c.id === criticalCountry.id) {
          return {
            ...c,
            stability: Math.min(85, c.stability + stabilityBoost),
            economy: {
              ...c.economy,
              gdp: c.economy.gdp + aidAmount,
              debt: Math.max(0, c.economy.debt - 5), // Pequeña reducción de deuda
            }
          }
        } else if (c.id === bestHelper.id) {
          return {
            ...c,
            economy: {
              ...c.economy,
              gdp: c.economy.gdp - Math.round(aidAmount * 0.7), // El ayudante pierde menos de lo que da
            }
          }
        }
        return c
      })

      // Crear evento de ayuda mutua
      const aidEvent: GameEvent = {
        id: `mutual_aid_${Date.now()}_${criticalCountry.id}`,
        type: "success",
        title: "🤝 Ayuda Mutua Internacional",
        description: `${bestHelper.name} ha proporcionado ayuda crítica a ${criticalCountry.name} para prevenir su colapso`,
        effects: [
          `${bestHelper.name} dona $${aidAmount}B`,
          `${criticalCountry.name} recibe +${stabilityBoost}% estabilidad`,
          "Cooperación internacional fortalecida",
          "Dificultad aumentada para conquistas fáciles"
        ],
        timestamp: Date.now(),
      }

      aidEvents.push(aidEvent)

      console.log(`🤝 Ayuda mutua: ${bestHelper.name} → ${criticalCountry.name} ($${aidAmount}B, +${stabilityBoost}% estabilidad)`)
    }
  })

  return { updatedCountries, aidEvents }
}

export function calculateChaosLevel(countries: Country[], recentEvents: GameEvent[]): number {
  // Factor 1: Estabilidad global promedio (invertida)
  const avgStability = countries.reduce((sum, c) => sum + c.stability, 0) / countries.length
  const stabilityFactor = Math.max(0, 100 - avgStability) // 0-100

  // Factor 2: Número de países en crisis severa
  const countriesInCrisis = countries.filter((c) => c.stability < 30 && !c.isSovereign).length
  const crisisFactor = Math.min(100, (countriesInCrisis / countries.length) * 200) // 0-100

  // Factor 3: Eventos negativos recientes (últimos 5 minutos)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const recentNegativeEvents = recentEvents.filter(
    (e) => e.timestamp > fiveMinutesAgo && (e.type === "error" || e.type === "warning"),
  ).length
  const eventFactor = Math.min(100, recentNegativeEvents * 15) // 0-100

  // Factor 4: Países colapsados completamente
  const collapsedCountries = countries.filter((c) => c.stability <= 0).length
  const collapseFactor = Math.min(100, collapsedCountries * 25) // 0-100

  // Cálculo final del caos (promedio ponderado)
  const chaosLevel = stabilityFactor * 0.3 + crisisFactor * 0.3 + eventFactor * 0.2 + collapseFactor * 0.2

  console.log(
    `🌪️ Caos Global: ${chaosLevel.toFixed(1)}% (Estabilidad: ${stabilityFactor.toFixed(1)}, Crisis: ${crisisFactor.toFixed(1)}, Eventos: ${eventFactor.toFixed(1)}, Colapsos: ${collapseFactor.toFixed(1)})`,
  )

  return Math.round(chaosLevel)
}

//------------------------------------------------------------
// Sistema de Karma por País
//------------------------------------------------------------
export function updatePlayerKarma(countries: Country[], action: GameAction): Country[] {
  if (!action.targetCountry || action.sourceCountry === action.targetCountry) return countries

  const severity = getActionSeverity(action.type)

  return countries.map((country) => {
    if (country.id === action.targetCountry) {
      const currentKarma = country.playerKarma || 0
      const newKarma = Math.min(100, currentKarma + severity)

      console.log(`⚖️ Karma actualizado para ${country.name}: ${currentKarma} → ${newKarma} (+${severity})`)

      return {
        ...country,
        playerKarma: newKarma,
        lastPlayerAction: {
          type: action.type,
          timestamp: action.timestamp,
          severity: severity,
        },
      }
    }
    return country
  })
}

function getActionSeverity(actionType: string): number {
  const severityMap: Record<string, number> = {
    // Acciones muy severas
    military_action: 10,
    geoengineering: 9,
    biological_warfare: 10,
    regime_change: 9,
    special_conquest: 10,

    // Acciones severas
    economic_sanction: 7,
    cyber_attack: 6,
    masonic_influence: 6,
    trade_embargo: 5,

    // Acciones moderadas
    espionage: 4,
    media_manipulation: 3,
    technology_theft: 4,

    // Acciones leves
    diplomatic_message: 1,
    trade_agreement: -1, // Reduce karma
    economic_aid: -2,
    diplomatic_alliance: -3,

    // Acciones internas (sin karma)
    economic_investment: 0,
    social_policy: 0,
    military_buildup: 0,
  }

  return severityMap[actionType] || 0
}

//------------------------------------------------------------
// Sistema de ayuda mutua entre aliados
//------------------------------------------------------------
function provideMutualAid(countries: Country[], countryInCrisis: Country): Country[] {
  if (!countryInCrisis.alliances || countryInCrisis.alliances.length === 0) return countries

  console.log(`🤝 Activando ayuda mutua para ${countryInCrisis.name}`)

  return countries.map((country) => {
    // Si es un aliado del país en crisis
    if (countryInCrisis.alliances?.includes(country.id) && country.stability > 60 && country.economy.gdp > 1000) {
      const aidAmount = Math.min(country.economy.gdp * 0.05, 500) // Máximo 5% del PIB o 500B
      const stabilityBoost = Math.min(15, Math.max(5, aidAmount / 50)) // 5-15% boost

      console.log(`💰 ${country.name} proporciona $${aidAmount}B de ayuda a ${countryInCrisis.name}`)

      // El país que ayuda pierde dinero pero gana estabilidad por cooperación
      return {
        ...country,
        economy: { ...country.economy, gdp: Math.max(0, country.economy.gdp - aidAmount) },
        stability: clamp(country.stability + 2, 0, 100), // Pequeño boost por ayudar
      }
    }

    // Si es el país en crisis, recibe ayuda
    if (country.id === countryInCrisis.id) {
      const totalAid =
        countryInCrisis.alliances
          ?.map((allyId) => {
            const ally = countries.find((c) => c.id === allyId)
            if (ally && ally.stability > 60 && ally.economy.gdp > 1000) {
              return Math.min(ally.economy.gdp * 0.05, 500)
            }
            return 0
          })
          .reduce((sum, aid) => sum + aid, 0) || 0

      if (totalAid > 0) {
        const stabilityBoost = Math.min(20, Math.max(8, totalAid / 100))
        console.log(`📈 ${country.name} recibe $${totalAid}B de ayuda total, estabilidad +${stabilityBoost}%`)

        return {
          ...country,
          economy: { ...country.economy, gdp: country.economy.gdp + totalAid },
          stability: clamp(country.stability + stabilityBoost, 0, 100),
        }
      }
    }

    return country
  })
}

//------------------------------------------------------------
// Sistema de contagio de crisis con ayuda mutua
//------------------------------------------------------------
function applyContagionEffects(event: GameEvent, countries: Country[], affectedCountryId: string): GameEvent[] {
  const contagionEvents: GameEvent[] = []
  const affectedCountry = countries.find((c) => c.id === affectedCountryId)

  if (!affectedCountry || !event.countryEffects?.[affectedCountryId]) return []

  const originalEffect = event.countryEffects[affectedCountryId]

  // Solo propagar eventos negativos significativos
  if (!originalEffect.stabilityChange || originalEffect.stabilityChange >= -15) return []

  // Encontrar países afectados por contagio
  const contagionTargets = countries.filter((country) => {
    if (country.id === affectedCountryId) return false

    // Vecinos geográficos
    const isNeighbor = affectedCountry.neighbors?.includes(country.id) || country.neighbors?.includes(affectedCountryId)

    // Socios comerciales (relaciones diplomáticas positivas)
    const hasTradeRelations =
      (affectedCountry.diplomaticRelations?.[country.id] || 0) > 30 ||
      (country.diplomaticRelations?.[affectedCountryId] || 0) > 30

    // Mismo bloque geopolítico
    const sameBlock = country.geopoliticalBlock === affectedCountry.geopoliticalBlock

    return isNeighbor || hasTradeRelations || sameBlock
  })

  if (contagionTargets.length === 0) return []

  // Crear evento de contagio
  const contagionEvent: GameEvent = {
    id: `contagion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "warning",
    title: "🌊 Efectos de Contagio Regional",
    description: `La crisis en ${affectedCountry.name} se extiende a países vecinos y socios comerciales`,
    effects: [
      "Crisis regional por contagio económico",
      "Mercados interconectados afectados",
      "Cadenas de suministro interrumpidas",
      "Aliados activando ayuda mutua",
    ],
    countryEffects: {},
    timestamp: Date.now(),
  }

  // Aplicar efectos reducidos a países afectados
  contagionTargets.forEach((country) => {
    const isNeighbor = affectedCountry.neighbors?.includes(country.id) || country.neighbors?.includes(affectedCountryId)
    const hasStrongTrade =
      (affectedCountry.diplomaticRelations?.[country.id] || 0) > 60 ||
      (country.diplomaticRelations?.[affectedCountryId] || 0) > 60
    const sameBlock = country.geopoliticalBlock === affectedCountry.geopoliticalBlock
    const isAlly = affectedCountry.alliances?.includes(country.id)

    // Intensidad del contagio: 10-25% del efecto original
    let contagionIntensity = 0.1
    if (isNeighbor) contagionIntensity += 0.05 // +5% para vecinos
    if (hasStrongTrade) contagionIntensity += 0.05 // +5% para socios comerciales fuertes
    if (sameBlock) contagionIntensity += 0.03 // +3% para mismo bloque
    if (isAlly) contagionIntensity -= 0.05 // -5% para aliados (se ayudan mutuamente)

    // Los países poderosos resisten mejor el contagio
    if (country.powerLevel === "superpower") contagionIntensity *= 0.5
    else if (country.powerLevel === "major") contagionIntensity *= 0.7

    contagionEvent.countryEffects![country.id] = {
      stabilityChange: Math.round((originalEffect.stabilityChange || 0) * contagionIntensity),
      economyChange: Math.round((originalEffect.economyChange || 0) * contagionIntensity),
      populationChange: Math.round((originalEffect.populationChange || 0) * contagionIntensity),
      debtChange: Math.round((originalEffect.debtChange || 0) * contagionIntensity),
    }

    // Agregar efectos de recursos si existen
    if (originalEffect.resourceEffects) {
      contagionEvent.countryEffects![country.id].resourceEffects = {}
      Object.entries(originalEffect.resourceEffects).forEach(([resource, change]) => {
        contagionEvent.countryEffects![country.id].resourceEffects![resource] = Math.round(change * contagionIntensity)
      })
    }
  })

  contagionEvents.push(contagionEvent)
  return contagionEvents
}

//------------------------------------------------------------
// Sistema de conquista automática (más restrictivo)
//------------------------------------------------------------
export function checkForCollapses(
  countries: Country[],
  playerCountryId: string,
): {
  updatedCountries: Country[]
  conquestEvents: GameEvent[]
} {
  const conquestEvents: GameEvent[] = []
  let updatedCountries = [...countries]

  // Primero aplicar ayuda mutua a países en crisis
  const countriesInCrisis = countries.filter((c) => c.stability <= 30 && c.stability > 0 && !c.isSovereign)

  countriesInCrisis.forEach((country) => {
    if (country.alliances && country.alliances.length > 0) {
      updatedCountries = provideMutualAid(updatedCountries, country)
    }
  })

  // Luego verificar conquistas automáticas (solo si llegan a 0% después de la ayuda)
  updatedCountries = updatedCountries.map((country) => {
    // Solo conquista automática si llega a 0% estabilidad, no es soberano, no está conquistado, y no tiene aliados poderosos
    if (
      country.stability <= 0 &&
      country.id !== playerCountryId &&
      !country.ownedBy &&
      !country.isSovereign &&
      (!country.alliances || country.alliances.length === 0)
    ) {
      // El jugador lo conquista automáticamente
      conquestEvents.push({
        id: `conquest_${Date.now()}_${country.id}`,
        type: "success",
        title: "🏴 Conquista Automática",
        description: `${country.name} ha colapsado completamente sin aliados que lo ayuden. Tu imperio ha tomado control del territorio`,
        effects: [
          `${country.name} ahora es parte de tu imperio`,
          "Recursos y población incorporados",
          "Estabilidad restaurada al 30%",
          "Sin aliados que intervinieran",
        ],
        timestamp: Date.now(),
      })

      return {
        ...country,
        ownedBy: playerCountryId,
        stability: 30, // Restaurar algo de estabilidad tras la conquista
      }
    }
    return country
  })

  return { updatedCountries, conquestEvents }
}

//------------------------------------------------------------
// Sistema de eventos aleatorios inteligente con control de caos
//------------------------------------------------------------
export function generateRandomEvent(
  countries: Country[],
  playerCountryId: string,
  chaosLevel: number,
  recentEvents: GameEvent[] = [],
): { mainEvent: GameEvent | null; contagionEvents: GameEvent[] } {
  // CONTROL DE CAOS: Si el caos es muy alto (>75%), bloquear eventos negativos
  const chaosThreshold = 75
  const shouldBlockNegativeEvents = chaosLevel > chaosThreshold

  if (shouldBlockNegativeEvents) {
    console.log(`🛡️ Caos muy alto (${chaosLevel}%), bloqueando eventos negativos para estabilizar`)

    // Solo permitir eventos positivos o neutrales cuando hay mucho caos
    const stabilizingEvents = [
      "technological_breakthrough",
      "resource_discovery",
      "economic_boom",
      "scientific_breakthrough",
      "genetic_breakthrough",
      "international_aid", // Nuevo evento estabilizador
      "peace_treaty_signed", // Nuevo evento estabilizador
    ]

    const eventType = stabilizingEvents[Math.floor(Math.random() * stabilizingEvents.length)]
    const affectedCountry =
      countries.filter((c) => c.stability < 50)[0] || countries[Math.floor(Math.random() * countries.length)]

    const stabilizingEvent = generateStabilizingEvent(eventType, affectedCountry, chaosLevel)
    return { mainEvent: stabilizingEvent, contagionEvents: [] }
  }

  // PROBABILIDAD AUMENTADA: 60% de que ocurra un evento (aumentado significativamente)
  if (Math.random() > 0.6) {
    return { mainEvent: null, contagionEvents: [] }
  }

  // Seleccionar tipo de evento basado en karma y situación
  const negativeEventChance = Math.min(0.7, 0.4 + chaosLevel / 200) // 40-70% según caos
  const isNegativeEvent = Math.random() < negativeEventChance

  const positiveEvents = [
    "technological_breakthrough",
    "resource_discovery",
    "economic_boom",
    "scientific_breakthrough",
    "genetic_breakthrough",
    "quantum_computing",
    "space_discovery",
    "african_mineral_boom", // Específico para África
  ]

  const negativeEvents = [
    "economic_crisis",
    "natural_disaster",
    "political_uprising",
    "conspiracy_exposed",
    "trade_disruption",
    "climate_change",
    "pandemic_outbreak",
    "cyber_warfare",
    "energy_crisis",
    "food_shortage",
    "refugee_crisis",
    "terrorist_attack",
    "cultural_revolution",
    "military_coup",
    "volcanic_eruption",
    "stock_market_crash",
    "religious_uprising",
    "nuclear_accident",
    "mass_migration",
    "ocean_pollution",
    // Nuevos eventos de karma
    "karma_rebellion", // Específico para países con alto karma del jugador
    "karma_economic_collapse", // Específico para países atacados económicamente
    "karma_cyber_retaliation", // Respuesta a ciberataques
  ]

  const neutralEvents = ["diplomatic_incident", "alien_contact", "AI_singularity"]

  // SELECCIÓN INTELIGENTE DE PAÍS AFECTADO
  let affectedCountry: Country

  if (isNegativeEvent) {
    // Para eventos negativos, priorizar países con alto karma del jugador
    const highKarmaCountries = countries.filter((c) => (c.playerKarma || 0) > 30 && !c.isSovereign)
    const vulnerableCountries = countries.filter((c) => c.powerLevel !== "superpower" && !c.isSovereign)

    if (highKarmaCountries.length > 0 && Math.random() < 0.7) {
      // 70% de probabilidad de afectar a países con alto karma
      affectedCountry = highKarmaCountries[Math.floor(Math.random() * highKarmaCountries.length)]
      console.log(`⚖️ Evento dirigido por karma hacia ${affectedCountry.name} (karma: ${affectedCountry.playerKarma})`)
    } else {
      affectedCountry =
        vulnerableCountries.length > 0
          ? vulnerableCountries[Math.floor(Math.random() * vulnerableCountries.length)]
          : countries[Math.floor(Math.random() * countries.length)]
    }
  } else {
    // Eventos positivos pueden afectar a cualquier país
    affectedCountry = countries[Math.floor(Math.random() * countries.length)]
  }

  let eventTypes: string[]
  if (isNegativeEvent) {
    eventTypes = [...negativeEvents, ...neutralEvents]
  } else {
    eventTypes = [...positiveEvents, ...neutralEvents]
  }

  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  const secondaryCountry = countries[Math.floor(Math.random() * countries.length)]

  const makeId = () => `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const events: Record<string, () => GameEvent> = {
    // ========== EVENTOS NEGATIVOS MEJORADOS ==========
    economic_crisis: () => ({
      id: makeId(),
      type: "warning",
      title: "💸 Crisis Económica Severa",
      description: `Una crisis financiera devastadora ha golpeado a ${affectedCountry.name}${(affectedCountry.playerKarma || 0) > 30 ? ", posiblemente como consecuencia de acciones previas" : ""}`,
      effects: [
        `PIB de ${affectedCountry.name} severamente reducido`,
        "Volatilidad extrema en mercados",
        "Posible intervención de aliados",
        (affectedCountry.playerKarma || 0) > 30
          ? "Consecuencias de acciones hostiles previas"
          : "Crisis económica natural",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: -1500 - (affectedCountry.playerKarma || 0) * 10, // Más severo con alto karma
          stabilityChange: -30 - Math.floor((affectedCountry.playerKarma || 0) / 5), // Más severo con alto karma
          debtChange: 15,
          resourceEffects: {
            petróleo: -25,
            "gas natural": -20,
            oro: -15,
          },
        },
      },
      isPlayerTriggered: (affectedCountry.playerKarma || 0) > 30,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    // Nuevo evento específico de karma
    karma_rebellion: () => ({
      id: makeId(),
      type: "error",
      title: "✊ Rebelión Popular Masiva",
      description: `El pueblo de ${affectedCountry.name} se ha levantado en una rebelión masiva, aparentemente en respuesta a las acciones hostiles sufridas`,
      effects: [
        "Levantamiento popular generalizado",
        "Gobierno bajo asedio",
        "Infraestructura atacada por rebeldes",
        "Consecuencia directa de acciones hostiles previas",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -50, // Muy severo
          economyChange: -1000,
          populationChange: -2000000,
          debtChange: 20,
        },
      },
      isPlayerTriggered: true,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    natural_disaster: () => ({
      id: makeId(),
      type: "error",
      title: "🌪️ Desastre Natural Devastador",
      description: `Un desastre natural catastrófico ha devastado ${affectedCountry.name}${(affectedCountry.playerKarma || 0) > 20 ? ". Algunos sospechan que no es completamente natural..." : ""}`,
      effects: [
        `Infraestructura de ${affectedCountry.name} severamente dañada`,
        "Producción de recursos paralizada",
        "Crisis humanitaria masiva",
        (affectedCountry.playerKarma || 0) > 20 ? "Sospechas de manipulación climática" : "Desastre natural confirmado",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -35 - Math.floor((affectedCountry.playerKarma || 0) / 10),
          economyChange: -1200 - (affectedCountry.playerKarma || 0) * 5,
          populationChange: -1500000,
          resourceEffects: {
            agricultura: -60,
            madera: -50,
            pescado: -40,
          },
        },
      },
      isPlayerTriggered: (affectedCountry.playerKarma || 0) > 20,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    // ========== EVENTOS POSITIVOS ==========
    technological_breakthrough: () => ({
      id: makeId(),
      type: "success",
      title: "🚀 Avance Tecnológico Revolucionario",
      description: `${affectedCountry.name} ha logrado un avance tecnológico que revolucionará múltiples industrias`,
      effects: [
        `PIB de ${affectedCountry.name} aumentado significativamente`,
        "Ventaja competitiva tecnológica global",
        "Compartiendo beneficios con aliados",
        "Atracción de inversión internacional",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 1200,
          stabilityChange: 20,
          debtChange: -8,
          resourceEffects: {
            tecnología: 80,
            semiconductores: 70,
            energía: 50,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    resource_discovery: () => ({
      id: makeId(),
      type: "success",
      title: "💎 Descubrimiento Masivo de Recursos",
      description: `${affectedCountry.name} ha descubierto depósitos masivos de recursos estratégicos que cambiarán su economía`,
      effects: [
        `PIB de ${affectedCountry.name} aumentado dramáticamente`,
        "Nueva fuente de ingresos a largo plazo",
        "Interés geopolítico internacional aumentado",
        "Oportunidades de exportación expandidas",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 1500,
          stabilityChange: 25,
          debtChange: -12,
          resourceEffects: {
            petróleo: 100,
            "gas natural": 80,
            oro: 70,
            litio: 90,
            "tierras raras": 60,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    african_mineral_boom: () => ({
      id: makeId(),
      type: "success",
      title: "⛏️ Boom Minero Africano Histórico",
      description: `${affectedCountry.name} ha descubierto los depósitos minerales más ricos de la historia africana moderna`,
      effects: [
        "Descubrimiento de minerales estratégicos únicos",
        "Inversión extranjera masiva garantizada",
        "Desarrollo de infraestructura minera avanzada",
        "Cooperación reforzada con otros países africanos",
        "Potencial para liderar mercados globales",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 2000,
          stabilityChange: 30,
          debtChange: -20,
          resourceEffects: {
            oro: 150,
            diamantes: 120,
            platino: 130,
            cobre: 100,
            hierro: 80,
            bauxita: 140,
            manganeso: 110,
            "tierras raras": 90,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    // Continuar con más eventos...
    pandemic_outbreak: () => ({
      id: makeId(),
      type: "error",
      title: "🦠 Brote Pandémico Severo",
      description: `Una nueva enfermedad altamente contagiosa se ha originado en ${affectedCountry.name}${(affectedCountry.playerKarma || 0) > 25 ? ", posiblemente relacionada con actividades sospechosas previas" : ""}`,
      effects: [
        "Sistema de salud completamente saturado",
        "Cuarentenas masivas implementadas",
        "Cooperación sanitaria internacional urgente",
        (affectedCountry.playerKarma || 0) > 25
          ? "Investigación sobre posibles causas artificiales"
          : "Origen natural confirmado",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -45 - Math.floor((affectedCountry.playerKarma || 0) / 8),
          economyChange: -1800 - (affectedCountry.playerKarma || 0) * 8,
          populationChange: -2500000,
          debtChange: 25,
          resourceEffects: {
            servicios: -70,
            turismo: -90,
            manufactura: -55,
          },
        },
      },
      isPlayerTriggered: (affectedCountry.playerKarma || 0) > 25,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    diplomatic_incident: () => ({
      id: makeId(),
      type: "warning",
      title: "🏛️ Crisis Diplomática Internacional",
      description: `Tensiones diplomáticas severas han estallado entre ${affectedCountry.name} y ${secondaryCountry.name}`,
      effects: [
        "Relaciones bilaterales severamente dañadas",
        "Mediación internacional urgente requerida",
        "Posibles sanciones económicas mutuas",
        "Escalada diplomática en desarrollo",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -15,
          economyChange: -300,
        },
        [secondaryCountry.id]: {
          stabilityChange: -12,
          economyChange: -250,
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),
  }

  // ------------------------------------------------------------------
  //  Create the event (with a safe fall-back in case the key is missing)
  // ------------------------------------------------------------------
  const fallbackEventFactory = (): GameEvent => {
    // Generar títulos específicos basados en el tipo de evento
    const eventTitles: Record<string, { title: string; description: string }> = {
      // Eventos negativos específicos
      political_uprising: {
        title: "✊ Levantamiento Político",
        description: `Protestas masivas han estallado en ${affectedCountry.name} exigiendo cambios políticos radicales`
      },
      conspiracy_exposed: {
        title: "🕵️ Conspiración Revelada",
        description: `Una conspiración de alto nivel ha sido expuesta en ${affectedCountry.name}, causando conmoción nacional`
      },
      trade_disruption: {
        title: "📦 Interrupción Comercial Masiva",
        description: `Las rutas comerciales de ${affectedCountry.name} han sido severamente interrumpidas`
      },
      climate_change: {
        title: "🌡️ Impacto del Cambio Climático",
        description: `${affectedCountry.name} sufre los efectos devastadores del cambio climático acelerado`
      },
      cyber_warfare: {
        title: "💻 Guerra Cibernética",
        description: `${affectedCountry.name} ha sido objetivo de un ataque cibernético masivo`
      },
      energy_crisis: {
        title: "⚡ Crisis Energética Severa",
        description: `Una crisis energética sin precedentes afecta a ${affectedCountry.name}`
      },
      food_shortage: {
        title: "🌾 Escasez Alimentaria Crítica",
        description: `${affectedCountry.name} enfrenta una escasez alimentaria que amenaza la estabilidad social`
      },
      refugee_crisis: {
        title: "🏃 Crisis de Refugiados",
        description: `Una masiva crisis de refugiados impacta a ${affectedCountry.name}`
      },
      terrorist_attack: {
        title: "💥 Ataque Terrorista",
        description: `Un ataque terrorista coordinado ha sacudido a ${affectedCountry.name}`
      },
      cultural_revolution: {
        title: "🎭 Revolución Cultural",
        description: `Una revolución cultural radical está transformando ${affectedCountry.name}`
      },
      military_coup: {
        title: "🪖 Golpe Militar",
        description: `Un golpe militar ha sacudido la estructura política de ${affectedCountry.name}`
      },
      volcanic_eruption: {
        title: "🌋 Erupción Volcánica Devastadora",
        description: `Una erupción volcánica masiva ha impactado severamente a ${affectedCountry.name}`
      },
      stock_market_crash: {
        title: "📉 Colapso del Mercado Bursátil",
        description: `Los mercados financieros de ${affectedCountry.name} han colapsado dramáticamente`
      },
      religious_uprising: {
        title: "⛪ Levantamiento Religioso",
        description: `Un levantamiento religioso masivo está transformando ${affectedCountry.name}`
      },
      nuclear_accident: {
        title: "☢️ Accidente Nuclear",
        description: `Un grave accidente nuclear ha ocurrido en ${affectedCountry.name}`
      },
      mass_migration: {
        title: "🚶 Migración Masiva",
        description: `${affectedCountry.name} experimenta una migración masiva que altera su demografía`
      },
      ocean_pollution: {
        title: "🌊 Contaminación Oceánica Severa",
        description: `La contaminación oceánica masiva afecta gravemente a ${affectedCountry.name}`
      },
      karma_economic_collapse: {
        title: "💸 Colapso Económico por Retribución",
        description: `${affectedCountry.name} sufre un colapso económico, posiblemente como consecuencia de acciones previas`
      },
      karma_cyber_retaliation: {
        title: "💻 Represalia Cibernética",
        description: `${affectedCountry.name} es víctima de una represalia cibernética coordinada`
      },
      
      // Eventos positivos específicos
      economic_boom: {
        title: "💰 Boom Económico Extraordinario",
        description: `${affectedCountry.name} experimenta un boom económico sin precedentes`
      },
      scientific_breakthrough: {
        title: "🧬 Descubrimiento Científico Revolucionario",
        description: `Científicos de ${affectedCountry.name} han logrado un descubrimiento que cambiará el mundo`
      },
      genetic_breakthrough: {
        title: "🧪 Avance Genético Histórico",
        description: `${affectedCountry.name} ha logrado un avance genético que revolucionará la medicina`
      },
      quantum_computing: {
        title: "⚛️ Revolución de la Computación Cuántica",
        description: `${affectedCountry.name} ha desarrollado tecnología de computación cuántica avanzada`
      },
      space_discovery: {
        title: "🚀 Descubrimiento Espacial Épico",
        description: `${affectedCountry.name} ha hecho un descubrimiento espacial que cautiva al mundo`
      },
      
      // Eventos neutrales específicos
      alien_contact: {
        title: "👽 Primer Contacto Extraterrestre",
        description: `${affectedCountry.name} ha sido el lugar del primer contacto oficial con vida extraterrestre`
      },
      AI_singularity: {
        title: "🤖 Singularidad de la Inteligencia Artificial",
        description: `${affectedCountry.name} ha alcanzado la singularidad tecnológica con IA`
      }
    }

    const eventInfo = eventTitles[eventType] || {
      title: isNegativeEvent ? "⚠️ Crisis Inesperada" : "✨ Desarrollo Positivo",
      description: isNegativeEvent 
        ? `Una situación inesperada ha surgido en ${affectedCountry.name}`
        : `Un desarrollo positivo ha ocurrido en ${affectedCountry.name}`
    }

    return {
    id: makeId(),
    type: isNegativeEvent ? "warning" : "success",
      title: eventInfo.title,
      description: eventInfo.description,
    effects: [
      isNegativeEvent
          ? "Impacto adverso en la economía y la estabilidad"
          : "Impulso económico y de estabilidad",
        "Situación en desarrollo",
        "Se requiere monitoreo continuo"
    ],
    countryEffects: {
      [affectedCountry.id]: {
        stabilityChange: isNegativeEvent ? -8 : 8,
        economyChange: isNegativeEvent ? -200 : 200,
      },
    },
    chaosLevel,
    timestamp: Date.now(),
    }
  }

  const mainEventFactory = events[eventType] ?? fallbackEventFactory
  const mainEvent = mainEventFactory()

  console.log(`🎲 Evento generado: ${mainEvent.title} afectando a ${affectedCountry.name} (Caos: ${chaosLevel}%)`)

  // Generar efectos de contagio solo si no es un evento estabilizador
  const contagionEvents =
    mainEvent.type !== "success" ? applyContagionEffects(mainEvent, countries, affectedCountry.id) : []

  return { mainEvent, contagionEvents }
}

// Función para generar eventos estabilizadores cuando hay mucho caos
function generateStabilizingEvent(eventType: string, affectedCountry: Country, chaosLevel: number): GameEvent {
  const makeId = () => `stabilizing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const stabilizingEvents: Record<string, () => GameEvent> = {
    international_aid: () => ({
      id: makeId(),
      type: "success",
      title: "🌍 Ayuda Humanitaria Internacional Masiva",
      description: `La comunidad internacional ha movilizado ayuda masiva para ${affectedCountry.name} para estabilizar la región`,
      effects: [
        "Ayuda humanitaria internacional coordinada",
        "Fondos de emergencia desbloqueados",
        "Misiones de paz desplegadas",
        "Estabilización regional prioritaria",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: 25,
          economyChange: 800,
          debtChange: -10,
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    peace_treaty_signed: () => ({
      id: makeId(),
      type: "success",
      title: "🕊️ Tratado de Paz Regional Firmado",
      description: `${affectedCountry.name} ha firmado un tratado de paz que estabiliza toda la región`,
      effects: [
        "Tratado de paz regional histórico",
        "Cese de hostilidades garantizado",
        "Cooperación económica renovada",
        "Estabilidad regional restaurada",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: 30,
          economyChange: 600,
          debtChange: -5,
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),
  }

  return stabilizingEvents[eventType] ? stabilizingEvents[eventType]() : stabilizingEvents.international_aid()
}

//------------------------------------------------------------
// Process Action con sistema de karma mejorado
//------------------------------------------------------------
export function processAction(action: GameAction, countries: Country[]): ActionResult {
  const source = countries.find((c) => c.id === action.sourceCountry)
  if (!source) return { success: false, updatedCountries: countries }

  const target =
    action.targetCountry && action.targetCountry !== action.sourceCountry
      ? countries.find((c) => c.id === action.targetCountry)
      : source

  let updated: Country[] = [...countries]

  // Actualizar karma ANTES de procesar la acción
  if (action.targetCountry && action.sourceCountry !== action.targetCountry) {
    action.severity = getActionSeverity(action.type)
    updated = updatePlayerKarma(updated, action)
  }

  const deductCostFromSource = (cost: number) => {
    updated = updated.map((c) => {
      if (c.id === source.id) {
        const newGDP = Math.max(0, c.economy.gdp - cost)
        const debtIncrease = cost > c.economy.gdp ? ((cost - c.economy.gdp) / c.economy.gdp) * 100 : 0

        return {
          ...c,
          economy: {
            ...c.economy,
            gdp: newGDP,
            debt: Math.min(300, c.economy.debt + debtIncrease),
          },
        }
      }
      return c
    })
  }

  // Verificar si el país puede pagar (considerando endeudamiento)
  const maxAffordable = source.economy.gdp + (source.economy.gdp * (200 - source.economy.debt)) / 100

  if (action.cost > maxAffordable) {
    return {
      success: false,
      updatedCountries: countries,
      event: {
        id: `failed_${Date.now()}`,
        type: "error",
        title: "💸 Capacidad de Endeudamiento Agotada",
        description: `${source.name} no puede financiar esta acción ni siquiera con deuda adicional`,
        effects: [
          `Se requieren $${action.cost}B`,
          `PIB disponible: $${source.economy.gdp}B`,
          `Deuda actual: ${source.economy.debt}% del PIB`,
          "Límite de endeudamiento alcanzado",
        ],
        timestamp: Date.now(),
      },
    }
  }

  switch (action.type) {
    case "economic_investment": {
      deductCostFromSource(action.cost)
      const stabilityBoost = Math.min(10, Math.max(3, Math.floor(action.cost / 200)))
      const economicReturn = Math.round(action.cost * 0.6)
      const debtReduction = Math.max(1, Math.floor(action.cost / 500))

      updated = updated.map((c) =>
        c.id === source.id
          ? {
              ...c,
              economy: {
                ...c.economy,
                gdp: c.economy.gdp + economicReturn,
                debt: Math.max(0, c.economy.debt - debtReduction),
              },
              stability: clamp(c.stability + stabilityBoost, 0, 100),
            }
          : c,
      )

      return {
        success: true,
        updatedCountries: updated,
        event: {
          id: `success_${Date.now()}`,
          type: "success",
          title: "💰 Inversión Económica Exitosa",
          description: `${source.name} ha invertido exitosamente en su economía`,
          effects: [
            `PIB aumentado en $${economicReturn}B`,
            `Estabilidad mejorada en ${stabilityBoost}%`,
            `Deuda reducida en ${debtReduction}%`,
          ],
          timestamp: Date.now(),
        },
      }
    }

    case "debt_emission": {
      // Solo Estados Unidos e Israel pueden emitir deuda internacional
      if (source.id !== "usa" && source.id !== "israel") {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `failed_${Date.now()}`,
            type: "error",
            title: "❌ Emisión de Deuda No Autorizada",
            description: `${source.name} no tiene el privilegio de emitir deuda internacional`,
            effects: [
              "Solo Estados Unidos e Israel pueden emitir deuda internacional",
              "Privilegio reservado a países con monedas de reserva",
            ],
            timestamp: Date.now(),
          },
        }
      }

      // Calcular cantidad de deuda a emitir
      const debtAmount = source.id === "usa" 
        ? Math.round(source.economy.gdp * 0.3) // 30% del PIB para USA
        : Math.round(source.economy.gdp * 0.2)  // 20% del PIB para Israel
      
      const debtIncrease = source.id === "usa" ? 15 : 20 // USA tiene mejor rating crediticio

      updated = updated.map((c) =>
        c.id === source.id
          ? {
              ...c,
              economy: {
                ...c.economy,
                gdp: c.economy.gdp + debtAmount,
                debt: Math.min(300, c.economy.debt + debtIncrease),
              },
            }
          : c,
      )

      return {
        success: true,
        updatedCountries: updated,
        event: {
          id: `debt_emission_${Date.now()}`,
          type: "success",
          title: "💰 Emisión de Deuda Internacional Exitosa",
          description: `${source.name} ha emitido deuda internacional con éxito`,
          effects: [
            `PIB aumentado en $${debtAmount}B`,
            `Deuda nacional aumentada en ${debtIncrease}%`,
            `Liquidez internacional mejorada`,
            source.id === "usa" 
              ? "Privilegio del dólar como moneda de reserva"
              : "Respaldo de aliados internacionales",
          ],
          timestamp: Date.now(),
        },
      }
    }

    case "military_action": {
      if (!target) break
      deductCostFromSource(action.cost)

      const sourceMilitary = source.militaryStrength || 50
      const targetMilitary = target.militaryStrength || 50
      const militaryRatio = sourceMilitary / (targetMilitary + 10)

      // El karma del jugador afecta la resistencia del objetivo
      const karmaResistance = Math.min(20, (target.playerKarma || 0) / 2) // Hasta 20% más resistencia
      const successChance = Math.min(0.9, Math.max(0.3, militaryRatio * 0.6 - karmaResistance / 100))
      const success = Math.random() < successChance

      if (success) {
        const stabilityDamage = Math.min(35, Math.max(10, Math.floor(militaryRatio * 20)))
        const sourceDamage = Math.min(15, Math.max(3, Math.floor(stabilityDamage * 0.4)))

        updated = updated.map((c) => {
          if (c.id === target.id) return applyStabilityChange(c, -stabilityDamage)
          if (c.id === source.id) return applyStabilityChange(c, -sourceDamage)
          return c
        })

        return {
          success: true,
          updatedCountries: updated,
          event: {
            id: `war_${Date.now()}`,
            type: "warning",
            title: "⚔️ Operación Militar Exitosa",
            description: `${source.name} ha ejecutado una operación militar contra ${target?.name}${karmaResistance > 0 ? ", que ofreció resistencia inesperada" : ""}`,
            effects: [
              `Estabilidad de ${target?.name} reducida en ${stabilityDamage}%`,
              `Estabilidad de ${source.name} reducida en ${sourceDamage}%`,
              `Éxito militar confirmado`,
              karmaResistance > 0
                ? `Resistencia popular aumentada (+${karmaResistance.toFixed(1)}%)`
                : "Resistencia mínima encontrada",
            ],
            timestamp: Date.now(),
          },
        }
      } else {
        const failureDamage = Math.min(20, Math.max(8, Math.floor(15 / militaryRatio) + karmaResistance))

        updated = updated.map((c) => (c.id === source.id ? applyStabilityChange(c, -failureDamage) : c))

        return {
          success: false,
          updatedCountries: updated,
          event: {
            id: `war_failed_${Date.now()}`,
            type: "error",
            title: "⚔️ Operación Militar Fallida",
            description: `La operación militar de ${source.name} contra ${target?.name} ha fracasado${karmaResistance > 0 ? " debido a la feroz resistencia popular" : ""}`,
            effects: [
              `Estabilidad de ${source.name} reducida en ${failureDamage}%`,
              "Recursos militares perdidos",
              "Prestigio internacional severamente dañado",
              karmaResistance > 0 ? "Resistencia popular inesperadamente fuerte" : "Fallo táctico confirmado",
            ],
            timestamp: Date.now(),
          },
        }
      }
    }

    case "special_conquest": {
      if (!target || target.stability > 20) {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `conquest_failed_${Date.now()}`,
            type: "error",
            title: "🏴 Conquista Imposible",
            description: `${target?.name || "El país objetivo"} no está lo suficientemente desestabilizado para ser conquistado`,
            effects: ["Se requiere que el país tenga menos del 20% de estabilidad"],
            timestamp: Date.now(),
          },
        }
      }

      const conquestCost = Math.max(action.cost, target.economy.gdp * 0.8)

      if (conquestCost > maxAffordable) {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `conquest_failed_${Date.now()}`,
            type: "error",
            title: "💸 Fondos Insuficientes para Conquista",
            description: `La conquista de ${target.name} requiere $${conquestCost}B, capacidad máxima: $${maxAffordable}B`,
            effects: ["La conquista de países requiere enormes recursos"],
            timestamp: Date.now(),
          },
        }
      }

      deductCostFromSource(conquestCost)

      updated = updated.map((c) => {
        if (c.id === target.id) {
          return {
            ...c,
            ownedBy: source.id,
            stability: 35,
            playerKarma: 0, // Reset karma tras conquista
            economy: {
              ...c.economy,
              debt: Math.min(150, c.economy.debt + 20),
            },
          }
        }
        return c
      })

      return {
        success: true,
        updatedCountries: updated,
        event: {
          id: `special_conquest_${Date.now()}`,
          type: "success",
          title: "👑 Conquista Imperial Exitosa",
          description: `${source.name} ha conquistado exitosamente ${target.name}`,
          effects: [
            `${target.name} ahora es parte de tu imperio`,
            `Costo de conquista: $${conquestCost}B`,
            "Estabilidad del territorio restaurada al 35%",
            "Karma del territorio reiniciado",
            "Deuda del territorio aumentada por ocupación",
            "Ahora debes gestionar este territorio",
          ],
          timestamp: Date.now(),
        },
      }
    }

    // Continuar con otros casos de acción...
    default: {
      if (action.cost > 0) deductCostFromSource(action.cost)
      return {
        success: true,
        updatedCountries: updated,
        event: {
          id: `generic_${Date.now()}`,
          type: "info",
          title: "⚡ Acción Ejecutada",
          description: `${source.name} ha ejecutado una acción`,
          effects: [`Costo: $${action.cost}B`],
          timestamp: Date.now(),
        },
      }
    }
  }

  return { success: true, updatedCountries: updated }
}
