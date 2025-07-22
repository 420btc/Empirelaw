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
  private lastActionTime: Map<string, number> = new Map()
  private readonly ACTION_COOLDOWN = 30000 // 30 segundos entre acciones por país

  /**
   * Evalúa si un país controlado por IA debe tomar acciones proactivas
   */
  async evaluateProactiveActions(
    countries: Country[],
    playerCountryId: string,
    gameEvents: GameEvent[]
  ): Promise<AIProactiveResult> {
    if (!aiDiplomacyService.isAIEnabled()) {
      return { actions: [], events: [], updatedCountries: countries }
    }

    const aiCountries = countries.filter(country => 
      country.id !== playerCountryId && 
      !country.ownedBy &&
      this.shouldTakeAction(country)
    )

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

    return { actions, events, updatedCountries }
  }

  /**
   * Determina si un país debe considerar tomar una acción proactiva
   */
  private shouldTakeAction(country: Country): boolean {
    const lastAction = this.lastActionTime.get(country.id) || 0
    const timeSinceLastAction = Date.now() - lastAction
    
    if (timeSinceLastAction < this.ACTION_COOLDOWN) {
      return false
    }

    // Factores que aumentan la probabilidad de acción
    const stabilityFactor = country.stability < 30 ? 0.3 : 0.1
    const economyFactor = country.economy.gdp < 500 ? 0.2 : 0.05
    const militaryFactor = (country.militaryStrength || 50) > 70 ? 0.2 : 0.05
    
    const actionProbability = stabilityFactor + economyFactor + militaryFactor
    return Math.random() < actionProbability
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
    
    const prompt = `
Como ${country.name}, analiza la situación actual y decide si debes tomar una acción proactiva.

Tu situación:
- PIB: $${country.economy.gdp}B
- Estabilidad: ${country.stability}%
- Fuerza Militar: ${country.militaryStrength || 50}%
- Deuda: ${country.economy.debt}B

Opciones de acción disponibles:
1. military_action - Atacar a otro país (costo: $50B)
2. economic_sanction - Sanciones económicas (costo: $30B)
3. conspiracy - Operación encubierta (costo: $40B)
4. none - No tomar acción

Responde SOLO con un JSON en este formato:
{
  "action": "military_action|economic_sanction|conspiracy|none",
  "target": "country_id_or_null",
  "reasoning": "breve explicación de tu decisión",
  "priority": 1-10
}

Considera:
- Tu situación económica y militar
- Amenazas potenciales
- Oportunidades estratégicas
- Relaciones diplomáticas

${context}`

    try {
      const playerCountry = allCountries.find(c => c.id === playerCountryId)!
      const context = {
        country,
        playerCountry,
        allCountries,
        recentEvents,
        actionHistory: [],
        currentMessage: prompt
      }
      
      const response = await aiDiplomacyService.generateAIResponse(context)

      const actionData = JSON.parse(response.message)
      
      if (actionData.action === 'none') {
        return null
      }

      // Validar que el país tenga recursos suficientes
      const actionCosts = {
        military_action: 50,
        economic_sanction: 30,
        conspiracy: 40
      }

      const cost = actionCosts[actionData.action as keyof typeof actionCosts] || 0
      if (country.economy.gdp < cost) {
        return null
      }

      return {
        countryId: country.id,
        action: {
          type: actionData.action,
          targetCountry: actionData.target,
          cost
        } as GameAction,
        reasoning: actionData.reasoning,
        priority: actionData.priority || 5
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
   * Ejecuta una acción proactiva y genera el evento correspondiente
   */
  private executeProactiveAction(
    proactiveAction: AIProactiveAction,
    countries: Country[],
    playerCountryId: string
  ): { event: GameEvent | null; updatedCountries: Country[] } {
    const sourceCountry = countries.find(c => c.id === proactiveAction.countryId)
    if (!sourceCountry) {
      return { event: null, updatedCountries: countries }
    }

    let updatedCountries = [...countries]
    let event: GameEvent | null = null

    // Deducir costo de la acción
    const sourceIndex = updatedCountries.findIndex(c => c.id === proactiveAction.countryId)
    if (sourceIndex !== -1) {
      updatedCountries[sourceIndex] = {
        ...updatedCountries[sourceIndex],
        economy: {
          ...updatedCountries[sourceIndex].economy,
          gdp: Math.max(0, updatedCountries[sourceIndex].economy.gdp - proactiveAction.action.cost)
        }
      }
    }

    // Generar evento basado en el tipo de acción
    switch (proactiveAction.action.type) {
      case 'military_action':
        event = this.createMilitaryActionEvent(proactiveAction, sourceCountry, countries)
        break
      case 'economic_sanction':
        event = this.createEconomicSanctionEvent(proactiveAction, sourceCountry, countries)
        break
      case 'conspiracy':
        event = this.createConspiracyEvent(proactiveAction, sourceCountry, countries)
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