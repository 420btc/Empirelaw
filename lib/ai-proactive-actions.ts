import type { Country, GameEvent, GameAction } from "@/lib/types"
import { aiDiplomacyService } from "./ai-diplomacy"

export interface AIProactiveAction {
  countryId: string
  action: GameAction
  reasoning: string
  priority: number
}

export interface AIProactiveResult {
  actions: AIProactiveAction[]
  events: GameEvent[]
  updatedCountries: Country[]
}

class AIProactiveActionsService {
  private lastActionTime: Map<string, number> = new Map() // Configuración de frecuencia de acciones
  private readonly ACTION_COOLDOWN = 180000 // 3 minutos entre acciones por país (antes 2 min)
  private readonly MAX_ACTIVE_AI_COUNTRIES = 3 // Máximo número de países IA activos simultáneamente
  private activeAICountries: Set<string> = new Set()
  private lastAIRotation = 0
  private readonly AI_ROTATION_INTERVAL = 90000 // Rotar países activos cada 90s (antes 60s)

  /**
   * Evalúa si un país controlado por IA debe tomar acciones proactivas
   */
  async evaluateProactiveActions(
    countries: Country[],
    playerCountryId: string,
    gameEvents: GameEvent[]
  ): Promise<AIProactiveResult> {
    if (!aiDiplomacyService.isAIEnabled()) {
      console.log('🤖 IA no está habilitada. Para ver eventos de IA:')
      console.log('   1. Haz clic en "IA Config" en la barra superior')
      console.log('   2. Ingresa tu API key de OpenAI')
      console.log('   3. Activa la opción "Habilitar IA"')
      return { actions: [], events: [], updatedCountries: countries }
    }

    // Rotar países IA activos cada 60 segundos
    this.rotateActiveAICountries(countries, playerCountryId)

    // Solo procesar países IA activos que pueden tomar acciones
    const aiCountries = countries.filter(country =>
      country.id !== playerCountryId &&
      !country.ownedBy &&
      this.activeAICountries.has(country.id) &&
      this.shouldTakeAction(country)
    )

    console.log(`🤖 Países IA activos: ${Array.from(this.activeAICountries).join(', ')}`)
    console.log(`🤖 Países IA que pueden actuar: ${aiCountries.map(c => c.name).join(', ')}`)

    const actions: AIProactiveAction[] = []
    const events: GameEvent[] = []
    let updatedCountries = [...countries]

    for (const country of aiCountries) {
      try {
        const proactiveAction = await this.generateProactiveAction(
          country,
          countries,
          playerCountryId,
          gameEvents
        )

        if (proactiveAction) {
          actions.push(proactiveAction)

          // Ejecutar la acción y generar evento
          const actionResult = this.executeProactiveAction(
            proactiveAction,
            updatedCountries,
            playerCountryId
          )

          if (actionResult.event) {
            events.push(actionResult.event)
          }

          updatedCountries = actionResult.updatedCountries
          this.lastActionTime.set(country.id, Date.now())
        }
      } catch (error) {
        console.error(`Error generando acción proactiva para ${country.name}:`, error)
      }
    }

    console.log(`🤖 Resultado: ${actions.length} acciones generadas, ${events.length} eventos creados`)

    return { actions, events, updatedCountries }
  }

  /**
   * Determina si un país debe considerar tomar una acción proactiva
   */
  /**
   * Rota los países IA activos cada 30 segundos para simular un comportamiento más realista
   * Solo selecciona países con PIB mayor al del jugador para aumentar la dificultad
   */
  private rotateActiveAICountries(countries: Country[], playerCountryId: string): void {
    const now = Date.now()

    // Solo rotar si han pasado 30 segundos desde la última rotación
    if (now - this.lastAIRotation < this.AI_ROTATION_INTERVAL) {
      return
    }

    this.lastAIRotation = now

    // Obtener el PIB del jugador
    const playerCountry = countries.find(c => c.id === playerCountryId)
    const playerGDP = playerCountry?.economy.gdp || 0

    // Obtener países IA disponibles con PIB mayor al del jugador
    const availableAICountries = countries.filter(country =>
      country.id !== playerCountryId &&
      !country.ownedBy &&
      country.economy.gdp > playerGDP
    )

    // Si no hay países con PIB mayor, usar los 3 países con mayor PIB disponibles
    if (availableAICountries.length === 0) {
      const fallbackCountries = countries
        .filter(country => country.id !== playerCountryId && !country.ownedBy)
        .sort((a, b) => b.economy.gdp - a.economy.gdp)
        .slice(0, this.MAX_ACTIVE_AI_COUNTRIES)

      this.activeAICountries = new Set(fallbackCountries.map(c => c.id))
      console.log(`🔄 Países IA activos (fallback - mayor PIB): ${Array.from(this.activeAICountries).join(', ')}`)
      return
    }

    // Si hay menos países disponibles que el máximo, usar todos
    if (availableAICountries.length <= this.MAX_ACTIVE_AI_COUNTRIES) {
      this.activeAICountries = new Set(availableAICountries.map(c => c.id))
      console.log(`🔄 Países IA activos (PIB > jugador): ${Array.from(this.activeAICountries).join(', ')}`)
      return
    }

    // Seleccionar aleatoriamente países IA activos con PIB mayor al jugador
    const shuffled = [...availableAICountries].sort(() => Math.random() - 0.5)
    this.activeAICountries = new Set(
      shuffled.slice(0, this.MAX_ACTIVE_AI_COUNTRIES).map(c => c.id)
    )

    console.log(`🔄 Países IA activos (PIB > jugador): ${Array.from(this.activeAICountries).join(', ')}`)
  }

  private shouldTakeAction(country: Country): boolean {
    const lastAction = this.lastActionTime.get(country.id) || 0
    const timeSinceLastAction = Date.now() - lastAction

    if (timeSinceLastAction < this.ACTION_COOLDOWN) {
      return false
    }

    // IA toma acciones pero con intervalos más largos (1 minuto)
    return true
  }

  /**
   * Genera una acción proactiva usando IA
   */
  private async generateProactiveAction(
    country: Country,
    allCountries: Country[],
    playerCountryId: string,
    recentEvents: GameEvent[]
  ): Promise<AIProactiveAction | null> {
    const context = this.buildActionContext(country, allCountries, playerCountryId, recentEvents)

    const playerCountry = allCountries.find(c => c.id === playerCountryId)
    const playerGDP = playerCountry?.economy.gdp || 0

    const prompt = `
Como ${country.name}, eres una POTENCIA GLOBAL con inmensa influencia. Tu PIB de $${country.economy.gdp}B te da apalancamiento tanto económico como diplomático.

🏆 TU SITUACIÓN:
- PIB: $${country.economy.gdp}B
- Estabilidad: ${country.stability}%
- Fuerza Militar: ${country.militaryStrength || 50}%

TU ESTRATEGIA ACTUAL (${context.includes("CRISIS GLOBAL") ? "CRISIS MUNDIAL" : "NORMALIDAD"}):
- Si hay CAOS o eres débil: Busca ALIADOS ('diplomatic_alliance'), mejora relaciones ('improve_relations') o pide paz. La supervivencia es prioridad.
- Si eres FUERTE y ESTABLE: Expande tu influencia. Usa 'economic_sanction' en rivales, o 'military_action' si eres muy superior.
- Si tienes aliados: Apóyalos con 'trade_agreement' o evita conflictos innecesarios.

Opciones de acción:
1. diplomatic_alliance - Formar alianza estratégica (Solo con países con relaciones > 50).
2. improve_relations - Enviar delegación para mejorar relaciones (+20 rel).
3. trade_agreement - Pacto comercial (Beneficio mutuo PIB).
4. military_action - Ataque directo (Costo alto, agresivo).
5. economic_sanction - Sanción económica (Daña economía rival).
6. conspiracy - Operación encubierta.

Responde SOLO con un JSON:
{
  "action": "diplomatic_alliance|improve_relations|trade_agreement|military_action|economic_sanction|conspiracy",
  "target": "country_id",
  "reasoning": "explicación estratégica breve (ej: 'Necesitamos aliados ante la crisis' o 'Expandir dominio')",
  "priority": 1-10
}

Recuerda: NO seas agresivo sin razón. La diplomacia es una herramienta de poder válida.
${context}`

    try {
      // Validar que playerCountry existe
      if (!playerCountry) {
        console.error('Player country not found, cannot generate AI action')
        return null
      }

      const aiContext = {
        country,
        playerCountry,
        allCountries,
        recentEvents,
        actionHistory: [],
        currentMessage: prompt
      }

      const response = await aiDiplomacyService.generateAIResponse(aiContext)

      const actionData = JSON.parse(response.message)

      // Si por alguna razón la IA devuelve 'none', forzar una acción aleatoria
      if (actionData.action === 'none' || !actionData.action) {
        const actions = ['military_action', 'economic_sanction', 'conspiracy']
        actionData.action = actions[Math.floor(Math.random() * actions.length)]
        actionData.reasoning = 'Acción forzada por sistema agresivo'
        actionData.priority = 9
      }

      // Validar que el país tenga recursos suficientes
      const actionCosts = {
        military_action: 50,
        economic_sanction: 30,
        conspiracy: 40
      }

      const cost = actionCosts[actionData.action as keyof typeof actionCosts] || 0

      // Si no tiene recursos suficientes, elegir una acción más barata
      if (country.economy.gdp < cost) {
        if (country.economy.gdp >= 30) {
          actionData.action = 'economic_sanction'
          actionData.reasoning = 'Acción económica por recursos limitados'
        } else {
          actionData.action = 'conspiracy'
          actionData.reasoning = 'Operación encubierta por recursos muy limitados'
        }
      }

      // Asegurar que siempre hay un target válido
      if (!actionData.target) {
        const possibleTargets = allCountries.filter(c => c.id !== country.id && c.id !== playerCountryId)
        if (possibleTargets.length > 0) {
          actionData.target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)].id
        }
      }

      return {
        countryId: country.id,
        action: {
          type: actionData.action,
          targetCountry: actionData.target,
          cost: actionCosts[actionData.action as keyof typeof actionCosts] || 30
        } as GameAction,
        reasoning: actionData.reasoning || 'Acción agresiva automática',
        priority: Math.max(actionData.priority || 9, 9) // Mínimo prioridad 9 para superpotencias
      }
    } catch (error) {
      console.error('Error parsing AI action response:', error)
      return null
    }
  }

  /**
   * Construye el contexto para la toma de decisiones de IA
   */
  private buildActionContext(
    country: Country,
    allCountries: Country[],
    playerCountryId: string,
    recentEvents: GameEvent[]
  ): string {
    const playerCountry = allCountries.find(c => c.id === playerCountryId)
    const neighbors = allCountries.filter(c =>
      c.id !== country.id &&
      !c.ownedBy &&
      Math.abs(c.economy.gdp - country.economy.gdp) < 300
    )

    const recentEventsSummary = recentEvents
      .slice(-3)
      .map(e => `- ${e.title}: ${e.description}`)
      .join('\n')

    return `
Contexto mundial:
- Jugador (${playerCountry?.name}): PIB $${playerCountry?.economy.gdp}B, Estabilidad ${playerCountry?.stability}%
- Países vecinos relevantes: ${neighbors.map(c => `${c.name} (PIB: $${c.economy.gdp}B)`).join(', ')}

Eventos recientes:
${recentEventsSummary}

Relaciones diplomáticas:
${Object.entries(country.diplomaticRelations || {})
        .map(([id, relation]) => {
          const targetCountry = allCountries.find(c => c.id === id)
          return `- ${targetCountry?.name}: ${relation}%`
        })
        .join('\n')}`
  }

  /**
   * Ejecuta la acción y devuelve el estado actualizado y el evento generado
   */
  private executeProactiveAction(
    actionData: AIProactiveAction,
    countries: Country[],
    playerCountryId: string
  ): { updatedCountries: Country[]; event: GameEvent | null } {
    const { countryId, action } = actionData
    let updatedCountries = [...countries]
    const sourceCountry = updatedCountries.find(c => c.id === countryId)
    const targetCountry = updatedCountries.find(c => c.id === action.targetCountry)

    if (!sourceCountry || !targetCountry) {
      return { updatedCountries, event: null }
    }

    const timestamp = Date.now()
    const id = `${action.type}_${timestamp}_${Math.random().toString(36).substring(7)}`

    // Función auxiliar para actualizar relaciones
    const updateRelations = (c1: string, c2: string, amount: number) => {
      updatedCountries = updatedCountries.map(c => {
        if (c.id === c1) {
          const rels = c.diplomaticRelations || {}
          return { ...c, diplomaticRelations: { ...rels, [c2]: Math.min(100, Math.max(0, (rels[c2] || 50) + amount)) } }
        }
        if (c.id === c2) {
          const rels = c.diplomaticRelations || {}
          return { ...c, diplomaticRelations: { ...rels, [c1]: Math.min(100, Math.max(0, (rels[c1] || 50) + amount)) } }
        }
        return c
      })
    }

    let event: GameEvent | null = null

    // Deducir costo de la acción para el país de origen
    const sourceIndex = updatedCountries.findIndex(c => c.id === countryId)
    if (sourceIndex !== -1) {
      updatedCountries[sourceIndex] = {
        ...updatedCountries[sourceIndex],
        economy: {
          ...updatedCountries[sourceIndex].economy,
          gdp: Math.max(0, updatedCountries[sourceIndex].economy.gdp - action.cost)
        }
      }
    }

    // Ejecutar lógica específica por tipo de acción
    // ... logic continues ...

    // Generar evento basado en el tipo de acción
    switch (action.type) {
      case 'military_action':
        event = this.createMilitaryActionEvent(actionData, sourceCountry, countries)
        break
      case 'economic_sanction':
        event = this.createEconomicSanctionEvent(actionData, sourceCountry, countries)
        break
      case 'conspiracy':
        event = this.createConspiracyEvent(actionData, sourceCountry, countries)
        break
    }

    return { event, updatedCountries }
  }

  private createMilitaryActionEvent(
    action: AIProactiveAction,
    sourceCountry: Country,
    countries: Country[]
  ): GameEvent {
    const targetCountry = countries.find(c => c.id === action.action.targetCountry)

    return {
      id: `ai_military_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'warning',
      title: `⚔️ ${sourceCountry.name} lanza ataque militar`,
      description: `${sourceCountry.name} ha decidido tomar acción militar contra ${targetCountry?.name || 'un país vecino'}. Razón: ${action.reasoning}`,
      effects: [
        `${sourceCountry.name} gasta $${action.action.cost}B en la operación`,
        `Tensiones militares en la región`,
        `Impacto en la estabilidad regional`
      ],
      timestamp: Date.now(),
      countryEffects: {
        [action.countryId]: {
          stabilityChange: -5,
          economyChange: -action.action.cost
        },
        ...(targetCountry && {
          [targetCountry.id]: {
            stabilityChange: -15,
            economyChange: -20
          }
        })
      }
    }
  }

  private createEconomicSanctionEvent(
    action: AIProactiveAction,
    sourceCountry: Country,
    countries: Country[]
  ): GameEvent {
    const targetCountry = countries.find(c => c.id === action.action.targetCountry)

    return {
      id: `ai_sanction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'info',
      title: `💼 ${sourceCountry.name} impone sanciones económicas`,
      description: `${sourceCountry.name} ha implementado sanciones económicas contra ${targetCountry?.name || 'varios países'}. Razón: ${action.reasoning}`,
      effects: [
        `${sourceCountry.name} invierte $${action.action.cost}B en sanciones`,
        `Restricciones comerciales implementadas`,
        `Impacto en las relaciones diplomáticas`
      ],
      timestamp: Date.now(),
      countryEffects: {
        [action.countryId]: {
          economyChange: -action.action.cost
        },
        ...(targetCountry && {
          [targetCountry.id]: {
            economyChange: -25,
            stabilityChange: -5
          }
        })
      }
    }
  }

  private createConspiracyEvent(
    action: AIProactiveAction,
    sourceCountry: Country,
    countries: Country[]
  ): GameEvent {
    const targetCountry = countries.find(c => c.id === action.action.targetCountry)

    return {
      id: `ai_conspiracy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'error',
      title: `🕵️ Operación encubierta de ${sourceCountry.name}`,
      description: `${sourceCountry.name} ha ejecutado una operación de inteligencia encubierta. Razón: ${action.reasoning}`,
      effects: [
        `${sourceCountry.name} gasta $${action.action.cost}B en operaciones secretas`,
        `Actividades de espionaje detectadas`,
        `Desestabilización política en la región`
      ],
      timestamp: Date.now(),
      countryEffects: {
        [action.countryId]: {
          economyChange: -action.action.cost,
          stabilityChange: -2
        },
        ...(targetCountry && {
          [targetCountry.id]: {
            stabilityChange: -10,
            economyChange: -15
          }
        })
      }
    }
  }
}

export const aiProactiveActionsService = new AIProactiveActionsService()