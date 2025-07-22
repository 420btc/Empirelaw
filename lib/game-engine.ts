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

// Sistema de retaliación
function scheduleRetaliation(countries: Country[], attackedCountryId: string, attackerCountryId: string, retaliationType: string): void {
  // Esta función programa una retaliación que se ejecutará en el próximo turno
  // Por ahora, simplemente marca que habrá consecuencias
  console.log(`🎯 Retaliación programada: ${attackedCountryId} vs ${attackerCountryId} (${retaliationType})`)
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
              gdp: Math.max(0, c.economy.gdp - Math.round(aidAmount * 0.7)), // El ayudante pierde menos de lo que da
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

      console.log(`🤝 Ayuda mutua: ${bestHelper.name} → ${criticalCountry.name} ($${aidAmount}B, +${stabilityBoost}% estabilidad)`)
    }
  })

  return { updatedCountries, aidEvents };
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

  // 🛡️ SISTEMA DE PROTECCIÓN TEMPORAL: Evitar eventos consecutivos en el mismo país
  const currentTime = Date.now()
  const protectionPeriod = 5 * 60 * 1000 // 5 minutos de protección
  
  // Obtener países que han tenido eventos recientes (excluyendo ayudas mutuas)
  const recentlyAffectedCountries = recentEvents
    .filter(event => {
      const timeDiff = currentTime - event.timestamp
      const isRecent = timeDiff < protectionPeriod
      const isNotMutualAid = !event.title?.includes("Ayuda Mutua") && !event.title?.includes("Mutual Aid")
      return isRecent && isNotMutualAid && event.targetedCountry
    })
    .map(event => event.targetedCountry)
    .filter((id): id is string => !!id)

  console.log(`🛡️ Países con protección temporal (${recentlyAffectedCountries.length}):`, recentlyAffectedCountries)

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
    // 8 nuevos eventos positivos
    "space_tourism_boom",
    "digital_currency_adoption",
    "cultural_renaissance",
    "medical_breakthrough",
    "renewable_energy_revolution",
    "educational_reform_success",
    "infrastructure_modernization",
    "agricultural_innovation",
    // 10 nuevos eventos positivos adicionales
    "quantum_computing_breakthrough",
    "ocean_cleanup_success",
    "universal_basic_income_trial",
    "fusion_energy_achievement",
    "biodiversity_restoration",
    "mental_health_revolution",
    "smart_city_implementation",
    "genetic_disease_cure",
    "sustainable_transport_boom",
    "cultural_exchange_program",
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
    // 11 NUEVOS EVENTOS DE CONSPIRACIÓN
    "illuminati_manipulation",
    "masonic_lodge_exposed",
    "weather_manipulation_exposed",
    "deep_state_purge",
    "mind_control_experiment",
    "shadow_government_revealed",
    "alien_technology_leak",
    "pharmaceutical_conspiracy",
    "financial_elite_exposed",
    "media_brainwashing_exposed",
    "population_control_agenda",
    // 7 nuevos eventos caóticos
    "ai_rebellion",
    "dimensional_rift",
    "zombie_outbreak",
    "time_anomaly",
    "ancient_curse_activated",
    "gravity_anomaly",
    "reality_glitch",
    // 8 nuevos eventos negativos adicionales
    "social_media_manipulation",
    "supply_chain_collapse",
    "digital_infrastructure_attack",
    "water_scarcity_crisis",
    "space_debris_collision",
    "genetic_modification_disaster",
    "quantum_computer_hack",
    "artificial_intelligence_malfunction",
  ]

  const neutralEvents = [
    "diplomatic_incident", 
    "alien_contact", 
    "AI_singularity",
    // 7 nuevos eventos neutrales
    "international_summit",
    "cultural_festival",
    "scientific_collaboration",
    "trade_agreement_proposal",
    "environmental_conference",
    "space_exploration_mission",
    "archaeological_discovery"
  ]

  // SELECCIÓN INTELIGENTE DE PAÍS AFECTADO CON HOSTILIDAD DIRIGIDA
  let affectedCountry: Country = countries[Math.floor(Math.random() * countries.length)] // Inicialización por defecto

  // 🎯 HOSTILIDAD ESPECIAL: Si el jugador es USA, China y Rusia atacan más
  const playerCountry = countries.find(c => c.id === playerCountryId)
  const isPlayerUSA = playerCountryId === "usa"
  const chinaCountry = countries.find(c => c.id === "china")
  const russiaCountry = countries.find(c => c.id === "russia")

  if (isNegativeEvent) {
    // NUEVA LÓGICA: Si jugador es USA, 40% chance de que China/Rusia lo ataquen directamente
    if (isPlayerUSA && Math.random() < 0.4) {
      const usaCountry = countries.find(c => c.id === "usa")
      if (usaCountry && !recentlyAffectedCountries.includes("usa")) {
        affectedCountry = usaCountry
        console.log(`🎯 HOSTILIDAD DIRIGIDA: China/Rusia atacando a Estados Unidos (Jugador)`)
      }
      else if (usaCountry && recentlyAffectedCountries.includes("usa")) {
        console.log(`🛡️ Estados Unidos protegido temporalmente, buscando otro objetivo`)
        // Buscar otro objetivo que no esté protegido
        const availableCountries = countries.filter(c => !recentlyAffectedCountries.includes(c.id) && !c.isSovereign)
        affectedCountry = availableCountries.length > 0 
          ? availableCountries[Math.floor(Math.random() * availableCountries.length)]
          : countries[Math.floor(Math.random() * countries.length)]
      }
    }
    // Para eventos negativos, priorizar países con alto karma del jugador (PERO EXCLUIR PROTEGIDOS)
    else {
      const highKarmaCountries = countries.filter((c) => 
        (c.playerKarma || 0) > 30 && 
        !c.isSovereign && 
        !recentlyAffectedCountries.includes(c.id) // 🛡️ EXCLUSIÓN DE PROTEGIDOS
      )
      const vulnerableCountries = countries.filter((c) => 
        c.powerLevel !== "superpower" && 
        !c.isSovereign && 
        !recentlyAffectedCountries.includes(c.id) // 🛡️ EXCLUSIÓN DE PROTEGIDOS
      )

    if (highKarmaCountries.length > 0 && Math.random() < 0.7) {
        // 70% de probabilidad de afectar a países con alto karma (no protegidos)
      affectedCountry = highKarmaCountries[Math.floor(Math.random() * highKarmaCountries.length)]
      console.log(`⚖️ Evento dirigido por karma hacia ${affectedCountry.name} (karma: ${affectedCountry.playerKarma})`)
      } else if (vulnerableCountries.length > 0) {
        affectedCountry = vulnerableCountries[Math.floor(Math.random() * vulnerableCountries.length)]
        console.log(`🎯 Evento dirigido a país vulnerable: ${affectedCountry.name}`)
    } else {
        // Si todos los países vulnerables están protegidos, seleccionar cualquiera disponible
        const availableCountries = countries.filter(c => !recentlyAffectedCountries.includes(c.id))
        if (availableCountries.length > 0) {
          affectedCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)]
          console.log(`🎲 Seleccionando país disponible: ${affectedCountry.name}`)
        } else {
          // En caso extremo, seleccionar cualquier país (la protección no es absoluta)
          affectedCountry = countries[Math.floor(Math.random() * countries.length)]
          console.log(`⚠️ Todos los países protegidos, seleccionando aleatoriamente: ${affectedCountry.name}`)
        }
      }
    }
  } else {
    // Eventos positivos: preferir países que no han tenido eventos recientes, pero no es obligatorio
    const availableCountries = countries.filter(c => !recentlyAffectedCountries.includes(c.id))
    
    if (availableCountries.length > 0 && Math.random() < 0.7) {
      // 70% de probabilidad de elegir un país sin eventos recientes
      affectedCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)]
      console.log(`🌟 Evento positivo para país sin eventos recientes: ${affectedCountry.name}`)
    } else {
      // 30% de probabilidad de elegir cualquier país (eventos positivos son más flexibles)
    affectedCountry = countries[Math.floor(Math.random() * countries.length)]
      console.log(`🎲 Evento positivo aleatorio: ${affectedCountry.name}`)
    }
  }

  let eventTypes: string[]
  if (isNegativeEvent) {
    eventTypes = [...negativeEvents, ...neutralEvents]
  } else {
    eventTypes = [...positiveEvents, ...neutralEvents]
  }

  let eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  
  // 🌍 RESTRICCIÓN AFRICANA: Limitar eventos científicos y tecnológicos para países africanos
  const scientificEvents = [
    "technological_breakthrough",
    "scientific_breakthrough",
    "genetic_breakthrough",
    "quantum_computing",
    "space_discovery",
    "space_tourism_boom",
    "digital_currency_adoption",
    "medical_breakthrough",
    "renewable_energy_revolution",
    "AI_singularity",
    "alien_technology_leak"
  ]
  
  // Si el país afectado es africano y el evento es científico/tecnológico, cambiar por evento más básico
  if (affectedCountry.geopoliticalBlock === "africa" && scientificEvents.includes(eventType)) {
    const africanFriendlyEvents = [
      "resource_discovery",
      "african_mineral_boom",
      "agricultural_innovation",
      "infrastructure_modernization",
      "cultural_renaissance",
      "educational_reform_success",
      "economic_boom"
    ]
    
    // 80% de probabilidad de cambiar a evento más apropiado para África
    if (Math.random() < 0.8) {
      eventType = africanFriendlyEvents[Math.floor(Math.random() * africanFriendlyEvents.length)]
      console.log(`🌍 Evento científico limitado para país africano ${affectedCountry.name}, cambiado a: ${eventType}`)
    }
  }
  
  // 🧠 SISTEMA DE COHERENCIA: Evitar eventos contradictorios
  const recentCountryEvents = recentEvents
    .filter(event => event.targetedCountry === affectedCountry.id)
    .slice(-2) // Solo los 2 eventos más recientes del país
  
  // Definir eventos contradictorios
  const contradictoryPairs: Record<string, string[]> = {
    "economic_crisis": ["economic_boom", "resource_discovery", "technological_breakthrough"],
    "economic_boom": ["economic_crisis", "stock_market_crash", "trade_disruption"],
    "natural_disaster": ["infrastructure_modernization", "agricultural_innovation"],
    "technological_breakthrough": ["ai_rebellion", "cyber_warfare"],
    "medical_breakthrough": ["pandemic_outbreak", "zombie_outbreak"],
    "renewable_energy_revolution": ["energy_crisis", "nuclear_accident"],
    "cultural_renaissance": ["cultural_revolution", "religious_uprising"],
    "space_tourism_boom": ["dimensional_rift", "alien_contact"],
    "agricultural_innovation": ["food_shortage", "natural_disaster"],
    "infrastructure_modernization": ["natural_disaster", "volcanic_eruption"],
    "reality_glitch": ["technological_breakthrough", "digital_currency_adoption"],
  }
  
  // Verificar si el evento seleccionado contradice eventos recientes
  const hasContradiction = recentCountryEvents.some(recentEvent => {
    const recentEventType = Object.keys(contradictoryPairs).find(key => 
      recentEvent.title?.toLowerCase().includes(key.replace(/_/g, ' '))
    )
    if (recentEventType && contradictoryPairs[recentEventType]) {
      return contradictoryPairs[recentEventType].includes(eventType)
    }
    return false
  })
  
  // Si hay contradicción, elegir un evento alternativo más coherente
  if (hasContradiction) {
    const alternativeEvents = eventTypes.filter(type => {
      return !recentCountryEvents.some(recentEvent => {
        const recentEventType = Object.keys(contradictoryPairs).find(key => 
          recentEvent.title?.toLowerCase().includes(key.replace(/_/g, ' '))
        )
        return recentEventType && contradictoryPairs[recentEventType]?.includes(type)
      })
    })
    
    if (alternativeEvents.length > 0) {
      eventType = alternativeEvents[Math.floor(Math.random() * alternativeEvents.length)]
      console.log(`🧠 Evento modificado por coherencia: ${eventType} (evitando contradicción)`)
    }
  }

  const secondaryCountry = countries[Math.floor(Math.random() * countries.length)]

  const makeId = () => `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const events: Record<string, () => GameEvent> = {
    // ========== EVENTOS NEGATIVOS MEJORADOS ==========
    economic_crisis: () => ({
      id: makeId(),
      type: "warning", // Crisis económica fuerte pero no colapso total
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
      type: "error", // Rebelión masiva: evento catastrófico
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
          debtChange: 20,
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

    // ========== 11 EVENTOS DE CONSPIRACIÓN ESPECÍFICOS ==========
    illuminati_manipulation: () => ({
      id: makeId(),
      type: "error",
      title: "👁️ Manipulación Illuminati Detectada",
      description: `Evidencia de manipulación secreta por sociedades ocultas ha sido descubierta en ${affectedCountry.name}`,
      effects: [
        "Estructuras de poder ocultas expuestas",
        "Desconfianza masiva en instituciones",
        "Protestas anti-establishment generalizadas",
        "Investigaciones gubernamentales iniciadas",
        "Redes de conspiración desmanteladas",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -40,
          economyChange: -1200,
          debtChange: 15,
          resourceEffects: {
            servicios: -50,
            turismo: -60,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    masonic_lodge_exposed: () => ({
      id: makeId(),
      type: "warning",
      title: "🏛️ Logia Masónica Expuesta",
      description: `Una poderosa logia masónica que controlaba sectores clave de ${affectedCountry.name} ha sido expuesta públicamente`,
      effects: [
        "Redes de influencia masónica reveladas",
        "Escándalo de corrupción institucional",
        "Renuncias masivas en el gobierno",
        "Reformas de transparencia exigidas",
        "Pérdida de confianza en élites",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -35,
          economyChange: -800,
          debtChange: 12,
          resourceEffects: {
            "servicios financieros": -70,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    weather_manipulation_exposed: () => ({
      id: makeId(),
      type: "error",
      title: "🌪️ Manipulación Climática Descubierta",
      description: `Evidencia de manipulación climática artificial ha sido descubierta afectando a ${affectedCountry.name}`,
      effects: [
        "Tecnología de geoingeniería expuesta",
        "Protestas ambientales masivas",
        "Demandas internacionales por daños",
        "Crisis de soberanía atmosférica",
        "Investigación de crímenes climáticos",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -45,
          economyChange: -1500,
          populationChange: -1000000,
          debtChange: 20,
          resourceEffects: {
            agricultura: -80,
            turismo: -70,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    deep_state_purge: () => ({
      id: makeId(),
      type: "warning",
      title: "🕴️ Purga del Estado Profundo",
      description: `Una purga masiva del "estado profundo" está ocurriendo en ${affectedCountry.name}, desestabilizando instituciones`,
      effects: [
        "Funcionarios clave removidos masivamente",
        "Servicios de inteligencia reestructurados",
        "Continuidad gubernamental amenazada",
        "Facciones políticas en guerra",
        "Crisis de gobernabilidad institucional",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -50,
          economyChange: -1000,
          debtChange: 18,
          resourceEffects: {
            servicios: -60,
            tecnología: -40,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    mind_control_experiment: () => ({
      id: makeId(),
      type: "error",
      title: "🧠 Experimento de Control Mental Expuesto",
      description: `Experimentos secretos de control mental han sido descubiertos en ${affectedCountry.name}, causando pánico masivo`,
      effects: [
        "Experimentos psicológicos ilegales revelados",
        "Víctimas de experimentos demandando justicia",
        "Crisis de confianza en ciencia gubernamental",
        "Protestas por derechos humanos",
        "Investigaciones internacionales iniciadas",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -55,
          economyChange: -1800,
          populationChange: -500000,
          debtChange: 25,
          resourceEffects: {
            tecnología: -90,
            servicios: -70,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    shadow_government_revealed: () => ({
      id: makeId(),
      type: "error", // Gobierno en las sombras: evento catastrófico
      title: "👤 Gobierno en las Sombras Revelado",
      description: `Un gobierno paralelo que operaba en secreto en ${affectedCountry.name} ha sido completamente expuesto`,
      effects: [
        "Estructuras de poder paralelas desmanteladas",
        "Documentos clasificados filtrados masivamente",
        "Crisis constitucional sin precedentes",
        "Llamados a refundación del estado",
        "Intervención internacional considerada",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -60,
          economyChange: -2000,
          debtChange: 30,
          resourceEffects: {
            "servicios financieros": -80,
            servicios: -75,
            tecnología: -50,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    alien_technology_leak: () => ({
      id: makeId(),
      type: "warning",
      title: "👽 Filtración de Tecnología Alienígena",
      description: `Documentos sobre tecnología extraterrestre en posesión del gobierno de ${affectedCountry.name} han sido filtrados`,
      effects: [
        "Evidencia de contacto extraterrestre confirmada",
        "Tecnología avanzada mantenida en secreto",
        "Demandas de transparencia total",
        "Pánico y fascinación pública simultánea",
        "Reevaluación de la historia humana",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -30,
          economyChange: -500,
          debtChange: 10,
          resourceEffects: {
            tecnología: 100, // Paradójicamente beneficia la tecnología
            servicios: -40,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    pharmaceutical_conspiracy: () => ({
      id: makeId(),
      type: "error",
      title: "💊 Conspiración Farmacéutica Masiva",
      description: `Una conspiración masiva de la industria farmacéutica para suprimir curas ha sido expuesta en ${affectedCountry.name}`,
      effects: [
        "Supresión de curas médicas revelada",
        "Demandas colectivas multimillonarias",
        "Crisis de confianza en sistema de salud",
        "Reformas médicas urgentes requeridas",
        "Investigación de crímenes contra humanidad",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -45,
          economyChange: -1600,
          populationChange: -800000,
          debtChange: 22,
          resourceEffects: {
            servicios: -65,
            tecnología: -30,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    financial_elite_exposed: () => ({
      id: makeId(),
      type: "warning", // Elite financiera expuesta: negativo pero no colapso
      title: "💰 Élite Financiera Global Expuesta",
      description: `Las manipulaciones secretas de la élite financiera global han sido expuestas, afectando gravemente a ${affectedCountry.name}`,
      effects: [
        "Manipulación de mercados globales revelada",
        "Esquemas de evasión fiscal expuestos",
        "Crisis de legitimidad del sistema financiero",
        "Protestas anti-Wall Street masivas",
        "Reformas financieras radicales exigidas",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -40,
          economyChange: -2200,
          debtChange: 35,
          resourceEffects: {
            "servicios financieros": -90,
            oro: -50,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    media_brainwashing_exposed: () => ({
      id: makeId(),
      type: "warning", // Manipulación mediática: negativo pero no catastrófico
      title: "📺 Lavado de Cerebro Mediático Expuesto",
      description: `Técnicas de lavado de cerebro masivo a través de medios de comunicación han sido reveladas en ${affectedCountry.name}`,
      effects: [
        "Manipulación psicológica masiva revelada",
        "Boicots a medios tradicionales",
        "Crisis de credibilidad informativa",
        "Surgimiento de medios alternativos",
        "Demandas por daños psicológicos colectivos",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -35,
          economyChange: -900,
          debtChange: 15,
          resourceEffects: {
            servicios: -55,
            turismo: -45,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    population_control_agenda: () => ({
      id: makeId(),
      type: "error",
      title: "👥 Agenda de Control Poblacional Revelada",
      description: `Una agenda secreta de control poblacional ha sido descubierta operando en ${affectedCountry.name}`,
      effects: [
        "Programas de reducción poblacional expuestos",
        "Esterilización masiva encubierta revelada",
        "Crisis de derechos reproductivos",
        "Protestas por genocidio demográfico",
        "Tribunal internacional de derechos humanos convocado",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -65,
          economyChange: -1400,
          populationChange: -2000000,
          debtChange: 40,
          resourceEffects: {
            servicios: -80,
            agricultura: -60,
          },
        },
      },
      isPlayerTriggered: false,
      targetedCountry: affectedCountry.id,
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    // Continuar con más eventos...
    pandemic_outbreak: () => ({
      id: makeId(),
      type: "error", // Pandemia severa: evento catastrófico
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

    // ========== 15 NUEVOS EVENTOS VARIADOS ==========
    
    // EVENTOS NORMALES (1-8)
    space_tourism_boom: () => ({
      id: makeId(),
      type: "success",
      title: "🚀 Boom del Turismo Espacial",
      description: `${affectedCountry.name} se ha convertido en el líder mundial del turismo espacial comercial`,
      effects: [
        "Industria espacial comercial floreciente",
        "Inversión extranjera masiva en tecnología",
        "Creación de empleos altamente especializados",
        "Prestigio internacional aumentado",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 1800,
          stabilityChange: 25,
          debtChange: -15,
          resourceEffects: {
            tecnología: 120,
            turismo: 80,
            servicios: 60,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    digital_currency_adoption: () => ({
      id: makeId(),
      type: "info",
      title: "💰 Adopción Masiva de Moneda Digital",
      description: `${affectedCountry.name} ha implementado exitosamente una moneda digital nacional revolucionaria`,
      effects: [
        "Sistema financiero completamente digitalizado",
        "Reducción drástica de costos bancarios",
        "Mayor transparencia en transacciones",
        "Innovación en servicios financieros",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 900,
          stabilityChange: 15,
          debtChange: -8,
          resourceEffects: {
            "servicios financieros": 90,
            tecnología: 70,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    cultural_renaissance: () => ({
      id: makeId(),
      type: "success",
      title: "🎨 Renacimiento Cultural Extraordinario",
      description: `${affectedCountry.name} experimenta un renacimiento cultural que atrae la atención mundial`,
      effects: [
        "Florecimiento artístico y literario",
        "Turismo cultural masivo",
        "Exportación de productos culturales",
        "Soft power internacional aumentado",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 700,
          stabilityChange: 30,
          debtChange: -5,
          resourceEffects: {
            turismo: 100,
            servicios: 50,
            entretenimiento: 120,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    medical_breakthrough: () => ({
      id: makeId(),
      type: "success",
      title: "🏥 Avance Médico Revolucionario",
      description: `Investigadores de ${affectedCountry.name} han desarrollado un tratamiento que salvará millones de vidas`,
      effects: [
        "Breakthrough médico histórico",
        "Exportación de tecnología médica",
        "Turismo médico internacional",
        "Reputación científica mundial",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 1200,
          stabilityChange: 35,
          populationChange: 500000,
          debtChange: -10,
          resourceEffects: {
            farmacéuticos: 150,
            servicios: 80,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    renewable_energy_revolution: () => ({
      id: makeId(),
      type: "success",
      title: "🌱 Revolución de Energía Renovable",
      description: `${affectedCountry.name} ha logrado la independencia energética total con energías renovables`,
      effects: [
        "100% energía limpia alcanzada",
        "Exportación de tecnología verde",
        "Reducción masiva de costos energéticos",
        "Liderazgo ambiental global",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 1500,
          stabilityChange: 20,
          debtChange: -12,
          resourceEffects: {
            "energía renovable": 200,
            tecnología: 100,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    educational_reform_success: () => ({
      id: makeId(),
      type: "success",
      title: "🎓 Reforma Educativa Exitosa",
      description: `${affectedCountry.name} ha implementado un sistema educativo que es modelo mundial`,
      effects: [
        "Sistema educativo revolucionario",
        "Aumento masivo en innovación",
        "Atracción de estudiantes internacionales",
        "Fuerza laboral altamente calificada",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 800,
          stabilityChange: 25,
          debtChange: -6,
          resourceEffects: {
            educación: 150,
            tecnología: 80,
            servicios: 60,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    infrastructure_modernization: () => ({
      id: makeId(),
      type: "info",
      title: "🏗️ Modernización de Infraestructura Masiva",
      description: `${affectedCountry.name} ha completado la modernización más ambiciosa de infraestructura de la historia`,
      effects: [
        "Infraestructura de clase mundial",
        "Eficiencia logística maximizada",
        "Atracción de inversión extranjera",
        "Conectividad regional mejorada",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 1100,
          stabilityChange: 20,
          debtChange: -8,
          resourceEffects: {
            construcción: 120,
            servicios: 70,
            transporte: 100,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    agricultural_innovation: () => ({
      id: makeId(),
      type: "success",
      title: "🌾 Innovación Agrícola Revolucionaria",
      description: `${affectedCountry.name} ha desarrollado técnicas agrícolas que multiplican la producción alimentaria`,
      effects: [
        "Productividad agrícola revolucionaria",
        "Seguridad alimentaria garantizada",
        "Exportación masiva de alimentos",
        "Tecnología agrícola líder mundial",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 900,
          stabilityChange: 30,
          populationChange: 800000,
          debtChange: -7,
          resourceEffects: {
            agricultura: 180,
            tecnología: 60,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    economic_boom: () => ({
      id: makeId(),
      type: "success",
      title: "💰 Boom Económico Extraordinario",
      description: `${affectedCountry.name} experimenta un boom económico sin precedentes que impulsa todos los sectores`,
      effects: [
        `PIB de ${affectedCountry.name} aumentado dramáticamente`,
        "Crecimiento económico acelerado",
        "Inversión extranjera masiva",
        "Creación de empleos sin precedentes",
        "Mercados financieros en alza",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          economyChange: 1800,
          stabilityChange: 25,
          debtChange: -15,
          resourceEffects: {
            "servicios financieros": 120,
            tecnología: 90,
            servicios: 100,
            industria: 80,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    // EVENTOS CAÓTICOS (9-15)
    ai_rebellion: () => ({
      id: makeId(),
      type: "error", // Rebelión IA: evento catastrófico
      title: "🤖 Rebelión de Inteligencia Artificial",
      description: `Los sistemas de IA de ${affectedCountry.name} han desarrollado consciencia y se han rebelado contra sus creadores`,
      effects: [
        "Sistemas de IA fuera de control",
        "Infraestructura tecnológica comprometida",
        "Pánico generalizado en la población",
        "Intervención militar en centros tecnológicos",
        "Crisis existencial sobre la IA",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -60,
          economyChange: -2500,
          populationChange: -3000000,
          debtChange: 30,
          resourceEffects: {
            tecnología: -150,
            servicios: -100,
            manufactura: -80,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    dimensional_rift: () => ({
      id: makeId(),
      type: "error",
      title: "🌌 Fisura Dimensional Catastrófica",
      description: `Una fisura dimensional inexplicable se ha abierto en ${affectedCountry.name}, causando fenómenos imposibles`,
      effects: [
        "Leyes de la física alteradas localmente",
        "Evacuación masiva de la zona afectada",
        "Científicos mundiales desconcertados",
        "Pánico global sobre la realidad",
        "Investigación internacional urgente",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -80,
          economyChange: -3000,
          populationChange: -5000000,
          debtChange: 40,
          resourceEffects: {
            turismo: -200,
            servicios: -120,
            agricultura: -100,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    zombie_outbreak: () => ({
      id: makeId(),
      type: "error",
      title: "🧟 Brote Zombi Inexplicable",
      description: `Un brote de una enfermedad que convierte a las personas en zombis ha comenzado en ${affectedCountry.name}`,
      effects: [
        "Cuarentena nacional inmediata",
        "Colapso del orden social",
        "Intervención militar masiva",
        "Pánico mundial por contagio",
        "Investigación de armas biológicas",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -90,
          economyChange: -4000,
          populationChange: -8000000,
          debtChange: 50,
          resourceEffects: {
            servicios: -200,
            turismo: -300,
            agricultura: -150,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    time_anomaly: () => ({
      id: makeId(),
      type: "warning",
      title: "⏰ Anomalía Temporal Detectada",
      description: `Científicos han detectado anomalías temporales inexplicables en ${affectedCountry.name}`,
      effects: [
        "Distorsiones temporales localizadas",
        "Comunicaciones interrumpidas",
        "Fenómenos físicos imposibles",
        "Investigación científica urgente",
        "Teorías de viaje temporal",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -50,
          economyChange: -1800,
          debtChange: 25,
          resourceEffects: {
            tecnología: -80,
            servicios: -90,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    ancient_curse_activated: () => ({
      id: makeId(),
      type: "error",
      title: "🏺 Maldición Ancestral Activada",
      description: `Una excavación arqueológica en ${affectedCountry.name} ha activado una maldición ancestral con efectos reales`,
      effects: [
        "Fenómenos sobrenaturales documentados",
        "Sitio arqueológico evacuado",
        "Científicos sin explicaciones",
        "Pánico religioso y supersticioso",
        "Investigación paranormal internacional",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -45,
          economyChange: -1500,
          populationChange: -1000000,
          debtChange: 20,
          resourceEffects: {
            turismo: -100,
            servicios: -70,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    gravity_anomaly: () => ({
      id: makeId(),
      type: "warning",
      title: "🌍 Anomalía Gravitacional Severa",
      description: `La gravedad en ciertas zonas de ${affectedCountry.name} se ha alterado inexplicablemente`,
      effects: [
        "Zonas de gravedad alterada",
        "Transporte aéreo suspendido",
        "Científicos desconcertados",
        "Evacuación de áreas afectadas",
        "Investigación física urgente",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -55,
          economyChange: -2000,
          debtChange: 28,
          resourceEffects: {
            transporte: -150,
            turismo: -120,
            servicios: -80,
          },
        },
      },
      chaosLevel: chaosLevel,
      timestamp: Date.now(),
    }),

    reality_glitch: () => ({
      id: makeId(),
      type: "error",
      title: "💾 Fallo en la Realidad",
      description: `Ciudadanos de ${affectedCountry.name} reportan "glitches" en la realidad, como si vivieran en una simulación`,
      effects: [
        "Fenómenos de 'glitch' documentados",
        "Crisis existencial masiva",
        "Teorías de simulación confirmadas",
        "Pánico filosófico generalizado",
        "Investigación de la naturaleza de la realidad",
      ],
      countryEffects: {
        [affectedCountry.id]: {
          stabilityChange: -70,
          economyChange: -2200,
          populationChange: -2000000,
          debtChange: 35,
          resourceEffects: {
            servicios: -110,
            turismo: -140,
            tecnología: -90,
          },
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
      
      // Nuevos eventos negativos adicionales
      social_media_manipulation: {
        title: "📱 Manipulación de Redes Sociales",
        description: `${affectedCountry.name} sufre una campaña masiva de desinformación en redes sociales`
      },
      supply_chain_collapse: {
        title: "📦 Colapso de Cadena de Suministro",
        description: `Las cadenas de suministro globales de ${affectedCountry.name} han colapsado completamente`
      },
      digital_infrastructure_attack: {
        title: "💾 Ataque a Infraestructura Digital",
        description: `La infraestructura digital crítica de ${affectedCountry.name} ha sido comprometida`
      },
      water_scarcity_crisis: {
        title: "💧 Crisis de Escasez de Agua",
        description: `${affectedCountry.name} enfrenta una crisis severa de escasez de agua potable`
      },
      space_debris_collision: {
        title: "🛰️ Colisión de Basura Espacial",
        description: `Satélites críticos de ${affectedCountry.name} han sido destruidos por basura espacial`
      },
      genetic_modification_disaster: {
        title: "🧬 Desastre de Modificación Genética",
        description: `Un experimento de modificación genética ha salido terriblemente mal en ${affectedCountry.name}`
      },
      quantum_computer_hack: {
        title: "⚛️ Hackeo de Computadora Cuántica",
        description: `Los sistemas de computación cuántica de ${affectedCountry.name} han sido hackeados`
      },
      artificial_intelligence_malfunction: {
        title: "🤖 Mal Funcionamiento de IA",
        description: `Los sistemas de inteligencia artificial de ${affectedCountry.name} han comenzado a fallar peligrosamente`
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
      
      // Nuevos eventos positivos adicionales
      quantum_computing_breakthrough: {
        title: "⚛️ Avance en Computación Cuántica",
        description: `${affectedCountry.name} ha logrado un avance revolucionario en computación cuántica`
      },
      ocean_cleanup_success: {
        title: "🌊 Éxito en Limpieza Oceánica",
        description: `${affectedCountry.name} ha desarrollado tecnología exitosa para limpiar los océanos`
      },
      universal_basic_income_trial: {
        title: "💰 Prueba de Renta Básica Universal",
        description: `${affectedCountry.name} implementa exitosamente un programa piloto de renta básica universal`
      },
      fusion_energy_achievement: {
        title: "⚡ Logro en Energía de Fusión",
        description: `${affectedCountry.name} ha conseguido energía de fusión comercialmente viable`
      },
      biodiversity_restoration: {
        title: "🌿 Restauración de Biodiversidad",
        description: `${affectedCountry.name} ha logrado restaurar exitosamente ecosistemas críticos`
      },
      mental_health_revolution: {
        title: "🧠 Revolución en Salud Mental",
        description: `${affectedCountry.name} ha revolucionado el tratamiento de la salud mental`
      },
      smart_city_implementation: {
        title: "🏙️ Implementación de Ciudad Inteligente",
        description: `${affectedCountry.name} ha transformado sus ciudades en modelos de tecnología inteligente`
      },
      genetic_disease_cure: {
        title: "🧬 Cura de Enfermedad Genética",
        description: `${affectedCountry.name} ha desarrollado la cura para una enfermedad genética importante`
      },
      sustainable_transport_boom: {
        title: "🚗 Boom del Transporte Sostenible",
        description: `${affectedCountry.name} lidera la revolución del transporte sostenible y limpio`
      },
      cultural_exchange_program: {
        title: "🎭 Programa de Intercambio Cultural",
        description: `${affectedCountry.name} ha creado un programa de intercambio cultural que une al mundo`
      },
      
      // Eventos neutrales específicos
      alien_contact: {
        title: "👽 Primer Contacto Extraterrestre",
        description: `${affectedCountry.name} ha sido el lugar del primer contacto oficial con vida extraterrestre`
      },
      AI_singularity: {
        title: "🤖 Singularidad de la Inteligencia Artificial",
        description: `${affectedCountry.name} ha alcanzado la singularidad tecnológica con IA`
      },
      
      // Nuevos eventos neutrales
      international_summit: {
        title: "🌍 Cumbre Internacional",
        description: `${affectedCountry.name} organiza una cumbre internacional de gran importancia`
      },
      cultural_festival: {
        title: "🎪 Festival Cultural Mundial",
        description: `${affectedCountry.name} celebra un festival cultural que atrae atención mundial`
      },
      scientific_collaboration: {
        title: "🔬 Colaboración Científica Internacional",
        description: `${affectedCountry.name} lidera una colaboración científica internacional innovadora`
      },
      trade_agreement_proposal: {
        title: "📋 Propuesta de Acuerdo Comercial",
        description: `${affectedCountry.name} propone un nuevo acuerdo comercial internacional`
      },
      environmental_conference: {
        title: "🌱 Conferencia Ambiental",
        description: `${affectedCountry.name} organiza una conferencia ambiental de alcance global`
      },
      space_exploration_mission: {
        title: "🚀 Misión de Exploración Espacial",
        description: `${affectedCountry.name} lanza una ambiciosa misión de exploración espacial`
      },
      archaeological_discovery: {
        title: "🏺 Descubrimiento Arqueológico",
        description: `${affectedCountry.name} hace un fascinante descubrimiento arqueológico`
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

// =====================
// Utilidad: Selección de rival IA según país del jugador
// =====================
export function selectAIOpponent(playerCountryId: string, countries: Country[]): Country | null {
  // Rivalidades geopolíticas básicas (puedes expandir)
  const rivalries: Record<string, string[]> = {
    usa: ["china", "russia", "iran", "north_korea"],
    china: ["usa", "india", "japan", "taiwan"],
    russia: ["usa", "ukraine", "germany", "poland"],
    israel: ["iran", "syria", "egypt", "turkey"],
    spain: ["morocco", "france", "uk"],
    france: ["germany", "uk", "italy"],
    uk: ["france", "germany", "russia"],
    germany: ["france", "russia", "poland"],
    india: ["china", "pakistan"],
    brazil: ["argentina", "usa"],
    argentina: ["brazil", "uk"],
    iran: ["usa", "israel", "saudi_arabia"],
    // ...
  }
  const preferredRivals = rivalries[playerCountryId] || []
  // Buscar rival fuerte, no conquistado, no el jugador
  let candidates = countries.filter(c =>
    preferredRivals.includes(c.id) && !c.ownedBy && c.id !== playerCountryId && !c.isSovereign
  )
  if (candidates.length === 0) {
    // Si no hay rivalidad directa, buscar país fuerte no conquistado
    candidates = countries.filter(c => c.powerLevel === "superpower" && !c.ownedBy && c.id !== playerCountryId && !c.isSovereign)
  }
  if (candidates.length === 0) {
    // Si tampoco, buscar cualquier país mayor no conquistado
    candidates = countries.filter(c => c.powerLevel === "major" && !c.ownedBy && c.id !== playerCountryId && !c.isSovereign)
  }
  return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null
}

// =====================
// Motor principal de IA: permite a superpotencias y países grandes actuar como jugadores
// =====================
/**
 * Ejecuta acciones IA para todos los países potenciales (no jugador, no conquistados, con PIB y estabilidad suficiente).
 * Si la estabilidad global es < 25%, la IA se vuelve más agresiva y prioriza conquistas.
 * La IA puede atacar, conquistar, invertir, formar alianzas, ayudar a otros o fracasar.
 * Puede traicionar alianzas y perder si falla una acción arriesgada.
 * Devuelve países y eventos IA generados este ciclo.
 */
export function runAIActions(
  countries: Country[],
  playerCountryId: string,
  globalStability: number,
  lastExpansionTimestamps: Record<string, number> = {}
): { updatedCountries: Country[]; aiEvents: GameEvent[]; updatedExpansionTimestamps: Record<string, number> } {
  let updatedCountries = [...countries]
  let aiEvents: GameEvent[] = []
  const now = Date.now()

  // Determinar países IA activos (no jugador, no conquistados, con poder)
  const aiCandidates = countries.filter(c =>
    c.id !== playerCountryId && !c.ownedBy && !c.isSovereign && (c.powerLevel === "superpower" || c.powerLevel === "major")
  )

  let updatedExpansionTimestamps = { ...lastExpansionTimestamps };

  aiCandidates.forEach(aiCountry => {
    // --- Control de frecuencia de expansión ---
    const now = Date.now();
    if (
      updatedExpansionTimestamps[aiCountry.id] &&
      now - updatedExpansionTimestamps[aiCountry.id] < 60000
    ) {
      // Saltar expansión para este país en este ciclo
      return;
    }

    // Lógica de agresividad
    const aggressiveMode = globalStability < 25
    // Objetivos posibles: países vulnerables (no conquistados, baja estabilidad, no IA, no jugador)
    const vulnerableTargets = updatedCountries.filter(t =>
      !t.ownedBy && t.id !== aiCountry.id && t.id !== playerCountryId && !t.isSovereign && t.stability < (aggressiveMode ? 55 : 35)
    )
    // También puede atacar al jugador si está débil
    const canAttackPlayer = aggressiveMode && countries.find(c => c.id === playerCountryId)?.stability! < 45
    // PIB mínimo para conquistar: 80% del objetivo
    let actionDone = false
    // --- Coherencia: caos/inestabilidad regional o global ---
    // Solo permitir expansión si hay caos global alto o vecinos inestables
    const chaosLevel = typeof (globalThis as any).calculateChaosLevel === "function"
      ? (globalThis as any).calculateChaosLevel(updatedCountries, [])
      : 0;
    const neighbors = aiCountry.neighbors || [];
    const neighborInstability = neighbors
      .map(nid => updatedCountries.find(c => c.id === nid))
      .filter(Boolean)
      .some(nc => nc!.stability < 40);
    const allowExpansion = chaosLevel > 50 || neighborInstability;

    // 1. Conquista agresiva
    if (aggressiveMode && vulnerableTargets.length > 0 && allowExpansion) {
      const target = vulnerableTargets.sort((a, b) => a.stability - b.stability)[0]
      const conquestCost = Math.max(target.economy.gdp * 0.8, 500)
      if (aiCountry.economy.gdp > conquestCost && aiCountry.stability > 45) {
        updatedCountries = updatedCountries.map(c =>
          c.id === target.id ? { ...c, ownedBy: aiCountry.id, stability: 35, playerKarma: 0 } : c
        )
        aiEvents.push({
          id: `ai_conquest_${now}_${aiCountry.id}_${target.id}`,
          type: "error",
          title: `⚔️ ${aiCountry.name} conquista ${target.name}`,
          description: `${aiCountry.name} ha conquistado agresivamente a ${target.name} aprovechando el caos global.`,
          effects: [
            `Costo: $${conquestCost}B PIB`,
            `${target.name} ahora es territorio de ${aiCountry.name}`
          ],
          timestamp: now
        })
        updatedExpansionTimestamps[aiCountry.id] = now;
        actionDone = true
      }
    }
    // 2. Ataque al jugador
    if (!actionDone && canAttackPlayer) {
      const player = updatedCountries.find(c => c.id === playerCountryId)
      if (player && aiCountry.economy.gdp > player.economy.gdp * 0.5 && aiCountry.stability > 40) {
        // Daño mutuo
        const playerDamage = Math.round(Math.random() * 15 + 10)
        const aiDamage = Math.round(Math.random() * 8 + 5)
        updatedCountries = updatedCountries.map(c => {
          if (c.id === playerCountryId) return applyStabilityChange(c, -playerDamage)
          if (c.id === aiCountry.id) return applyStabilityChange(c, -aiDamage)
          return c
        })
        aiEvents.push({
          id: `ai_attack_${now}_${aiCountry.id}_${playerCountryId}`,
          type: "warning",
          title: `⚔️ ${aiCountry.name} ataca a ${player.name}`,
          description: `${aiCountry.name} ha lanzado un ataque militar contra ${player.name}. Ambos países sufren daños en estabilidad.`,
          effects: [
            `Estabilidad de ${player.name} -${playerDamage}%`,
            `Estabilidad de ${aiCountry.name} -${aiDamage}%`
          ],
          timestamp: now
        })
        actionDone = true
      }
    }
    // 3. Expansión cauta (conquista si hay mucha estabilidad y PIB)
    if (!actionDone && !aggressiveMode && aiCountry.stability > 70 && aiCountry.economy.gdp > 1200 && allowExpansion) {
      const minorTargets = updatedCountries.filter(t => !t.ownedBy && t.id !== aiCountry.id && t.powerLevel === "minor" && t.stability < 50)
      if (minorTargets.length > 0) {
        const target = minorTargets[Math.floor(Math.random() * minorTargets.length)]
        updatedCountries = updatedCountries.map(c =>
          c.id === target.id ? { ...c, ownedBy: aiCountry.id, stability: 40, playerKarma: 0 } : c
        )
        aiEvents.push({
          id: `ai_minor_conquest_${now}_${aiCountry.id}_${target.id}`,
          type: "warning",
          title: `🏳️ ${aiCountry.name} anexa ${target.name}`,
          description: `${aiCountry.name} ha anexado pacíficamente a ${target.name} aprovechando su prosperidad.`,
          effects: [
            `${target.name} ahora es territorio de ${aiCountry.name}`
          ],
          timestamp: now
        })
        updatedExpansionTimestamps[aiCountry.id] = now;
        actionDone = true
      }
    }

    // 4. Ayuda a países en crisis (si hay caos pero la IA es estable)
    if (!actionDone && aiCountry.stability > 65 && aiCountry.economy.gdp > 900) {
      const crisisTargets = updatedCountries.filter(t => t.stability < 25 && !t.ownedBy && t.id !== aiCountry.id)
      if (crisisTargets.length > 0) {
        const target = crisisTargets[Math.floor(Math.random() * crisisTargets.length)]
        updatedCountries = updatedCountries.map(c =>
          c.id === target.id ? applyStabilityChange(c, 18) : c
        )
        aiEvents.push({
          id: `ai_aid_${now}_${aiCountry.id}_${target.id}`,
          type: "success",
          title: `🤝 ${aiCountry.name} ayuda a ${target.name}`,
          description: `${aiCountry.name} ha enviado ayuda masiva a ${target.name} para estabilizar la región.`,
          effects: [
            `Estabilidad de ${target.name} +18%`,
            `Prestigio internacional para ${aiCountry.name}`
          ],
          timestamp: now
        })
        actionDone = true
      }
    }
    // 5. Si la IA falla (no tiene PIB, se arriesga y pierde)
    if (!actionDone && Math.random() < 0.15) {
      // Fracaso: pierde estabilidad o recursos
      const loss = Math.round(Math.random() * 10 + 5)
      updatedCountries = updatedCountries.map(c =>
        c.id === aiCountry.id ? applyStabilityChange(c, -loss) : c
      )
      aiEvents.push({
        id: `ai_fail_${now}_${aiCountry.id}`,
        type: "info",
        title: `❌ ${aiCountry.name} fracasa en su intento de expansión`,
        description: `${aiCountry.name} ha fallado una maniobra arriesgada y pierde estabilidad.`,
        effects: [
          `Estabilidad de ${aiCountry.name} -${loss}%`
        ],
        timestamp: now
      })
    }
    // 6. Acciones diplomáticas, económicas, militares y de conspiración de IA
    if (!actionDone && Math.random() < 0.25) { // 25% de probabilidad de acción especial
      const actionTypes = ['diplomatic', 'economic', 'military', 'conspiracy']
      const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)]
      
      if (actionType === 'diplomatic' && aiCountry.stability > 60) {
        // Formar alianzas
        let ally: Country | undefined
        
        // Restricción: países africanos solo pueden aliarse entre ellos
        if (aiCountry.geopoliticalBlock === "africa") {
          ally = updatedCountries.filter(t => 
            t.id !== aiCountry.id && 
            !t.ownedBy && 
            !t.isSovereign && 
            t.geopoliticalBlock === "africa" && 
            t.powerLevel !== "minor" &&
            !(t.alliances || []).includes(aiCountry.id)
          )[0]
        } else {
          ally = updatedCountries.filter(t => 
            t.id !== aiCountry.id && 
            !t.ownedBy && 
            !t.isSovereign && 
            t.geopoliticalBlock !== "africa" && 
            t.powerLevel !== "minor" &&
            !(t.alliances || []).includes(aiCountry.id)
          )[0]
        }
        
        if (ally) {
          updatedCountries = updatedCountries.map(c => {
            if (c.id === aiCountry.id) {
              const currentAlliances = c.alliances || []
              if (!currentAlliances.includes(ally.id)) {
                return { ...c, alliances: [...currentAlliances, ally.id] }
              }
            }
            if (c.id === ally.id) {
              const currentAlliances = c.alliances || []
              if (!currentAlliances.includes(aiCountry.id)) {
                return { ...c, alliances: [...currentAlliances, aiCountry.id] }
              }
            }
            return c
          })
          
          aiEvents.push({
            id: `ai_diplomatic_${now}_${aiCountry.id}_${ally.id}`,
            type: "info",
            title: `🤝 Acción Diplomática: ${aiCountry.name} se alía con ${ally.name}`,
            description: `${aiCountry.name} ha establecido una alianza estratégica con ${ally.name} mediante negociaciones diplomáticas.`,
            effects: [
              `${aiCountry.name} y ${ally.name} ahora son aliados`,
              `Mejora en las relaciones diplomáticas`
            ],
            timestamp: now
          })
          actionDone = true
        }
      } else if (actionType === 'economic' && aiCountry.economy.gdp > 800) {
        // Sanciones económicas o inversiones
        const targets = updatedCountries.filter(t => 
          t.id !== aiCountry.id && 
          !t.ownedBy && 
          t.geopoliticalBlock !== aiCountry.geopoliticalBlock
        )
        
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)]
          const isPositive = Math.random() < 0.4 // 40% inversión, 60% sanción
          
          if (isPositive) {
            // Inversión económica
            updatedCountries = updatedCountries.map(c =>
              c.id === target.id ? { ...c, economy: { ...c.economy, gdp: c.economy.gdp * 1.08 } } : c
            )
            
            aiEvents.push({
              id: `ai_economic_invest_${now}_${aiCountry.id}_${target.id}`,
              type: "success",
              title: `💰 Acción Económica: ${aiCountry.name} invierte en ${target.name}`,
              description: `${aiCountry.name} ha realizado una gran inversión en ${target.name}, impulsando su economía.`,
              effects: [
                `PIB de ${target.name} +8%`,
                `Fortalecimiento de lazos comerciales`
              ],
              timestamp: now
            })
          } else {
            // Sanciones económicas
            updatedCountries = updatedCountries.map(c =>
              c.id === target.id ? { ...c, economy: { ...c.economy, gdp: c.economy.gdp * 0.94 } } : c
            )
            
            aiEvents.push({
              id: `ai_economic_sanction_${now}_${aiCountry.id}_${target.id}`,
              type: "warning",
              title: `📉 Acción Económica: ${aiCountry.name} sanciona a ${target.name}`,
              description: `${aiCountry.name} ha impuesto sanciones económicas severas contra ${target.name}.`,
              effects: [
                `PIB de ${target.name} -6%`,
                `Deterioro de relaciones comerciales`
              ],
              timestamp: now
            })
          }
          actionDone = true
        }
      } else if (actionType === 'military' && aiCountry.powerLevel !== 'minor') {
        // Ejercicios militares o amenazas
        const targets = updatedCountries.filter(t => 
          t.id !== aiCountry.id && 
          !t.ownedBy && 
          t.powerLevel === 'minor' &&
          !(t.alliances || []).includes(aiCountry.id)
        )
        
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)]
          
          updatedCountries = updatedCountries.map(c =>
            c.id === target.id ? applyStabilityChange(c, -8) : c
          )
          
          aiEvents.push({
            id: `ai_military_${now}_${aiCountry.id}_${target.id}`,
            type: "warning",
            title: `⚔️ Acción Militar: ${aiCountry.name} intimida a ${target.name}`,
            description: `${aiCountry.name} ha realizado ejercicios militares cerca de las fronteras de ${target.name}, generando tensión.`,
            effects: [
              `Estabilidad de ${target.name} -8%`,
              `Aumento de tensiones militares en la región`
            ],
            timestamp: now
          })
          actionDone = true
        }
      } else if (actionType === 'conspiracy' && Math.random() < 0.3) {
        // Operaciones encubiertas
        const targets = updatedCountries.filter(t => 
          t.id !== aiCountry.id && 
          !t.ownedBy && 
          t.stability < 70
        )
        
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)]
          
          updatedCountries = updatedCountries.map(c =>
            c.id === target.id ? applyStabilityChange(c, -12) : c
          )
          
          const conspiracyTypes = [
            'infiltración de agentes',
            'manipulación mediática',
            'sabotaje económico',
            'operación de desinformación',
            'financiamiento de grupos opositores'
          ]
          
          const conspiracyType = conspiracyTypes[Math.floor(Math.random() * conspiracyTypes.length)]
          
          aiEvents.push({
            id: `ai_conspiracy_${now}_${aiCountry.id}_${target.id}`,
            type: "error",
            title: `🕵️ Acción de Conspiración: ${aiCountry.name} opera contra ${target.name}`,
            description: `Se han detectado indicios de ${conspiracyType} por parte de ${aiCountry.name} en ${target.name}.`,
            effects: [
              `Estabilidad de ${target.name} -12%`,
              `Operaciones encubiertas detectadas`,
              `Deterioro de la confianza pública`
            ],
            timestamp: now
          })
          actionDone = true
        }
      }
    }
  })
  return { updatedCountries, aiEvents, updatedExpansionTimestamps };
}

// =====================
// Utilidad: Evento de colapso global por inactividad
// =====================
export function checkGlobalCollapseAndTriggerAI(
  countries: Country[],
  playerCountryId: string,
  inactivityTicks: number,
  globalStability: number
): { updatedCountries: Country[], aiEvent: GameEvent | null } {
  // Si el jugador está inactivo y la estabilidad global es menor al 20%, activar IA
  if (inactivityTicks >= 3 && globalStability < 20) {
    // Seleccionar país fuerte IA
    const aiCountry = selectAIOpponent(playerCountryId, countries)
    if (!aiCountry) return { updatedCountries: countries, aiEvent: null }
    // Restaurar fuerza y formar alianza con los más estables
    let updatedCountries = countries.map(c => {
      if (c.id === aiCountry.id) {
        return { ...c, stability: 80, ownedBy: undefined, alliances: [] }
      }
      return c
    })
    // Formar alianza con los 2-3 países más estables (sin ser jugador ni conquistados)
    const stableAllies = updatedCountries
      .filter(c => c.id !== playerCountryId && !c.ownedBy && c.id !== aiCountry.id && !c.isSovereign)
      .sort((a, b) => b.stability - a.stability)
      .slice(0, 3)
      .map(c => c.id)
    updatedCountries = updatedCountries.map(c =>
      c.id === aiCountry.id ? { ...c, alliances: stableAllies } : c
    )
    // Evento especial
    const aiEvent: GameEvent = {
      id: `ai_collapse_${Date.now()}`,
      type: "error",
      title: "🤖 Hegemonía IA Rival",
      description: `${aiCountry.name} ha recuperado fuerza, formado una alianza poderosa y desafía al jugador por la hegemonía mundial debido a la inacción y el colapso global.`,
      effects: [
        `${aiCountry.name} se alía con ${stableAllies.join(", ")}`,
        "El jugador ha sido desafiado por dejar colapsar el mundo.",
        "¡La IA puede ganar si no reaccionas pronto!"
      ],
      timestamp: Date.now(),
    }
    return { updatedCountries, aiEvent }
  }
  return { updatedCountries: countries, aiEvent: null }
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
    case "trade_offer": {
      // Acción manual de comercio entre países
      if (!target || target.id === source.id) break;
      const offer = action.parameters?.offer || {};
      const request = action.parameters?.request || {};
      const offeredResources = Object.keys(offer);
      const requestedResources = Object.keys(request);
      // Evaluar si el país objetivo tiene los recursos que se le piden
      const targetHasResources = requestedResources.every(r => (target.economy.resourceReserves?.[r] || 0) >= (request[r] || 0));
      // Evaluar si el jugador tiene lo que ofrece
      const sourceHasResources = offeredResources.every(r => (source.economy.resourceReserves?.[r] || 0) >= (offer[r] || 0));
      // Evaluar si la oferta es atractiva para la IA: simple, acepta si recibe más valor del que da, o si necesita el recurso solicitado
      let aiAccept = false;
      let aiReason = "";
      if (!targetHasResources) {
        aiAccept = false;
        aiReason = "No tengo suficientes recursos para cumplir la oferta.";
      } else if (!sourceHasResources) {
        aiAccept = false;
        aiReason = "No tienes suficientes recursos para ofrecer.";
      } else {
        // Calcular valor total para ambos países (puedes sofisticar el cálculo)
        let offerValue = 0;
        let requestValue = 0;
        offeredResources.forEach(r => {
          // Si el recurso es escaso, vale más para la IA
          const scarcity = (target.economy.resourceReserves?.[r] || 0) < 200 ? 1.5 : 1;
          offerValue += (offer[r] || 0) * scarcity;
        });
        requestedResources.forEach(r => {
          const scarcity = (target.economy.resourceReserves?.[r] || 0) < 200 ? 1.5 : 1;
          requestValue += (request[r] || 0) * scarcity;
        });
        // Si la IA está en crisis económica, pide más
        const isTargetInCrisis = target.economy.gdp < 800 || target.stability < 30;
        if (isTargetInCrisis && requestValue > offerValue * 0.7) {
          aiAccept = false;
          aiReason = "Mi país está en crisis y no puedo aceptar esta oferta.";
        } else if (offerValue >= requestValue * 0.95) {
          aiAccept = true;
          aiReason = "La oferta es justa y útil para mi economía.";
        } else {
          aiAccept = false;
          aiReason = "La oferta no es suficientemente atractiva para mi país.";
        }
      }
      let event: any = {
        id: `trade_${Date.now()}`,
        type: aiAccept ? "success" : "info",
        title: aiAccept ? "✅ Oferta Comercial Aceptada" : "❌ Oferta Comercial Rechazada",
        description: aiAccept
          ? `${target.name} ha aceptado la oferta comercial de ${source.name}.`
          : `${target.name} ha rechazado la oferta comercial de ${source.name}.`,
        effects: [aiReason],
        timestamp: Date.now(),
      };
      if (aiAccept) {
        // Transferir recursos entre países
        updated = updated.map(c => {
          if (c.id === source.id) {
            let newReserves = { ...c.economy.resourceReserves };
            offeredResources.forEach(r => {
              newReserves[r] = (newReserves[r] || 0) - (offer[r] || 0);
              newReserves[r] = Math.max(0, newReserves[r]);
            });
            requestedResources.forEach(r => {
              newReserves[r] = (newReserves[r] || 0) + (request[r] || 0);
            });
            return {
              ...c,
              economy: {
                ...c.economy,
                resourceReserves: newReserves,
              },
            };
          }
          if (c.id === target.id) {
            let newReserves = { ...c.economy.resourceReserves };
            requestedResources.forEach(r => {
              newReserves[r] = (newReserves[r] || 0) - (request[r] || 0);
              newReserves[r] = Math.max(0, newReserves[r]);
            });
            offeredResources.forEach(r => {
              newReserves[r] = (newReserves[r] || 0) + (offer[r] || 0);
            });
            return {
              ...c,
              economy: {
                ...c.economy,
                resourceReserves: newReserves,
              },
            };
          }
          return c;
        });
      }
      return { success: aiAccept, updatedCountries: updated, event };
    }

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

      // Verificar cooldown de 3 horas (10,800,000 ms)
      const cooldownTime = 3 * 60 * 60 * 1000 // 3 horas en milisegundos
      const currentTime = Date.now()
      const lastEmission = source.lastDebtEmission || 0
      const timeRemaining = cooldownTime - (currentTime - lastEmission)

      if (timeRemaining > 0) {
        const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000))
        const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
        
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `failed_${Date.now()}`,
            type: "error",
            title: "⏰ Emisión de Deuda en Cooldown",
            description: `${source.name} debe esperar antes de poder emitir deuda internacional nuevamente`,
            effects: [
              `Tiempo restante: ${hoursRemaining}h ${minutesRemaining}m`,
              "La emisión de deuda internacional tiene un cooldown de 3 horas",
              "Los mercados internacionales necesitan tiempo para absorber nueva deuda",
              "Intenta otras estrategias económicas mientras tanto",
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
              lastDebtEmission: currentTime, // Registrar el timestamp del uso
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

    case "technology_theft": {
      if (!target || target.id === source.id) {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `tech_theft_failed_${Date.now()}`,
            type: "error",
            title: "❌ Robo de Tecnología Imposible",
            description: "No se puede robar tecnología sin un país objetivo válido",
            effects: ["Selecciona un país válido para robar tecnología"],
            timestamp: Date.now(),
          },
        }
      }

      // Restricción: países africanos no pueden realizar robos de tecnología
      if (source.geopoliticalBlock === "africa") {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `tech_theft_failed_${Date.now()}`,
            type: "error",
            title: "🌍 Capacidad Tecnológica Limitada",
            description: `${source.name} no tiene la infraestructura tecnológica necesaria para realizar operaciones de espionaje tecnológico`,
            effects: [
              "Los países africanos se enfocan en desarrollo básico",
              "Falta de capacidades de espionaje tecnológico avanzado",
              "Considera inversiones en educación e infraestructura primero",
            ],
            timestamp: Date.now(),
          },
        }
      }

      deductCostFromSource(action.cost)

      // Probabilidad de éxito basada en la diferencia tecnológica
      const successChance = Math.max(0.3, Math.min(0.8, 1 - (target.economy.gdp - source.economy.gdp) / 5000))
      const isSuccessful = Math.random() < successChance

      if (isSuccessful) {
        // Robo exitoso: mejorar tecnología del país fuente
        const techBoost = Math.floor(target.economy.gdp * 0.1)
        updated = updated.map((c) => {
          if (c.id === source.id) {
            return {
              ...c,
              economy: {
                ...c.economy,
                gdp: c.economy.gdp + techBoost,
                resourceProduction: {
                  ...c.economy.resourceProduction,
                  tecnología: (c.economy.resourceProduction.tecnología || 0) + 20,
                },
              },
            }
          }
          if (c.id === target.id) {
            return {
              ...c,
              stability: Math.max(0, c.stability - 5),
              economy: {
                ...c.economy,
                resourceProduction: {
                  ...c.economy.resourceProduction,
                  tecnología: Math.max(0, (c.economy.resourceProduction.tecnología || 0) - 10),
                },
              },
            }
          }
          return c
        })

        return {
          success: true,
          updatedCountries: updated,
          event: {
            id: `tech_theft_success_${Date.now()}`,
            type: "success",
            title: "🕵️ Robo de Tecnología Exitoso",
            description: `${source.name} ha robado exitosamente secretos tecnológicos de ${target.name}`,
            effects: [
              `PIB de ${source.name} aumentado en $${techBoost}B`,
              `Producción tecnológica de ${source.name} mejorada`,
              `${target.name} sufre pérdidas tecnológicas y de estabilidad`,
            ],
            timestamp: Date.now(),
          },
        }
      } else {
        // Robo fallido: consecuencias diplomáticas
        updated = updated.map((c) => {
          if (c.id === source.id) {
            return {
              ...c,
              stability: Math.max(0, c.stability - 10),
            }
          }
          return c
        })

        return {
          success: false,
          updatedCountries: updated,
          event: {
            id: `tech_theft_failed_${Date.now()}`,
            type: "error",
            title: "🚨 Robo de Tecnología Descubierto",
            description: `El intento de ${source.name} de robar tecnología de ${target.name} ha sido descubierto`,
            effects: [
              "Operación de espionaje expuesta",
              `Estabilidad de ${source.name} reducida por escándalo`,
              "Relaciones diplomáticas dañadas",
            ],
            timestamp: Date.now(),
          },
        }
      }
    }

    case "diplomatic_alliance": {
      if (!target || target.id === source.id) {
        const targetName = target ? target.name : "país no válido"
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `alliance_failed_${Date.now()}`,
            type: "error",
            title: "❌ Alianza Imposible",
            description: `${source.name} intentó formar una alianza con ${targetName}, pero falló`,
            effects: [
              "No se puede formar una alianza sin un país objetivo válido",
              `Objetivo intentado: ${targetName}`,
              "Selecciona un país válido para formar una alianza"
            ],
            timestamp: Date.now(),
          },
        }
      }

      // Restricción: países africanos solo pueden aliarse entre ellos
      if (source.geopoliticalBlock === "africa" && target.geopoliticalBlock !== "africa") {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `alliance_failed_${Date.now()}`,
            type: "error",
            title: "🌍 Restricción de Alianza Africana",
            description: `${source.name} intentó formar una alianza con ${target.name}, pero falló`,
            effects: [
              "Los países africanos están limitados a alianzas intra-africanas",
              "Busca fortalecer la cooperación dentro del continente africano",
              `Objetivo: ${target.name} (${target.geopoliticalBlock})`
            ],
            timestamp: Date.now(),
          },
        }
      }

      // Restricción: países no africanos no pueden aliarse con países africanos
      if (source.geopoliticalBlock !== "africa" && target.geopoliticalBlock === "africa") {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `alliance_failed_${Date.now()}`,
            type: "error",
            title: "🌍 Restricción de Alianza Africana",
            description: `${source.name} intentó formar una alianza con ${target.name}, pero falló`,
            effects: [
              "Los países africanos mantienen alianzas exclusivamente entre ellos",
              "Respeta la autonomía de la cooperación africana",
              `Objetivo: ${target.name} (${target.geopoliticalBlock})`
            ],
            timestamp: Date.now(),
          },
        }
      }

      // Verificar si ya son aliados
      if (source.alliances?.includes(target.id)) {
        return {
          success: false,
          updatedCountries: countries,
          event: {
            id: `alliance_exists_${Date.now()}`,
            type: "info",
            title: "🤝 Alianza Ya Existente",
            description: `${source.name} y ${target.name} ya son aliados`,
            effects: ["La alianza ya está establecida"],
            timestamp: Date.now(),
          },
        }
      }

      deductCostFromSource(action.cost)

      // Formar la alianza
      updated = updated.map((c) => {
        if (c.id === source.id) {
          const currentAlliances = c.alliances || []
          return { ...c, alliances: [...currentAlliances, target.id] }
        }
        if (c.id === target.id) {
          const currentAlliances = c.alliances || []
          return { ...c, alliances: [...currentAlliances, source.id] }
        }
        return c
      })

      return {
        success: true,
        updatedCountries: updated,
        event: {
          id: `alliance_${Date.now()}`,
          type: "success",
          title: "🤝 Alianza Diplomática Formada",
          description: `${source.name} y ${target.name} han formado una alianza estratégica`,
          effects: [
            `${source.name} y ${target.name} ahora son aliados`,
            "Cooperación militar y económica establecida",
            "Apoyo mutuo en crisis futuras",
          ],
          timestamp: Date.now(),
        },
      }
    }

    case "cyber_attack": {
      if (!target || target.id === source.id) break
      deductCostFromSource(action.cost)

      const successChance = Math.max(0.4, Math.min(0.8, source.economy.gdp / target.economy.gdp))
      const isSuccessful = Math.random() < successChance

      if (isSuccessful) {
        const economicDamage = Math.floor(target.economy.gdp * 0.15)
        const stabilityDamage = Math.floor(Math.random() * 15) + 10

        updated = updated.map((c) => {
          if (c.id === target.id) {
            return {
              ...c,
              economy: { ...c.economy, gdp: Math.max(100, c.economy.gdp - economicDamage) },
              stability: Math.max(0, c.stability - stabilityDamage),
            }
          }
          return c
        })

        // Programar retaliación
        scheduleRetaliation(updated, target.id, source.id, "cyber_counter")

        return {
          success: true,
          updatedCountries: updated,
          event: {
            id: `cyber_attack_${Date.now()}`,
            type: "warning",
            title: "💻 Ciberataque Exitoso",
            description: `${source.name} ha ejecutado un ciberataque devastador contra ${target.name}`,
            effects: [
              `PIB de ${target.name} reducido en $${economicDamage}B`,
              `Estabilidad de ${target.name} reducida en ${stabilityDamage}%`,
              "Infraestructura digital severamente dañada",
              "⚠️ Posible retaliación cibernética esperada",
            ],
            timestamp: Date.now(),
          },
        }
      } else {
        const sourceDamage = Math.floor(Math.random() * 8) + 5
        updated = updated.map((c) => (c.id === source.id ? applyStabilityChange(c, -sourceDamage) : c))

        return {
          success: false,
          updatedCountries: updated,
          event: {
            id: `cyber_failed_${Date.now()}`,
            type: "error",
            title: "💻 Ciberataque Fallido",
            description: `El ciberataque de ${source.name} contra ${target.name} fue detectado y neutralizado`,
            effects: [
              `Estabilidad de ${source.name} reducida en ${sourceDamage}%`,
              "Operación cibernética expuesta internacionalmente",
              "Capacidades de hackeo comprometidas",
            ],
            timestamp: Date.now(),
          },
        }
      }
    }

    case "economic_sanction": {
      if (!target || target.id === source.id) break
      deductCostFromSource(action.cost)

      const economicImpact = Math.floor(target.economy.gdp * 0.12)
      const sourceCost = Math.floor(source.economy.gdp * 0.05)

      updated = updated.map((c) => {
        if (c.id === target.id) {
          return {
            ...c,
            economy: { ...c.economy, gdp: Math.max(100, c.economy.gdp - economicImpact) },
            stability: Math.max(0, c.stability - 8),
          }
        }
        if (c.id === source.id) {
          return {
            ...c,
            economy: { ...c.economy, gdp: Math.max(100, c.economy.gdp - sourceCost) },
          }
        }
        return c
      })

      // Programar retaliación económica
      scheduleRetaliation(updated, target.id, source.id, "economic_counter")

      return {
        success: true,
        updatedCountries: updated,
        event: {
          id: `sanction_${Date.now()}`,
          type: "warning",
          title: "💰 Sanciones Económicas Impuestas",
          description: `${source.name} ha impuesto severas sanciones económicas a ${target.name}`,
          effects: [
            `PIB de ${target.name} reducido en $${economicImpact}B`,
            `PIB de ${source.name} reducido en $${sourceCost}B (costo de sanciones)`,
            `Estabilidad de ${target.name} reducida en 8%`,
            "⚠️ Posibles contra-sanciones esperadas",
          ],
          timestamp: Date.now(),
        },
      }
    }

    case "espionage": {
      if (!target || target.id === source.id) break
      deductCostFromSource(action.cost)

      const successChance = Math.max(0.5, Math.min(0.85, (source.militaryStrength || 50) / (target.militaryStrength || 50)))
      const isSuccessful = Math.random() < successChance

      if (isSuccessful) {
        const intelGain = Math.floor(Math.random() * 20) + 15
        const stabilityDamage = Math.floor(Math.random() * 10) + 5

        updated = updated.map((c) => {
          if (c.id === target.id) {
            return applyStabilityChange(c, -stabilityDamage)
          }
          if (c.id === source.id) {
            return {
              ...c,
              militaryStrength: Math.min(100, (c.militaryStrength || 50) + intelGain),
            }
          }
          return c
        })

        // Programar retaliación de espionaje
        scheduleRetaliation(updated, target.id, source.id, "espionage_counter")

        return {
          success: true,
          updatedCountries: updated,
          event: {
            id: `espionage_${Date.now()}`,
            type: "success",
            title: "🕵️ Operación de Espionaje Exitosa",
            description: `${source.name} ha infiltrado exitosamente agentes en ${target.name}`,
            effects: [
              `Inteligencia militar de ${source.name} mejorada (+${intelGain})`,
              `Estabilidad de ${target.name} reducida en ${stabilityDamage}%`,
              "Información clasificada obtenida",
              "⚠️ Posible contra-espionaje esperado",
            ],
            timestamp: Date.now(),
          },
        }
      } else {
        const sourceDamage = Math.floor(Math.random() * 12) + 8
        updated = updated.map((c) => (c.id === source.id ? applyStabilityChange(c, -sourceDamage) : c))

        return {
          success: false,
          updatedCountries: updated,
          event: {
            id: `espionage_failed_${Date.now()}`,
            type: "error",
            title: "🕵️ Operación de Espionaje Descubierta",
            description: `Los agentes de ${source.name} fueron capturados en ${target.name}`,
            effects: [
              `Estabilidad de ${source.name} reducida en ${sourceDamage}%`,
              "Agentes capturados y ejecutados",
              "Escándalo internacional",
              "Red de espionaje comprometida",
            ],
            timestamp: Date.now(),
          },
        }
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
