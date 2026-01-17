"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Country, GameEvent, GameAction, GameStats, ActionHistory, TradeOffer } from "@/lib/types"
import { initialCountries } from "@/lib/data/countries"
import { generateRandomEvent, generateConspiracyEvent, processAction, checkForCollapses, calculateChaosLevel, applyGDPGrowth, provideMutualAidToCriticalCountries, checkTerritorialRebellions, applyImperialMaintenanceCosts, applyInactivityPenalties } from "@/lib/game-engine"
import { aiProactiveActionsService } from "@/lib/ai-proactive-actions"
import { ACHIEVEMENTS, checkAchievements, calculateXPGain, getPlayerLevel, type Achievement } from "@/lib/achievement-system"
import type { GameProgression } from "@/lib/types"

export function useGameState() {
  // --- Estado de inactividad para IA rival ---
  const inactivityTicksRef = useRef<number>(0)
  const lastActionTimeRef = useRef<number>(Date.now())

  // Llama esto cada vez que el jugador ejecuta una acción
  const registerPlayerAction = useCallback(() => {
    inactivityTicksRef.current = 0
    lastActionTimeRef.current = Date.now()
  }, [])

  const [countries, setCountries] = useState<Country[]>(initialCountries)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [playerCountry, setPlayerCountry] = useState<string | null>(null)
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([])
  const [visibleNotifications, setVisibleNotifications] = useState<GameEvent[]>([])
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    currentYear: 2025,
    globalGDP: 0,
    globalPopulation: 0,
    globalStability: 0,
    countriesControlled: 0,
    globalDebt: 0,
    chaosLevel: 0,
    eventsThisSession: 0,
    negativeEventsBlocked: 0,
  })

  // Estado persistente para países controlados por IA
  const [persistentAICountries, setPersistentAICountries] = useState<string[]>([])

  // Referencias para controlar el sistema de eventos
  const eventIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const secondaryEventIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // Referencias de pausas eliminadas

  // Sistema de cola de eventos para escalonamiento
  const eventQueueRef = useRef<GameEvent[]>([])
  const eventProcessingRef = useRef<boolean>(false)
  const lastEventTimeRef = useRef<number>(0)
  const gameEventsRef = useRef<GameEvent[]>([])

  // Sincronizar gameEventsRef con gameEvents
  useEffect(() => {
    gameEventsRef.current = gameEvents
  }, [gameEvents])

  // Sistema de progresión y logros
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [gameProgression, setGameProgression] = useState<GameProgression>({
    totalXP: 0,
    level: 1,
    achievements: [],
    unlockedUpgrades: [],
    lastAchievementTime: 0,
    streak: 0,
    playTime: 0
  })
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [showLevelUp, setShowLevelUp] = useState(false)

  // Estado para game over y rachas
  const [isGameOver, setIsGameOver] = useState(false)
  const [conquerorCountry, setConquerorCountry] = useState<string>('')
  const [eventStreak, setEventStreak] = useState({ type: 'neutral', count: 0 }) // 'positive', 'negative', 'neutral'
  const streakRef = useRef({ type: 'neutral', count: 0 })

  // Estado del reloj de tiempo de juego
  const [gameTime, setGameTime] = useState(0) // Tiempo en segundos
  const [isClockAnimating, setIsClockAnimating] = useState(false)
  const [recentEvent, setRecentEvent] = useState<GameEvent | null>(null)
  const gameStartTimeRef = useRef<number>(Date.now())
  const gameTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Función para activar animación del reloj cuando ocurre un evento
  const triggerClockAnimation = useCallback(() => {
    setIsClockAnimating(true)
    setTimeout(() => setIsClockAnimating(false), 2000) // Animación dura 2 segundos
  }, [])

  // Función para procesar la cola de eventos con límite de 3 por segundo
  const processEventQueue = useCallback(() => {
    if (eventProcessingRef.current || eventQueueRef.current.length === 0) {
      return
    }

    eventProcessingRef.current = true
    const now = Date.now()
    const timeSinceLastEvent = now - lastEventTimeRef.current
    const minInterval = 15000 // 1 evento cada 15 segundos (4 eventos por minuto)

    const processNextEvent = () => {
      if (eventQueueRef.current.length === 0) {
        eventProcessingRef.current = false
        return
      }

      const event = eventQueueRef.current.shift()!

      // Asegurar timestamp único y añadir hash único
      const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000)
      const eventWithUniqueId = {
        ...event,
        timestamp: uniqueTimestamp,
        id: `${event.id}_${uniqueTimestamp}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Añadir el evento a la lista de eventos y notificaciones
      setGameEvents((prev) => [...prev, eventWithUniqueId])
      setVisibleNotifications((prev) => {
        const updated = [eventWithUniqueId, ...prev].slice(0, 3) // Mantener máximo 3 eventos
        console.log(`📢 Actualizando visibleNotifications: ${updated.length} eventos`)
        return updated
      })

      // Capturar evento para animaciones del mapa
      setRecentEvent(eventWithUniqueId)
      // Limpiar el evento después de 3 segundos para que no se repita la animación
      setTimeout(() => setRecentEvent(null), 3000)

      lastEventTimeRef.current = uniqueTimestamp

      // Si hay más eventos en la cola, programar el siguiente
      if (eventQueueRef.current.length > 0) {
        setTimeout(processNextEvent, minInterval)
      } else {
        eventProcessingRef.current = false
      }
    }

    // Si ha pasado suficiente tiempo desde el último evento, procesar inmediatamente
    if (timeSinceLastEvent >= minInterval) {
      processNextEvent()
    } else {
      // Esperar el tiempo restante antes de procesar
      setTimeout(processNextEvent, minInterval - timeSinceLastEvent)
    }
  }, [])

  // Función para añadir eventos a la cola con escalonamiento
  const addEventToQueue = useCallback((event: GameEvent) => {
    eventQueueRef.current.push(event)
    triggerClockAnimation() // Activar animación del reloj
    processEventQueue()
  }, [triggerClockAnimation, processEventQueue])

  // Calculate global stats including chaos level
  useEffect(() => {
    const totalGDP = countries.reduce((sum, country) => sum + country.economy.gdp, 0)
    const totalPopulation = countries.reduce((sum, country) => sum + country.population, 0)
    const avgStability = countries.reduce((sum, country) => sum + country.stability, 0) / countries.length
    const avgDebt = countries.reduce((sum, country) => sum + country.economy.debt, 0) / countries.length
    const countriesControlled = countries.filter(
      (country) => country.id === playerCountry || country.ownedBy === playerCountry,
    ).length

    // Calcular nivel de caos
    const chaosLevel = calculateChaosLevel(countries, gameEvents)

    setGameStats({
      currentYear: 2025,
      globalGDP: Math.round(totalGDP / 1000),
      globalPopulation: Math.round((totalPopulation / 1000000000) * 10) / 10,
      globalStability: Math.round(avgStability),
      globalDebt: Math.round(avgDebt),
      chaosLevel: chaosLevel,
      eventsThisSession: gameEventsRef.current.length,
      negativeEventsBlocked: gameEventsRef.current.filter((e) => e.title.includes("bloqueando eventos negativos")).length,
      countriesControlled,
    })
  }, [countries, playerCountry, gameEvents])

  // useEffect para el reloj de tiempo de juego - solo inicia cuando hay un jugador
  useEffect(() => {
    if (playerCountry) {
      // Inicializar el tiempo de inicio cuando el jugador selecciona un país
      gameStartTimeRef.current = Date.now()

      gameTimeIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
        setGameTime(elapsed)
      }, 1000)
    } else {
      // Limpiar el intervalo si no hay jugador
      if (gameTimeIntervalRef.current) {
        clearInterval(gameTimeIntervalRef.current)
        gameTimeIntervalRef.current = null
      }
      setGameTime(0)
    }

    return () => {
      if (gameTimeIntervalRef.current) {
        clearInterval(gameTimeIntervalRef.current)
      }
    }
  }, [playerCountry])

  // Función para determinar el intervalo de eventos basado en el tiempo de juego
  const getEventInterval = useCallback(() => {
    // Intervalos dinámicos basados en el tiempo de juego
    if (gameTime < 300) { // Primeros 5 minutos: eventos cada 30 segundos
      console.log("🎯 Fase inicial: eventos cada 30s")
      return 30000
    } else if (gameTime < 900) { // 5-15 minutos: eventos cada 20 segundos
      console.log("🎯 Fase media: eventos cada 20s")
      return 20000
    } else { // Después de 15 minutos: eventos cada 15 segundos
      console.log("🎯 Fase avanzada: eventos cada 15s")
      return 15000
    }
  }, [gameTime])

  // Sistema de pausas eliminado por solicitud del usuario

  // Función principal para generar eventos
  const generateEvent = useCallback(async () => {
    console.log("🎯 generateEvent ejecutándose... (SISTEMA DETERMINÍSTICO)")

    // Sistema determinístico - sin pausas

    // --- Lógica de inactividad para IA rival (MÁS AGRESIVA) ---
    inactivityTicksRef.current += 1

    // 🎯 NUEVA LÓGICA: Penalización específica para China por inactividad
    if (playerCountry === "china" && inactivityTicksRef.current >= 2) {
      const { updatedCountries, inactivityEvent } = applyInactivityPenalties(
        countries,
        playerCountry,
        inactivityTicksRef.current
      )
      if (inactivityEvent) {
        setCountries(updatedCountries)
        addEventToQueue(inactivityEvent)
        console.log(`🇨🇳 Penalización por inactividad aplicada a China (tick ${inactivityTicksRef.current})`)
      }
    }

    // Si el jugador ejecuta una acción, inactivityTicksRef se resetea vía registerPlayerAction
    // Si pasan 2 ciclos de eventos y la estabilidad global es baja, activar IA rival
    if (inactivityTicksRef.current >= 2 && gameStats.globalStability < 30 && playerCountry) {
      const { checkGlobalCollapseAndTriggerAI } = require("@/lib/game-engine")
      const { updatedCountries, aiEvent } = checkGlobalCollapseAndTriggerAI(
        countries,
        playerCountry,
        inactivityTicksRef.current,
        gameStats.globalStability
      )
      if (aiEvent) {
        setCountries(updatedCountries)
        addEventToQueue(aiEvent)
        inactivityTicksRef.current = 0 // Solo una vez por colapso
        return // Saltar generación normal este ciclo
      }
    }



    // Verificar ayuda mutua para países en crisis ANTES de verificar colapsos
    const { updatedCountries: countriesAfterAid, aidEvents } = provideMutualAidToCriticalCountries(countries, playerCountry!)

    // Procesar eventos de ayuda mutua
    if (aidEvents.length > 0) {
      console.log(`🤝 ${aidEvents.length} eventos de ayuda mutua generados`)
      aidEvents.forEach(event => {
        addEventToQueue(event)
      })
    }

    // Verificar colapsos y conquistas con países ya ayudados
    const { updatedCountries: countriesAfterCollapses, conquestEvents } = checkForCollapses(countriesAfterAid, playerCountry!)

    // Verificar rebeliones en territorios conquistados
    const { updatedCountries: countriesAfterRebellions, rebellionEvents } = checkTerritorialRebellions(countriesAfterCollapses, playerCountry!)

    // Aplicar costos de mantenimiento imperial
    const { updatedCountries, maintenanceEvents } = applyImperialMaintenanceCosts(countriesAfterRebellions, playerCountry!)

    // Procesar eventos de rebeliones
    if (rebellionEvents.length > 0) {
      console.log(`🔥 ${rebellionEvents.length} eventos de rebelión generados`)
      rebellionEvents.forEach(event => {
        addEventToQueue(event)
      })
    }

    // Procesar eventos de mantenimiento
    if (maintenanceEvents.length > 0) {
      console.log(`💰 ${maintenanceEvents.length} eventos de mantenimiento generados`)
      maintenanceEvents.forEach(event => {
        addEventToQueue(event)
      })
    }

    if (conquestEvents.length > 0) {
      console.log("🏴 Conquistas automáticas detectadas:", conquestEvents.length)
      setCountries(updatedCountries)

      conquestEvents.forEach((event) => {
        addEventToQueue(event)

        const conquestHistoryEntry: ActionHistory = {
          id: event.id,
          type: "conquest",
          actionName: "🏴 Conquista Automática",
          sourceCountry: playerCountry!,
          sourceCountryName: countries.find((c) => c.id === playerCountry)?.name || "Tu Imperio",
          targetCountry: event.id.split("_")[2] || "unknown",
          targetCountryName: event.title.split(" ")[0] || "País Colapsado",
          cost: 0,
          success: true,
          timestamp: event.timestamp,
          result: event.description,
        }
        setActionHistory((prev) => [...prev, conquestHistoryEntry])
      })
    }

    // Ejecutar acciones IA activas (conquistas, ataques, alianzas, ayuda, etc)
    const { runAIActions } = require("@/lib/game-engine")
    const aiResult = runAIActions(
      updatedCountries.length > 0 ? updatedCountries : countries,
      playerCountry!,
      gameStats.globalStability
    )
    if (aiResult.aiEvents.length > 0) {
      aiResult.aiEvents.forEach((event: GameEvent) => addEventToQueue(event))
      setCountries(aiResult.updatedCountries)
    }

    // Ejecutar acciones proactivas de IA diplomática
    try {
      const proactiveResult = await aiProactiveActionsService.evaluateProactiveActions(
        aiResult.updatedCountries.length > 0 ? aiResult.updatedCountries : (updatedCountries.length > 0 ? updatedCountries : countries),
        playerCountry!,
        gameEvents
      )

      if (proactiveResult.events.length > 0) {
        console.log(`🤖 ${proactiveResult.events.length} acciones proactivas de IA generadas`)
        proactiveResult.events.forEach(event => addEventToQueue(event))
        setCountries(proactiveResult.updatedCountries)

        // Agregar acciones al historial
        proactiveResult.actions.forEach(action => {
          const sourceCountry = countries.find(c => c.id === action.countryId)
          const targetCountry = countries.find(c => c.id === action.action.targetCountry)

          const historyEntry: ActionHistory = {
            id: `ai_proactive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: action.action.type,
            actionName: `🤖 ${action.action.type === 'military_action' ? 'Ataque Militar' :
              action.action.type === 'economic_sanction' ? 'Sanción Económica' :
                'Operación Encubierta'} (IA)`,
            sourceCountry: action.countryId,
            sourceCountryName: sourceCountry?.name || 'País IA',
            targetCountry: action.action.targetCountry || 'unknown',
            targetCountryName: targetCountry?.name || 'Objetivo',
            cost: action.action.cost,
            success: true,
            timestamp: Date.now(),
            result: `Acción proactiva de IA: ${action.reasoning}`,
            severity: 6
          }

          setActionHistory(prev => [...prev, historyEntry])
        })
      }
    } catch (error) {
      console.error('Error ejecutando acciones proactivas de IA:', error)
    }

    // Calcular nivel de caos actual
    const currentChaosLevel = calculateChaosLevel(
      aiResult.updatedCountries.length > 0 ? aiResult.updatedCountries : (updatedCountries.length > 0 ? updatedCountries : countries),
      gameEvents,
    )

    // Generar eventos aleatorios con control inteligente de caos
    console.log("🎯 Generando evento aleatorio con control de caos...")
    const { mainEvent, contagionEvents } = generateRandomEvent(
      updatedCountries.length > 0 ? updatedCountries : countries,
      playerCountry!,
      currentChaosLevel,
      gameEvents,
    )

    if (mainEvent) {
      console.log("📢 Evento principal generado:", mainEvent.title)

      addEventToQueue(mainEvent)

      // Rastrear eventos bloqueados por caos
      if (mainEvent.title.includes("bloqueando eventos negativos")) {
        setGameStats((prev) => ({ ...prev, negativeEventsBlocked: prev.negativeEventsBlocked + 1 }))
      }

      // --- Sistema de rachas de eventos ---
      const eventType = mainEvent.type === 'success' ? 'positive' :
        mainEvent.type === 'error' || mainEvent.type === 'warning' ? 'negative' : 'neutral'

      if (eventType === streakRef.current.type) {
        streakRef.current.count += 1
      } else {
        streakRef.current = { type: eventType, count: 1 }
      }

      setEventStreak(streakRef.current)

      // Aplicar bonificaciones por rachas
      if (streakRef.current.count >= 3) {
        const streakBonus = Math.min(streakRef.current.count * 0.2, 1.0) // Máximo 100% de bonus

        if (eventType === 'positive' && mainEvent.countryEffects) {
          // Aumentar efectos positivos durante rachas buenas
          Object.keys(mainEvent.countryEffects).forEach(countryId => {
            const effect = mainEvent.countryEffects![countryId]
            if (effect.economyChange && effect.economyChange > 0) {
              effect.economyChange = Math.round(effect.economyChange * (1 + streakBonus))
            }
            if (effect.stabilityChange && effect.stabilityChange > 0) {
              effect.stabilityChange = Math.round(effect.stabilityChange * (1 + streakBonus))
            }
          })

          console.log(`🔥 Racha positiva x${streakRef.current.count}! Bonus: +${Math.round(streakBonus * 100)}%`)
        } else if (eventType === 'negative' && mainEvent.countryEffects) {
          // Reducir efectos negativos durante rachas malas (el mundo se adapta)
          Object.keys(mainEvent.countryEffects).forEach(countryId => {
            const effect = mainEvent.countryEffects![countryId]
            if (effect.economyChange && effect.economyChange < 0) {
              effect.economyChange = Math.round(effect.economyChange * (1 - streakBonus * 0.3)) // Reducir daño
            }
            if (effect.stabilityChange && effect.stabilityChange < 0) {
              effect.stabilityChange = Math.round(effect.stabilityChange * (1 - streakBonus * 0.3))
            }
          })

          console.log(`🛡️ Racha negativa x${streakRef.current.count}. Resistencia: -${Math.round(streakBonus * 30)}% daño`)
        }
      }

      contagionEvents.forEach((contagionEvent) => {
        console.log("🌊 Evento de contagio generado:", contagionEvent.title)
        addEventToQueue(contagionEvent)
      })

      // Aplicar efectos del evento principal
      if (mainEvent.countryEffects)
        setCountries((prev) =>
          prev.map((country) => {
            const effect = mainEvent.countryEffects?.[country.id]
            if (effect) {
              console.log(`🏛️ Aplicando efectos principales a ${country.name}:`, effect)

              const updatedCountry = {
                ...country,
                stability: Math.max(0, Math.min(100, country.stability + (effect.stabilityChange || 0))),
                economy: {
                  ...country.economy,
                  gdp: Math.max(0, country.economy.gdp + (effect.economyChange || 0)),
                  debt: Math.max(0, Math.min(300, country.economy.debt + (effect.debtChange || 0))),
                  resourceProduction: { ...country.economy.resourceProduction },
                  resourceReserves: { ...country.economy.resourceReserves },
                },
                population: Math.max(0, country.population + (effect.populationChange || 0)),
              }

              if (effect.resourceEffects) {
                Object.entries(effect.resourceEffects).forEach(([resource, change]) => {
                  if (updatedCountry.economy.resourceProduction[resource]) {
                    updatedCountry.economy.resourceProduction[resource] = Math.max(
                      0,
                      updatedCountry.economy.resourceProduction[resource] + change,
                    )
                  }
                  if (updatedCountry.economy.resourceReserves[resource]) {
                    updatedCountry.economy.resourceReserves[resource] = Math.max(
                      0,
                      updatedCountry.economy.resourceReserves[resource] + change * 10,
                    )
                  }
                })
              }

              return updatedCountry
            }
            return country
          }),
        )

      // Aplicar efectos de contagio
      contagionEvents.forEach((contagionEvent) => {
        if (contagionEvent.countryEffects) {
          setCountries((prev) =>
            prev.map((country) => {
              const effect = contagionEvent.countryEffects?.[country.id]
              if (effect) {
                console.log(`🌊 Aplicando efectos de contagio a ${country.name}:`, effect)

                return {
                  ...country,
                  stability: Math.max(0, Math.min(100, country.stability + (effect.stabilityChange || 0))),
                  economy: {
                    ...country.economy,
                    gdp: Math.max(0, country.economy.gdp + (effect.economyChange || 0)),
                    debt: Math.max(0, Math.min(300, country.economy.debt + (effect.debtChange || 0))),
                  },
                  population: Math.max(0, country.population + (effect.populationChange || 0)),
                }
              }
              return country
            }),
          )
        }
      })

      // Agregar al historial
      const eventHistoryEntry: ActionHistory = {
        id: mainEvent.id,
        type: "world_event",
        actionName: mainEvent.title,
        sourceCountry: "world",
        sourceCountryName: mainEvent.isPlayerTriggered ? "⚖️ Consecuencia de Acciones" : "🌍 Evento Mundial",
        targetCountry: mainEvent.targetedCountry || Object.keys(mainEvent.countryEffects || {})[0] || "global",
        targetCountryName:
          Object.keys(mainEvent.countryEffects || {}).length > 0
            ? countries.find((c) => c.id === Object.keys(mainEvent.countryEffects!)[0])?.name || "Global"
            : "Global",
        cost: 0,
        success: true,
        timestamp: mainEvent.timestamp,
        result: mainEvent.description,
        severity: mainEvent.isPlayerTriggered ? 8 : 5, // Mayor severidad para eventos causados por el jugador
      }

      setActionHistory((prev) => [...prev, eventHistoryEntry])

      contagionEvents.forEach((contagionEvent) => {
        const contagionHistoryEntry: ActionHistory = {
          id: contagionEvent.id,
          type: "contagion_event",
          actionName: contagionEvent.title,
          sourceCountry: "world",
          sourceCountryName: "🌊 Contagio Regional",
          targetCountry: "multiple",
          targetCountryName: "Múltiples países",
          cost: 0,
          success: true,
          timestamp: contagionEvent.timestamp,
          result: contagionEvent.description,
        }

        setActionHistory((prev) => [...prev, contagionHistoryEntry])
      })
    } else {
      console.log("❌ No se generó ningún evento")
    }

    // Sistema determinístico - sin pausas aleatorias
    // --- VERIFICACIÓN DE FINAL DE JUEGO (GAME OVER) ---
    // Hacemos el chequeo menos agresivo (15% en lugar de 25%)
    if (playerCountry) {
      const playerCountryData = countries.find(c => c.id === playerCountry)

      if (playerCountryData && playerCountryData.stability < 15) {
        // Probabilidad de invasión reducida y basada en dificultad progresiva
        const invasionChance = Math.max(0.1, (20 - playerCountryData.stability) / 80)

        if (Math.random() < invasionChance) {
          console.log("🏴‍☠️ CONDICIÓN DE GAME OVER: Invasión inminente por inestabilidad crítica")

          // Buscar un vecino fuerte para invadir
          const neighbors = playerCountryData.neighbors || []
          const invaders = countries.filter(c => neighbors.includes(c.id) && c.stability > 50 && c.economy.gdp > playerCountryData.economy.gdp)
          const invader = invaders.length > 0 ? invaders[Math.floor(Math.random() * invaders.length)] : null

          if (invader) {
            setIsGameOver(true)
            setConquerorCountry(invader.name)

            const gameOverEvent: GameEvent = {
              id: `game_over_${Date.now()}`,
              type: "error",
              title: `💀 ${invader.name} conquista ${playerCountryData.name}`,
              description: `La baja estabilidad de ${playerCountryData.name} permitió que ${invader.name} invadiera y conquistara el territorio.`,
              effects: [
                `${playerCountryData.name} ha sido conquistado`,
                `Estabilidad crítica: ${Math.round(playerCountryData.stability)}%`,
                "El gobierno ha colapsado"
              ],
              timestamp: Date.now(),
            }
            addEventToQueue(gameOverEvent)
          } else {
            setIsGameOver(true)
            setConquerorCountry("Rebeldes")

            const gameOverEvent: GameEvent = {
              id: `game_over_${Date.now()}`,
              type: "error",
              title: `💀 Colapso del Gobierno`,
              description: `Tu gobierno ha colapsado totalmente debido a la inestabilidad extrema (${Math.round(playerCountryData.stability)}%).`,
              effects: [
                "Golpe de estado exitoso",
                "Has sido exiliado"
              ],
              timestamp: Date.now(),
            }
            addEventToQueue(gameOverEvent)
          }
        }
      }
    }

    console.log("✅ Evento generado exitosamente")
  }, [playerCountry, countries])

  // Función para generar acciones de IA cada minuto
  const generateAIAction = useCallback(async () => {
    console.log("🤖 generateAIAction ejecutándose... (ACCIÓN IA CADA MINUTO)")

    if (!playerCountry) return

    try {
      // Ejecutar acciones proactivas de IA específicamente dirigidas al jugador
      const proactiveResult = await aiProactiveActionsService.evaluateProactiveActions(
        countries,
        playerCountry,
        gameEvents
      )

      if (proactiveResult.events.length > 0) {
        console.log(`🤖 ${proactiveResult.events.length} acciones de IA dirigidas al jugador generadas`)

        // Marcar eventos como de IA para distinguirlos
        const aiEvents = proactiveResult.events.map(event => ({
          ...event,
          title: `🤖 ${event.title}`,
          description: `[ACCIÓN IA] ${event.description}`,
          isAIAction: true
        }))

        aiEvents.forEach(event => addEventToQueue(event))
        setCountries(proactiveResult.updatedCountries)

        // Agregar acciones al historial con marca de IA
        proactiveResult.actions.forEach(action => {
          const sourceCountry = countries.find(c => c.id === action.countryId)
          const targetCountry = countries.find(c => c.id === action.action.targetCountry)

          const historyEntry: ActionHistory = {
            id: `ai_minute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: action.action.type,
            actionName: `🤖 ${action.action.type === 'military_action' ? 'Ataque Militar' :
              action.action.type === 'economic_sanction' ? 'Sanción Económica' :
                'Operación Encubierta'} (IA)`,
            sourceCountry: action.countryId,
            sourceCountryName: sourceCountry?.name || 'País IA',
            targetCountry: action.action.targetCountry || playerCountry,
            targetCountryName: targetCountry?.name || 'Tu País',
            cost: action.action.cost,
            success: true,
            timestamp: Date.now(),
            result: `🤖 Acción IA cada minuto: ${action.reasoning}`,
            severity: 7
          }

          setActionHistory(prev => [...prev, historyEntry])
        })
      } else {
        console.log("🤖 No se generaron acciones de IA este minuto")
      }
    } catch (error) {
      console.error('Error ejecutando acciones de IA cada minuto:', error)
    }
  }, [playerCountry, countries, gameEvents, addEventToQueue])

  // Función específica para generar eventos de conspiración
  const generateConspiracyEvent = useCallback(async () => {
    console.log("🕵️ generateConspiracyEvent ejecutándose...")

    if (!playerCountry || isGameOver) {
      console.log("🕵️ No se puede generar evento de conspiración: juego no iniciado o terminado")
      return
    }

    // Calcular nivel de caos actual
    const currentChaosLevel = calculateChaosLevel(countries, gameEvents)

    // Generar evento de conspiración específico usando la función del game-engine
    console.log("🕵️ Generando evento de conspiración...")
    const { generateConspiracyEvent: engineGenerateConspiracyEvent } = require("@/lib/game-engine")
    const { mainEvent, contagionEvents } = engineGenerateConspiracyEvent(
      countries,
      playerCountry,
      currentChaosLevel,
      gameEvents,
    )

    if (mainEvent) {
      console.log("🕵️ Evento de conspiración generado:", mainEvent.title)

      addEventToQueue(mainEvent)

      // Aplicar efectos del evento de conspiración
      if (mainEvent.countryEffects) {
        setCountries((prev) =>
          prev.map((country) => {
            const effect = mainEvent.countryEffects?.[country.id]
            if (effect) {
              console.log(`🕵️ Aplicando efectos de conspiración a ${country.name}:`, effect)

              const updatedCountry = {
                ...country,
                stability: Math.max(0, Math.min(100, country.stability + (effect.stabilityChange || 0))),
                economy: {
                  ...country.economy,
                  gdp: Math.max(0, country.economy.gdp + (effect.economyChange || 0)),
                  debt: Math.max(0, Math.min(300, country.economy.debt + (effect.debtChange || 0))),
                  resourceProduction: { ...country.economy.resourceProduction },
                  resourceReserves: { ...country.economy.resourceReserves },
                },
                population: Math.max(0, country.population + (effect.populationChange || 0)),
              }

              if (effect.resourceEffects) {
                Object.entries(effect.resourceEffects).forEach(([resource, change]) => {
                  const numericChange = change as number
                  if (updatedCountry.economy.resourceProduction[resource] !== undefined) {
                    updatedCountry.economy.resourceProduction[resource] = Math.max(
                      0,
                      updatedCountry.economy.resourceProduction[resource] + numericChange,
                    )
                  }
                  if (updatedCountry.economy.resourceReserves[resource] !== undefined) {
                    updatedCountry.economy.resourceReserves[resource] = Math.max(
                      0,
                      updatedCountry.economy.resourceReserves[resource] + numericChange * 10,
                    )
                  }
                })
              }

              return updatedCountry
            }
            return country
          }),
        )
      }

      // Procesar eventos de contagio si los hay
      contagionEvents.forEach((contagionEvent: GameEvent) => {
        console.log("🕵️ Evento de contagio de conspiración generado:", contagionEvent.title)
        addEventToQueue(contagionEvent)
      })

      // Actualizar estadísticas
      setGameStats((prev) => ({
        ...prev,
        eventsThisSession: prev.eventsThisSession + 1,
      }))
    } else {
      console.log("🕵️ No se generó evento de conspiración este ciclo")
    }
  }, [playerCountry, countries, gameEvents, addEventToQueue, isGameOver])

  // Función para generar eventos militares menores






  // Sistema de eventos determinístico basado en tiempo exacto
  const lastSecondaryEventTimeRef = useRef<number>(0)
  const lastAIActionTimeRef = useRef<number>(0)
  const lastConspiracyEventTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!playerCountry || gameTime === 0) return

    console.log(`🎯 Verificando eventos en segundo ${gameTime}`)

    // Evento principal cada 10 segundos exactos (MÁS FRECUENTE)
    const shouldGenerateEvent = gameTime % 10 === 0 && gameTime !== lastEventTimeRef.current

    if (shouldGenerateEvent) {
      console.log(`🎯 GENERANDO EVENTO PRINCIPAL en segundo ${gameTime}`)
      lastEventTimeRef.current = gameTime
      generateEvent()
    }

    // Evento secundario cada 20 segundos (offset de 5 segundos)
    const shouldGenerateSecondaryEvent = (gameTime - 5) % 20 === 0 && gameTime > 5 && gameTime !== lastSecondaryEventTimeRef.current

    if (shouldGenerateSecondaryEvent) {
      console.log(`🎯 GENERANDO EVENTO SECUNDARIO en segundo ${gameTime}`)
      lastSecondaryEventTimeRef.current = gameTime
      generateEvent()
    }

    // Eventos de conspiración cada 15 segundos exactos (2 cada 30 segundos)
    const shouldGenerateConspiracyEvent = gameTime % 15 === 0 && gameTime > 0 && gameTime !== lastConspiracyEventTimeRef.current

    if (shouldGenerateConspiracyEvent) {
      console.log(`🕵️ GENERANDO EVENTO DE CONSPIRACIÓN en segundo ${gameTime}`)
      lastConspiracyEventTimeRef.current = gameTime
      generateConspiracyEvent()
    }

    // Acción de IA cada 60 segundos exactos (1 minuto)
    const shouldGenerateAIAction = gameTime % 60 === 0 && gameTime > 0 && gameTime !== lastAIActionTimeRef.current

    if (shouldGenerateAIAction) {
      console.log(`🤖 GENERANDO ACCIÓN DE IA en segundo ${gameTime}`)
      lastAIActionTimeRef.current = gameTime
      generateAIAction()
    }
  }, [gameTime, playerCountry, generateEvent, generateAIAction, generateConspiracyEvent])

  // Sistema de mejora automática de territorios conquistados
  useEffect(() => {
    if (!playerCountry) return

    console.log("🏛️ Sistema de mejora de territorios conquistados iniciado")

    const improvementInterval = setInterval(() => {
      const playerCountryData = countries.find(c => c.id === playerCountry)
      if (!playerCountryData) return

      const conqueredTerritories = countries.filter(c => c.ownedBy === playerCountry)

      if (conqueredTerritories.length === 0) return

      // Solo mejorar si el país principal está estable (estabilidad > 60)
      if (playerCountryData.stability <= 60) {
        console.log("🔸 País principal inestable, pausando mejoras de territorios")
        return
      }

      console.log(`🔧 Mejorando ${conqueredTerritories.length} territorios conquistados`)

      setCountries(prev => prev.map(country => {
        if (country.ownedBy === playerCountry && country.id !== playerCountry) {
          // Calcular mejoras basadas en la estabilidad del país principal
          const improvementFactor = Math.min(1, playerCountryData.stability / 100)

          const stabilityImprovement = Math.round(2 * improvementFactor) // 1-2% por tick
          const economyImprovement = Math.round(50 * improvementFactor * (country.economy.gdp / 1000)) // Proporcional al PIB
          const debtReduction = Math.round(1 * improvementFactor) // 0-1% por tick

          const newStability = Math.min(85, country.stability + stabilityImprovement) // Máximo 85% para territorios
          const newGdp = country.economy.gdp + economyImprovement
          const newDebt = Math.max(0, country.economy.debt - debtReduction)

          // Solo aplicar mejoras si hay cambios significativos
          if (stabilityImprovement > 0 || economyImprovement > 0 || debtReduction > 0) {
            console.log(`📈 Mejorando ${country.name}: Estabilidad +${stabilityImprovement}%, PIB +$${economyImprovement}B, Deuda -${debtReduction}%`)

            return {
              ...country,
              stability: newStability,
              economy: {
                ...country.economy,
                gdp: newGdp,
                debt: newDebt,
              }
            }
          }
        }
        return country
      }))
    }, 90000) // Cada 90 segundos

    return () => {
      console.log("🛑 Sistema de mejora de territorios detenido")
      clearInterval(improvementInterval)
    }
  }, [playerCountry, countries])

  // Sistema de retaliaciones automáticas
  useEffect(() => {
    if (!playerCountry) return

    console.log("⚔️ Sistema de retaliaciones automáticas iniciado")

    const retaliationInterval = setInterval(() => {
      setCountries(prev => {
        let updatedCountries = [...prev]
        let hasRetaliations = false

        // Buscar países que han sido atacados recientemente
        const recentAttacks = actionHistory.slice(-10).filter(action =>
          action.success &&
          (action.type === "military_action" || action.type === "cyber_attack" ||
            action.type === "economic_sanction" || action.type === "espionage") &&
          action.sourceCountry === playerCountry
        )

        recentAttacks.forEach(attack => {
          const attackedCountry = updatedCountries.find(c => c.id === attack.targetCountry)
          const playerCountryData = updatedCountries.find(c => c.id === playerCountry)

          if (!attackedCountry || !playerCountryData || attackedCountry.ownedBy === playerCountry) return

          // Probabilidad de retaliación basada en la estabilidad del país atacado
          const retaliationChance = Math.max(0.15, Math.min(0.6, (100 - attackedCountry.stability) / 100))

          if (Math.random() < retaliationChance) {
            hasRetaliations = true
            console.log(`🎯 ${attackedCountry.name} ejecuta retaliación contra ${playerCountryData.name}!`)

            // Determinar tipo de retaliación basado en el ataque original
            let retaliationType = "military_action"
            let retaliationTitle = "⚔️ Retaliación Militar"
            let retaliationDescription = `${attackedCountry.name} ha lanzado un contraataque militar contra ${playerCountryData.name}`

            if (attack.type === "cyber_attack") {
              retaliationType = "cyber_counter"
              retaliationTitle = "💻 Contra-Ciberataque"
              retaliationDescription = `${attackedCountry.name} ha ejecutado un ciberataque de venganza contra ${playerCountryData.name}`
            } else if (attack.type === "economic_sanction") {
              retaliationType = "economic_counter"
              retaliationTitle = "💰 Contra-Sanciones"
              retaliationDescription = `${attackedCountry.name} ha impuesto sanciones económicas de represalia contra ${playerCountryData.name}`
            } else if (attack.type === "espionage") {
              retaliationType = "espionage_counter"
              retaliationTitle = "🕵️ Contra-Espionaje"
              retaliationDescription = `${attackedCountry.name} ha infiltrado agentes de venganza en ${playerCountryData.name}`
            }

            // Calcular daño de retaliación
            const economicDamage = Math.floor(playerCountryData.economy.gdp * 0.08)
            const stabilityDamage = Math.floor(Math.random() * 12) + 8
            const militaryDamage = Math.floor(Math.random() * 10) + 5

            // Aplicar daño al jugador
            updatedCountries = updatedCountries.map(c => {
              if (c.id === playerCountry) {
                return {
                  ...c,
                  economy: { ...c.economy, gdp: Math.max(100, c.economy.gdp - economicDamage) },
                  stability: Math.max(0, c.stability - stabilityDamage),
                  militaryStrength: Math.max(10, (c.militaryStrength || 50) - militaryDamage),
                }
              }
              return c
            })

            // TODOS los aliados responden defensivamente
            const allies = updatedCountries.filter(c =>
              (attackedCountry.alliances || []).includes(c.id) && c.id !== attackedCountry.id
            )

            let allyEffects: string[] = []
            if (allies.length > 0) {
              // Cada aliado contribuye a la defensa
              allies.forEach(ally => {
                const allyContribution = Math.floor(economicDamage * 0.2) // Cada aliado contribuye 20%
                const allyMilitarySupport = Math.floor(militaryDamage * 0.3)

                updatedCountries = updatedCountries.map(c => {
                  if (c.id === ally.id) {
                    // Los aliados también sufren costos por defender
                    return {
                      ...c,
                      economy: { ...c.economy, gdp: Math.max(100, c.economy.gdp - Math.floor(allyContribution * 0.5)) },
                      stability: Math.max(0, c.stability - 2),
                      militaryStrength: Math.max(10, (c.militaryStrength || 50) - 3),
                    }
                  }
                  return c
                })

                // Aumentar el daño al jugador por cada aliado que responde
                updatedCountries = updatedCountries.map(c => {
                  if (c.id === playerCountry) {
                    return {
                      ...c,
                      economy: { ...c.economy, gdp: Math.max(100, c.economy.gdp - allyContribution) },
                      militaryStrength: Math.max(10, (c.militaryStrength || 50) - allyMilitarySupport),
                    }
                  }
                  return c
                })

                allyEffects.push(`🤝 ${ally.name} responde en defensa de su aliado`)
                allyEffects.push(`💥 Daño adicional: $${allyContribution}B PIB, ${allyMilitarySupport} fuerza militar`)
              })

              // Deteriorar relaciones diplomáticas con todos los aliados
              allies.forEach(ally => {
                updatedCountries = updatedCountries.map(c => {
                  if (c.id === ally.id) {
                    const currentRelation = c.diplomaticRelations?.[playerCountryData.name] || 0
                    return {
                      ...c,
                      diplomaticRelations: {
                        ...c.diplomaticRelations,
                        [playerCountryData.name]: Math.max(-100, currentRelation - 25)
                      }
                    }
                  }
                  if (c.id === playerCountry) {
                    const currentRelation = c.diplomaticRelations?.[ally.name] || 0
                    return {
                      ...c,
                      diplomaticRelations: {
                        ...c.diplomaticRelations,
                        [ally.name]: Math.max(-100, currentRelation - 25)
                      }
                    }
                  }
                  return c
                })
              })

              if (allies.length > 1) {
                allyEffects.push(`⚠️ Has provocado la ira de ${allies.length} países aliados`)
              }
            }

            // Crear evento de retaliación
            const retaliationEvent: GameEvent = {
              id: `retaliation_${Date.now()}_${Math.random()}`,
              type: "warning",
              title: retaliationTitle,
              description: retaliationDescription,
              effects: [
                `PIB de ${playerCountryData.name} reducido en $${economicDamage}B`,
                `Estabilidad de ${playerCountryData.name} reducida en ${stabilityDamage}%`,
                `Fuerza militar de ${playerCountryData.name} reducida en ${militaryDamage}`,
                "⚠️ Las acciones agresivas tienen consecuencias",
                ...allyEffects,
              ],
              timestamp: Date.now(),
            }

            // Agregar evento a la lista
            setGameEvents(prevEvents => [...prevEvents, retaliationEvent])
            setVisibleNotifications(prevNotifications => [retaliationEvent, ...prevNotifications.slice(0, 2)]) // Eventos más recientes arriba, máximo 3

            // Agregar a historial de acciones
            const retaliationHistory: ActionHistory = {
              id: `retaliation_history_${Date.now()}`,
              type: retaliationType as any,
              actionName: retaliationEvent.title,
              sourceCountry: attackedCountry.id,
              sourceCountryName: attackedCountry.name,
              targetCountry: playerCountry,
              targetCountryName: countries.find(c => c.id === playerCountry)?.name || "Tu País",
              cost: 0,
              timestamp: Date.now(),
              success: true,
              result: retaliationDescription,
            }
            setActionHistory(prevHistory => [...prevHistory, retaliationHistory])
          }
        })

        return updatedCountries
      })
    }, 25000) // Cada 25 segundos

    return () => {
      console.log("🛑 Sistema de retaliaciones detenido")
      clearInterval(retaliationInterval)
    }
  }, [playerCountry, actionHistory])

  // Sistema de crecimiento económico dinámico
  useEffect(() => {
    if (!playerCountry) return

    console.log("💰 Sistema de crecimiento económico dinámico iniciado")

    const economicGrowthInterval = setInterval(() => {
      console.log("📊 Aplicando crecimiento económico global...")

      setCountries(prev => {
        const updatedCountries = applyGDPGrowth(prev, playerCountry)

        // Calcular ingresos totales del jugador desde territorios
        const playerCountryData = updatedCountries.find(c => c.id === playerCountry)
        const totalPlayerBonus = updatedCountries
          .filter(c => c.ownedBy === playerCountry && c.id !== playerCountry)
          .reduce((sum, c) => sum + (c.playerBonus || 0), 0)

        if (totalPlayerBonus > 0) {
          console.log(`💎 Ingresos de territorios conquistados: +$${totalPlayerBonus}B`)

          // Agregar los ingresos al país principal del jugador
          return updatedCountries.map(c =>
            c.id === playerCountry
              ? {
                ...c,
                economy: {
                  ...c.economy,
                  gdp: c.economy.gdp + totalPlayerBonus
                }
              }
              : c
          )
        }

        return updatedCountries
      })

      // Nota: Eliminamos la notificación automática del PIB para reducir spam de eventos
    }, 60000) // Cada 60 segundos

    return () => {
      console.log("🛑 Sistema de crecimiento económico detenido")
      clearInterval(economicGrowthInterval)
    }
  }, [playerCountry])

  const selectCountry = useCallback((countryId: string | null) => {
    setSelectedCountry(countryId)
  }, [])

  const getActionName = (actionType: string): string => {
    const actionNames: Record<string, string> = {
      economic_investment: "Inversión Económica",
      social_policy: "Política Social",
      legal_system_change: "Reforma Legal",
      military_buildup: "Fortalecimiento Militar",
      infrastructure_development: "Desarrollo de Infraestructura",
      education_reform: "Reforma Educativa",
      propaganda_campaign: "Campaña de Propaganda",
      diplomatic_alliance: "Alianza Diplomática",
      trade_agreement: "Acuerdo Comercial",
      diplomatic_message: "Mensaje Diplomático",
      economic_aid: "Ayuda Económica",
      military_action: "Invasión Militar",
      naval_blockade: "Bloqueo Naval",
      cyber_attack: "Ciberataque",
      espionage: "Operación de Espionaje",
      economic_sanction: "Sanciones Económicas",
      trade_embargo: "Embargo Comercial",
      resource_extraction: "Extracción de Recursos",
      geoengineering: "Geoingeniería",
      masonic_influence: "Influencia Masónica",
      media_manipulation: "Manipulación Mediática",
      regime_change: "Cambio de Régimen",
      technology_theft: "Robo de Tecnología",
      biological_warfare: "Guerra Biológica",
      world_event: "Evento Mundial",
      trade_executed: "Comercio Internacional",
      conquest: "Conquista Automática",
      special_conquest: "👑 Conquista Imperial",
      contagion_event: "🌊 Contagio Regional",
    }
    return actionNames[actionType] || actionType
  }

  const executeAction = useCallback(
    (action: GameAction) => {
      console.log("🎯 Ejecutando acción:", action.type)
      const result = processAction(action, countries)

      // 🎮 SISTEMA DE GAMIFICACIÓN - Calcular XP y progresión
      const impact = action.type === "conquest" || action.type === "special_conquest" ? 3 : 1
      const xpGained = calculateXPGain(action.type, result.success, impact)
      const oldLevel = getPlayerLevel(gameProgression.totalXP).level
      const newTotalXP = gameProgression.totalXP + xpGained
      const newLevel = getPlayerLevel(newTotalXP).level

      // Actualizar progresión con feedback inmediato
      setGameProgression(prev => ({
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        streak: result.success ? prev.streak + 1 : Math.max(0, prev.streak - 1)
      }))

      // 🎊 SUBIDA DE NIVEL - Feedback emocionante
      if (newLevel > oldLevel && !showLevelUp) {
        console.log(`🎊 ¡SUBIDA DE NIVEL! ${oldLevel} → ${newLevel}`)
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 5000)

        // Recompensa por subir de nivel
        const levelUpBonus = newLevel * 200
        if (playerCountry) {
          setCountries(prev => prev.map(c =>
            c.id === playerCountry
              ? { ...c, economy: { ...c.economy, gdp: c.economy.gdp + levelUpBonus } }
              : c
          ))
        }
      }

      const sourceCountry = countries.find((c) => c.id === action.sourceCountry)
      const targetCountry = countries.find((c) => c.id === action.targetCountry)

      const historyEntry: ActionHistory = {
        id: action.id,
        type: action.type,
        actionName: getActionName(action.type),
        sourceCountry: action.sourceCountry,
        sourceCountryName: sourceCountry?.name || "Desconocido",
        targetCountry: action.targetCountry,
        targetCountryName: targetCountry?.name || "Desconocido",
        cost: action.cost,
        success: result.success,
        timestamp: action.timestamp,
        result: result.success
          ? `${result.event?.description} 🎯 +${xpGained} XP`
          : result.event?.description,
        severity: action.severity || 0,
      }

      setActionHistory((prev) => [...prev, historyEntry])

      if (result.success) {
        console.log("✅ Acción exitosa, actualizando países")
        setCountries(result.updatedCountries)

        // Si es una conquista, limpiar la lista de países IA persistentes
        if (action.type === "special_conquest" || action.type === "conquest") {
          console.log("🏴 Conquista detectada, actualizando países IA")
          // Filtrar países IA que ya no son válidos (conquistados)
          const validAICountries = persistentAICountries.filter(countryId => {
            const country = result.updatedCountries.find(c => c.id === countryId)
            return country && !country.ownedBy
          })
          setPersistentAICountries(validAICountries)
        }

        if (result.event) {
          console.log("📢 Evento generado por acción:", result.event.title)
          addEventToQueue(result.event)
        }

        // 🏆 VERIFICAR LOGROS - Feedback instantáneo
        setTimeout(() => {
          const playerCountryData = result.updatedCountries.find(c => c.id === playerCountry)
          if (playerCountryData) {
            const { updatedAchievements, newUnlocks } = checkAchievements(
              achievements,
              playerCountryData,
              result.updatedCountries,
              gameEvents,
              [...actionHistory, historyEntry],
              gameStats
            )

            setAchievements(updatedAchievements)

            if (newUnlocks.length > 0) {
              console.log(`🏆 ¡LOGROS DESBLOQUEADOS! ${newUnlocks.map(a => a.name).join(', ')}`)
              setRecentAchievements(prev => [...prev, ...newUnlocks])

              // Aplicar recompensas de logros
              newUnlocks.forEach(achievement => {
                if (achievement.reward.type === "money") {
                  setCountries(prev => prev.map(c =>
                    c.id === playerCountry
                      ? { ...c, economy: { ...c.economy, gdp: c.economy.gdp + achievement.reward.amount } }
                      : c
                  ))
                } else if (achievement.reward.type === "stability") {
                  setCountries(prev => prev.map(c =>
                    c.id === playerCountry
                      ? { ...c, stability: Math.min(100, c.stability + achievement.reward.amount) }
                      : c
                  ))
                }
              })

              // Nota: El auto-dismiss ahora se maneja en el componente AchievementNotifications
              // con sistema de cascada personalizado
            }
          }
        }, 100)

      } else {
        console.log("❌ Acción falló")
        if (result.event) {
          addEventToQueue(result.event)
        }
      }
    },
    [countries, playerCountry, gameProgression.totalXP, achievements, gameEvents, actionHistory, gameStats],
  )

  const executeTradeOffer = useCallback(
    (trade: TradeOffer) => {
      console.log("💰 Ejecutando comercio:", trade)
      setCountries((prev) =>
        prev.map((country) => {
          if (country.id === trade.fromCountry) {
            const resource = Object.keys(trade.offering)[0]
            const quantity = Object.values(trade.offering)[0]

            return {
              ...country,
              economy: {
                ...country.economy,
                gdp: country.economy.gdp + trade.totalValue,
                resourceReserves: {
                  ...country.economy.resourceReserves,
                  [resource]: Math.max(0, (country.economy.resourceReserves[resource] || 0) - quantity),
                },
              },
            }
          }
          if (country.id === trade.toCountry) {
            const resource = Object.keys(trade.offering)[0]
            const quantity = Object.values(trade.offering)[0]

            return {
              ...country,
              economy: {
                ...country.economy,
                gdp: Math.max(0, country.economy.gdp - trade.totalValue),
                resourceReserves: {
                  ...country.economy.resourceReserves,
                  [resource]: (country.economy.resourceReserves[resource] || 0) + quantity,
                },
              },
            }
          }
          return country
        }),
      )

      updateDiplomaticRelations(trade.fromCountry, trade.toCountry, 5)

      const fromCountry = countries.find((c) => c.id === trade.fromCountry)
      const toCountry = countries.find((c) => c.id === trade.toCountry)
      const resource = Object.keys(trade.offering)[0]
      const quantity = Object.values(trade.offering)[0]

      const tradeHistoryEntry: ActionHistory = {
        id: trade.id,
        type: "trade_executed",
        actionName: "Comercio Internacional",
        sourceCountry: trade.fromCountry,
        sourceCountryName: fromCountry?.name || "Desconocido",
        targetCountry: trade.toCountry,
        targetCountryName: toCountry?.name || "Desconocido",
        cost: trade.totalValue,
        success: true,
        timestamp: Date.now(),
        result: `${quantity} ${resource} por $${trade.totalValue}B`,
      }

      setActionHistory((prev) => [...prev, tradeHistoryEntry])
    },
    [countries],
  )

  const updateDiplomaticRelations = useCallback((country1: string, country2: string, change: number) => {
    setCountries((prev) =>
      prev.map((country) => {
        if (country.id === country1) {
          return {
            ...country,
            diplomaticRelations: {
              ...country.diplomaticRelations,
              [country2]: Math.max(-100, Math.min(100, (country.diplomaticRelations?.[country2] || 0) + change)),
            },
          }
        }
        if (country.id === country2) {
          return {
            ...country,
            diplomaticRelations: {
              ...country.diplomaticRelations,
              [country1]: Math.max(-100, Math.min(100, (country.diplomaticRelations?.[country1] || 0) + change)),
            },
          }
        }
        return country
      }),
    )
  }, [])

  const dismissNotification = useCallback((eventId: string) => {
    console.log("🗑️ Descartando notificación:", eventId)
    setVisibleNotifications((prev) => prev.filter((event) => event.id !== eventId))
  }, [])

  // Filtrar eventos de actualización económica automática de las notificaciones visibles y eventos
  useEffect(() => {
    const filterEconomicEvents = (events: GameEvent[]) =>
      events.filter((event) => {
        // NO filtrar eventos de acciones del jugador (success, warning, error)
        if (event.type === 'success' || event.type === 'warning' || event.type === 'error') {
          return true
        }

        // Filtrar solo eventos automáticos del sistema económico
        return !event.title.includes("Actualización Económica Global") &&
          !event.description.includes("PIB mundial se ha actualizado") &&
          !event.description.includes("PIB actualizado para todos los países") &&
          !event.effects?.some(effect =>
            effect.includes("PIB actualizado para todos los países") ||
            effect.includes("Crecimiento basado en estabilidad y recursos") ||
            effect.includes("Territorios conquistados generando ingresos") ||
            effect.includes("Relaciones diplomáticas afectando comercio")
          )
      })

    setVisibleNotifications((prev) => filterEconomicEvents(prev))
    setGameEvents((prev) => filterEconomicEvents(prev))
  }, [visibleNotifications.length, gameEvents.length])

  const ownedTerritories = countries.filter((country) => country.ownedBy === playerCountry)

  // Función para obtener países controlados por la IA (máximo 3, progresivo)
  const getAICountries = useCallback(() => {
    if (!playerCountry) return []

    // Determinar cuántos países puede controlar la IA basado en el tiempo de juego
    const gameMinutes = Math.floor(gameTime / 60)
    let maxAICountries = 1 // Empezar con 1 país
    if (gameMinutes >= 5) maxAICountries = 2 // Después de 5 minutos, 2 países
    if (gameMinutes >= 10) maxAICountries = 3 // Después de 10 minutos, 3 países máximo

    // Filtrar países persistentes que aún existen y son válidos
    const validPersistentCountries = persistentAICountries.filter(countryId => {
      const country = countries.find(c => c.id === countryId)
      return country && country.id !== playerCountry && !country.ownedBy
    })

    // Si necesitamos más países, agregar nuevos
    if (validPersistentCountries.length < maxAICountries) {
      const availableCountries = countries.filter(country =>
        country.id !== playerCountry &&
        !country.ownedBy &&
        !validPersistentCountries.includes(country.id) &&
        country.economy.gdp > 800 && // PIB más alto para ser más selectivo
        country.stability > 50 // Estabilidad más alta
      )

      const neededCountries = maxAICountries - validPersistentCountries.length
      const newCountries = availableCountries
        .sort((a, b) => (b.economy.gdp + b.stability) - (a.economy.gdp + a.stability))
        .slice(0, neededCountries)
        .map(c => c.id)

      const updatedPersistentCountries = [...validPersistentCountries, ...newCountries]
      setPersistentAICountries(updatedPersistentCountries)

      return countries.filter(c => updatedPersistentCountries.includes(c.id))
    }

    // Actualizar el estado persistente si cambió
    if (validPersistentCountries.length !== persistentAICountries.length) {
      setPersistentAICountries(validPersistentCountries)
    }

    return countries.filter(c => validPersistentCountries.includes(c.id))
  }, [countries, playerCountry, gameTime, persistentAICountries])

  const aiCountries = getAICountries()

  // Función para marcar eventos como vistos
  const markEventsAsSeen = useCallback(() => {
    setGameEvents(prevEvents =>
      prevEvents.map(event => ({ ...event, seen: true }))
    )
  }, [])

  const dismissLevelUp = useCallback(() => {
    setShowLevelUp(false)
  }, [])

  // Función para reiniciar el juego
  const restartGame = useCallback(() => {
    setCountries(initialCountries)
    setSelectedCountry(null)
    setPlayerCountry(null)
    setGameEvents([])
    setVisibleNotifications([])
    setActionHistory([])
    setIsGameOver(false)
    setConquerorCountry('')
    setEventStreak({ type: 'neutral', count: 0 })
    streakRef.current = { type: 'neutral', count: 0 }
    setGameProgression({
      totalXP: 0,
      level: 1,
      achievements: [],
      unlockedUpgrades: [],
      lastAchievementTime: 0,
      streak: 0,
      playTime: 0
    })
    setAchievements(ACHIEVEMENTS)
    setRecentAchievements([])
    setShowLevelUp(false)
    inactivityTicksRef.current = 0
    lastActionTimeRef.current = Date.now()

    // Limpiar lista de países IA persistentes
    setPersistentAICountries([])
    console.log("🔄 Juego reiniciado - Países IA y conquistas restablecidos")

    // Limpiar intervalos
    if (eventIntervalRef.current) {
      clearInterval(eventIntervalRef.current)
    }
    if (secondaryEventIntervalRef.current) {
      clearInterval(secondaryEventIntervalRef.current)
    }
    // Limpieza de pausas eliminada
    if (gameTimeIntervalRef.current) {
      clearInterval(gameTimeIntervalRef.current)
    }

    // Reiniciar reloj de tiempo de juego
    setGameTime(0)
    setIsClockAnimating(false)
    gameStartTimeRef.current = Date.now()

    // Reset de pausas eliminado
  }, [])

  return {
    countries,
    selectedCountry,
    playerCountry,
    gameEvents, // Cronología completa
    visibleNotifications, // Solo notificaciones
    ownedTerritories, // Territorios conquistados
    aiCountries, // Países controlados por IA
    selectCountry,
    setPlayerCountry,
    executeAction,
    dismissNotification, // Cambiado
    gameStats,
    actionHistory,
    updateDiplomaticRelations,
    executeTradeOffer,
    markEventsAsSeen, // Nueva función
    // Sistema de gamificación
    achievements,
    setAchievements,
    gameProgression,
    recentAchievements,
    showLevelUp,
    dismissLevelUp,
    playerLevel: getPlayerLevel(gameProgression.totalXP),
    // Nueva función para notificar acción del jugador (reset inactividad IA)
    registerPlayerAction,
    // Estados y funciones para game over y rachas
    isGameOver,
    conquerorCountry,
    eventStreak,
    restartGame,
    // Reloj de tiempo de juego
    gameTime,
    isClockAnimating,
    // Evento reciente para animaciones del mapa
    recentEvent,
  }
}
