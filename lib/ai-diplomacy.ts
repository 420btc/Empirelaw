import type { Country, GameEvent, ActionHistory } from "./types"

interface AIResponse {
  message: string
  action?: {
    type: 'military_action' | 'trade_offer' | 'diplomatic_message' | 'economic_sanction' | 'conspiracy'
    target?: string
    details?: any
  }
  relationChange?: number
}

interface AIContext {
  country: Country
  playerCountry: Country
  allCountries: Country[]
  recentEvents: GameEvent[]
  actionHistory: ActionHistory[]
  currentMessage?: string
}

export class AIDiplomacyService {
  private apiKey: string | null = null
  private isEnabled: boolean = false

  constructor() {
    this.loadSettings()
  }

  private loadSettings() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('openai_api_key')
      this.isEnabled = localStorage.getItem('ai_diplomacy_enabled') === 'true'
    }
  }

  public isAIEnabled(): boolean {
    return this.isEnabled && !!this.apiKey
  }

  private buildCountryContext(context: AIContext): string {
    const { country, playerCountry, allCountries, recentEvents, actionHistory } = context
    
    // Información básica del país
    const basicInfo = `
Tú eres el líder de ${country.name}, dirigido por ${country.president}.

Situación actual de tu país:
- PIB: $${country.economy.gdp.toLocaleString()}M
- Estabilidad: ${country.stability}%
- Deuda: ${country.economy.debt}%
- Fuerza Militar: ${country.militaryStrength || 50}/100
- Población: ${country.population.toLocaleString()}
`

    // Recursos disponibles
    const resources = country.economy.resourceReserves
    const resourceInfo = resources ? `
Recursos disponibles:
${Object.entries(resources)
      .filter(([_, amount]) => amount > 0)
      .map(([resource, amount]) => `- ${resource}: ${amount}`)
      .join('\n')}
` : ''

    // Relaciones diplomáticas
    const relations = country.diplomaticRelations || {}
    const relationInfo = `
Relaciones diplomáticas:
${Object.entries(relations)
      .map(([countryName, relation]) => `- ${countryName}: ${relation} (${this.getRelationText(relation)})`)
      .join('\n')}
`

    // Alianzas
    const alliances = country.alliances || []
    const allianceInfo = alliances.length > 0 ? `
Aliados actuales: ${alliances.map(id => {
      const ally = allCountries.find(c => c.id === id)
      return ally ? ally.name : id
    }).join(', ')}
` : '\nNo tienes alianzas actualmente.\n'

    // Eventos recientes que afectan al país
    const relevantEvents = recentEvents
      .filter(event => 
        event.description.includes(country.name) || 
        event.countryEffects?.[country.id]
      )
      .slice(-3)
    
    const eventInfo = relevantEvents.length > 0 ? `
Eventos recientes que te afectan:
${relevantEvents
      .map(event => `- ${event.title}: ${event.description}`)
      .join('\n')}
` : ''

    // Información sobre el jugador
    const playerInfo = `
Información sobre ${playerCountry.name} (el jugador):
- PIB: $${playerCountry.economy.gdp.toLocaleString()}M
- Estabilidad: ${playerCountry.stability}%
- Relación contigo: ${relations[playerCountry.name] || 0} (${this.getRelationText(relations[playerCountry.name] || 0)})
- Territorios controlados: ${allCountries.filter(c => c.ownedBy === playerCountry.id).length}
`

    // Acciones recientes del jugador
    const recentPlayerActions = actionHistory
      .filter(action => action.targetCountryName === country.name || action.targetCountry === 'Global')
      .slice(-3)
    
    const playerActionInfo = recentPlayerActions.length > 0 ? `
Acciones recientes de ${playerCountry.name} que te afectan:
${recentPlayerActions
      .map(action => `- ${action.actionName}: ${action.result || 'Acción ejecutada'}`)
      .join('\n')}
` : ''

    return basicInfo + resourceInfo + relationInfo + allianceInfo + eventInfo + playerInfo + playerActionInfo
  }

  private getRelationText(relation: number): string {
    if (relation > 70) return "Aliado"
    if (relation > 30) return "Amistoso"
    if (relation > 0) return "Neutral+"
    if (relation > -30) return "Neutral-"
    if (relation > -70) return "Hostil"
    return "Enemigo"
  }

  private buildSystemPrompt(): string {
    return `Eres un líder nacional inteligente en un juego de geopolítica. Tu objetivo es proteger y hacer prosperar a tu país.

Comportamiento:
- Actúa de forma realista basándote en la situación de tu país
- Considera tus recursos, economía, estabilidad y relaciones diplomáticas
- Puedes ser amistoso, neutral, hostil o estratégico según la situación
- Toma decisiones que beneficien a tu país a largo plazo
- Puedes proponer alianzas, comercio, o incluso amenazas si es necesario
- Responde en español de forma concisa (máximo 2-3 oraciones)

Puedes tomar las siguientes acciones después de responder:
- military_action: Atacar a otro país
- trade_offer: Proponer intercambio de recursos
- diplomatic_message: Enviar mensaje a otro país
- economic_sanction: Aplicar sanciones económicas
- conspiracy: Intentar desestabilizar a otro país

Responde SOLO con un JSON en este formato:
{
  "message": "Tu respuesta diplomática aquí",
  "action": {
    "type": "tipo_de_accion",
    "target": "nombre_del_pais_objetivo",
    "details": { "cualquier": "detalle_adicional" }
  },
  "relationChange": 5
}

Si no quieres tomar ninguna acción, omite el campo "action".`
  }

  public async generateAIResponse(context: AIContext): Promise<AIResponse> {
    console.log('🤖 generateAIResponse llamado', {
      isEnabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0
    })
    
    if (!this.isAIEnabled()) {
      console.error('❌ IA no está habilitada o configurada', {
        isEnabled: this.isEnabled,
        hasApiKey: !!this.apiKey
      })
      throw new Error('IA no está habilitada o configurada')
    }

    const systemPrompt = this.buildSystemPrompt()
    const countryContext = this.buildCountryContext(context)
    const userMessage = context.currentMessage ? `
Mensaje recibido: "${context.currentMessage}"` : '\nGenera una acción diplomática proactiva basada en tu situación actual.'

    console.log('🚀 Enviando petición a OpenAI...', {
      model: 'gpt-4o-mini',
      messageLength: (countryContext + userMessage).length
    })

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: countryContext + userMessage }
          ],
          temperature: 0.8,
          max_tokens: 999
        })
      })

      console.log('📡 Respuesta de OpenAI recibida', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error de API OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Error de API: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Datos de OpenAI:', {
        choices: data.choices?.length || 0,
        usage: data.usage,
        model: data.model
      })
      
      const aiResponse = data.choices[0]?.message?.content

      if (!aiResponse) {
        console.error('❌ Respuesta vacía de la API:', data)
        throw new Error('Respuesta vacía de la API')
      }
      
      console.log('🎯 Respuesta de IA generada:', {
        responseLength: aiResponse.length,
        preview: aiResponse.substring(0, 100) + '...'
      })

      // Intentar parsear como JSON
      try {
        const parsedResponse = JSON.parse(aiResponse)
        return {
          message: parsedResponse.message || 'Respuesta diplomática generada',
          action: parsedResponse.action,
          relationChange: parsedResponse.relationChange || 0
        }
      } catch (parseError) {
        // Si no es JSON válido, usar como mensaje simple
        return {
          message: aiResponse,
          relationChange: 0
        }
      }
    } catch (error) {
      console.error('Error en AI Diplomacy:', error)
      throw error
    }
  }

  public async generateProactiveAction(context: Omit<AIContext, 'currentMessage'>): Promise<AIResponse | null> {
    if (!this.isAIEnabled()) {
      return null
    }

    // Solo generar acciones proactivas ocasionalmente
    if (Math.random() > 0.3) {
      return null
    }

    try {
      return await this.generateAIResponse({ ...context, currentMessage: undefined })
    } catch (error) {
      console.error('Error generando acción proactiva:', error)
      return null
    }
  }

  public updateSettings() {
    this.loadSettings()
  }
}

// Instancia singleton
export const aiDiplomacyService = new AIDiplomacyService()