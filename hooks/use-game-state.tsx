"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Country, GameEvent, GameAction, GameStats, ActionHistory, TradeOffer } from "@/lib/types"
import { initialCountries } from "@/lib/data/countries"
import { generateRandomEvent, processAction, checkForCollapses, calculateChaosLevel, applyGDPGrowth, provideMutualAidToCriticalCountries, checkTerritorialRebellions, applyImperialMaintenanceCosts } from "@/lib/game-engine"
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

  // Referencias para controlar el sistema de eventos
  const eventIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPauseTimeRef = useRef<number>(0)
  const isEventsPausedRef = useRef<boolean>(false)
  
  // Sistema de cola de eventos para escalonamiento
  const eventQueueRef = useRef<GameEvent[]>([])
  const eventProcessingRef = useRef<boolean>(false)
  const lastEventTimeRef = useRef<number>(0)

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

  // Función para añadir eventos a la cola con escalonamiento
  const addEventToQueue = useCallback((event: GameEvent) => {
    eventQueueRef.current.push(event)
    processEventQueue()
  }, [])

  // Función para procesar la cola de eventos con límite de 3 por segundo
  const processEventQueue = useCallback(() => {
    if (eventProcessingRef.current || eventQueueRef.current.length === 0) {
      return
    }

    eventProcessingRef.current = true
    const now = Date.now()
    const timeSinceLastEvent = now - lastEventTimeRef.current
    const minInterval = 10000 // 1 evento cada 10 segundos (6 eventos por minuto)

    const processNextEvent = () => {
      if (eventQueueRef.current.length === 0) {
        eventProcessingRef.current = false
        return
      }

      const event = eventQueueRef.current.shift()!
      
      // Añadir el evento a la lista de eventos y notificaciones
      setGameEvents((prev) => [...prev, event])
      setVisibleNotifications((prev) => [...prev.slice(-2), event])
      
      lastEventTimeRef.current = Date.now()
      
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
      eventsThisSession: gameEvents.length,
      negativeEventsBlocked: gameEvents.filter((e) => e.title.includes("bloqueando eventos negativos")).length,
      countriesControlled,
    })
  }, [countries, playerCountry, gameEvents])

  // Función para determinar el intervalo de eventos basado en la estabilidad y fase del juego
  const getEventInterval = useCallback(() => {
    // Para los primeros 20 eventos, usar intervalo más rápido para asegurar actividad inicial
    if (gameEvents.length < 20) {
      console.log(`🚀 Fase inicial del juego (${gameEvents.length}/20 eventos): eventos cada 5s`)
      return 5000 // 5 segundos para los primeros 20 eventos
    }
    
    // Verificar si hay zonas desestabilizadas (estabilidad < 30)
    const destabilizedCountries = countries.filter(country => country.stability < 15)
    const hasDestabilizedZones = destabilizedCountries.length > 0
    
    if (hasDestabilizedZones) {
      console.log(`🚨 Zonas desestabilizadas detectadas (${destabilizedCountries.length} países): eventos cada 8s`)
      return 8000 // 8 segundos
    } else {
      console.log("✅ Situación estable: eventos cada 12s")
      return 12000 // 12 segundos
    }
  }, [countries, gameEvents.length])

  // Función para manejar pausas aleatorias
  const scheduleRandomPause = useCallback(() => {
    const now = Date.now()
    const timeSinceLastPause = now - lastPauseTimeRef.current
    
    // Verificar si han pasado 15 minutos desde la última pausa
    if (timeSinceLastPause >= 15 * 60 * 1000) { // 15 minutos
      // Programar una pausa aleatoria en los próximos 2 minutos
      const randomDelay = Math.random() * 2 * 60 * 1000 // 0-2 minutos
      
      pauseTimeoutRef.current = setTimeout(() => {
        console.log("⏸️ Iniciando pausa aleatoria de eventos (1 minuto)")
        isEventsPausedRef.current = true
        lastPauseTimeRef.current = Date.now()
        
        // Crear evento de notificación sobre la pausa
        const pauseEvent: GameEvent = {
          id: `pause_${Date.now()}`,
          type: "info",
          title: "⏸️ Período de Calma Mundial",
          description: "El mundo experimenta un período de relativa calma. Los eventos se han pausado temporalmente.",
          effects: [
            "Pausa temporal de eventos mundiales",
            "Duración: 1 minuto",
            "Oportunidad para planificar estrategias"
          ],
          timestamp: Date.now(),
        }
        
        addEventToQueue(pauseEvent)
        
        // Reanudar eventos después de 1 minuto
        setTimeout(() => {
          console.log("▶️ Reanudando eventos después de la pausa")
          isEventsPausedRef.current = false
          
          const resumeEvent: GameEvent = {
            id: `resume_${Date.now()}`,
            type: "warning",
            title: "▶️ Fin del Período de Calma",
            description: "La calma mundial ha terminado. Los eventos se reanudan con normalidad.",
            effects: [
              "Reanudación de eventos mundiales",
              "La actividad geopolítica se normaliza",
              "Manténganse alerta"
            ],
            timestamp: Date.now(),
          }
          
          addEventToQueue(resumeEvent)
        }, 60000) // 1 minuto de pausa
        
      }, randomDelay)
    }
  }, [])

  // Función principal para generar eventos
  const generateEvent = useCallback(() => {
    // No generar eventos si están pausados
    if (isEventsPausedRef.current) {
      console.log("⏸️ Eventos pausados, saltando generación")
      return
    }

    // --- Lógica de inactividad para IA rival ---
    inactivityTicksRef.current += 1
    // Si el jugador ejecuta una acción, inactivityTicksRef se resetea vía registerPlayerAction
    // Si pasan 3 ciclos de eventos y la estabilidad global es baja, activar IA rival
    if (inactivityTicksRef.current >= 3 && gameStats.globalStability < 20 && playerCountry) {
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

    // --- Verificar invasión del jugador ---
    if (playerCountry && !isGameOver) {
      const playerCountryData = countries.find(c => c.id === playerCountry)
      if (playerCountryData && playerCountryData.stability < 15) {
        // Buscar países que puedan invadir al jugador
        const potentialInvaders = countries.filter(c => 
          c.id !== playerCountry && 
          !c.ownedBy && 
          c.stability > 50 && 
          c.economy.gdp > 800
        )
        
        if (potentialInvaders.length > 0) {
          // Probabilidad de invasión basada en la estabilidad del jugador
          const invasionChance = Math.max(0.1, (15 - playerCountryData.stability) / 100)
          
          if (Math.random() < invasionChance) {
            // Seleccionar el invasor más fuerte
            const invader = potentialInvaders.sort((a, b) => 
              (b.economy.gdp + b.stability) - (a.economy.gdp + a.stability)
            )[0]
            
            setIsGameOver(true)
            setConquerorCountry(invader.name)
            
            const gameOverEvent: GameEvent = {
              id: `game_over_${Date.now()}`,
              type: "error",
              title: `💀 ${invader.name} conquista ${playerCountryData.name}`,
              description: `La baja estabilidad de ${playerCountryData.name} permitió que ${invader.name} invadiera y conquistara el territorio. ¡GAME OVER!`,
              effects: [
                `${playerCountryData.name} ha sido conquistado`,
                `Estabilidad crítica: ${Math.round(playerCountryData.stability)}%`,
                "El gobierno ha colapsado",
                "Las fuerzas enemigas han tomado control"
              ],
              timestamp: Date.now(),
            }
            
            addEventToQueue(gameOverEvent)
            return // No generar más eventos
          }
        }
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

    // Programar la próxima pausa aleatoria si es necesario
    scheduleRandomPause()
  }, [playerCountry, countries, gameEvents, scheduleRandomPause])

  // Sistema de eventos inteligente con intervalos dinámicos
  useEffect(() => {
    if (!playerCountry) return

    console.log(`🎲 Sistema de eventos inteligente iniciado para: ${playerCountry}`)

    const startEventSystem = () => {
      // Limpiar interval anterior si existe
      if (eventIntervalRef.current) {
        clearInterval(eventIntervalRef.current)
      }

      const interval = getEventInterval()
      console.log(`⏰ Configurando intervalo de eventos: ${interval/1000}s`)

      eventIntervalRef.current = setInterval(generateEvent, interval)
    }

    // Iniciar el sistema
    startEventSystem()

    // Reconfigurar el intervalo cuando cambien los países o el número de eventos
    const checkInterval = setInterval(() => {
      const newInterval = getEventInterval()
      
      // Determinar el intervalo actual basado en la lógica
      let currentInterval = 12000 // default
      if (gameEvents.length < 20) {
        currentInterval = 5000
      } else {
        const destabilizedCountries = countries.filter(country => country.stability < 15)
        if (destabilizedCountries.length > 0) {
          currentInterval = 8000
        }
      }

      // Solo reconfigurar si el intervalo ha cambiado
      if (newInterval !== currentInterval) {
        console.log(`🔄 Reconfigurando sistema de eventos: ${currentInterval/1000}s → ${newInterval/1000}s`)
        startEventSystem()
      }
    }, 3000) // Verificar cada 3 segundos para detectar cambios más rápido

    return () => {
      console.log("🛑 Sistema de eventos detenido")
      if (eventIntervalRef.current) {
        clearInterval(eventIntervalRef.current)
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
      clearInterval(checkInterval)
    }
  }, [playerCountry, generateEvent, getEventInterval, gameEvents.length])

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
    }, 45000) // Cada 45 segundos

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

            // Incluir aliados en la retaliación
            const allies = updatedCountries.filter(c => 
              (attackedCountry.alliances || []).includes(c.id) && c.id !== attackedCountry.id
            )

            let allyEffects: string[] = []
            if (allies.length > 0) {
              const randomAlly = allies[Math.floor(Math.random() * allies.length)]
              const allyDamage = Math.floor(economicDamage * 0.3)
              const allyStabilityDamage = Math.floor(stabilityDamage * 0.4)
              
              updatedCountries = updatedCountries.map(c => {
                if (c.id === randomAlly.id) {
                  return {
                    ...c,
                    economy: { ...c.economy, gdp: Math.max(100, c.economy.gdp + allyDamage) },
                    stability: Math.min(100, c.stability + 3),
                  }
                }
                return c
              })
              
              allyEffects = [
                `${randomAlly.name} apoya la retaliación`,
                `PIB de ${randomAlly.name} aumentado en $${allyDamage}B`,
              ]
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
            setVisibleNotifications(prevNotifications => [...prevNotifications, retaliationEvent])

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
    }, 30000) // Cada 30 segundos

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
      events.filter((event) => 
        !event.title.includes("Actualización Económica Global") &&
        !event.description.includes("PIB mundial se ha actualizado") &&
        !event.description.includes("PIB actualizado para todos los países") &&
        !event.effects?.some(effect => 
          effect.includes("PIB actualizado para todos los países") ||
          effect.includes("Crecimiento basado en estabilidad y recursos") ||
          effect.includes("Territorios conquistados generando ingresos") ||
          effect.includes("Relaciones diplomáticas afectando comercio")
        )
      )

    setVisibleNotifications((prev) => filterEconomicEvents(prev))
    setGameEvents((prev) => filterEconomicEvents(prev))
  }, [visibleNotifications.length, gameEvents.length])

  const ownedTerritories = countries.filter((country) => country.ownedBy === playerCountry)

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
    
    // Limpiar intervalos
    if (eventIntervalRef.current) {
      clearInterval(eventIntervalRef.current)
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
    }
    
    isEventsPausedRef.current = false
    lastPauseTimeRef.current = 0
  }, [])

  return {
    countries,
    selectedCountry,
    playerCountry,
    gameEvents, // Cronología completa
    visibleNotifications, // Solo notificaciones
    ownedTerritories, // Territorios conquistados
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
  }
}
