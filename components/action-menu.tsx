"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Country, GameAction } from "@/lib/types"
import {
  DollarSign,
  Users,
  Zap,
  Eye,
  Scale,
  Cloud,
  Sword,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  Shield,
  Truck,
  Radio,
  Cpu,
  Briefcase,
  Target,
  MessageSquare,
  Gift,
  Bomb,
  Factory,
  Satellite,
  Microscope,
  Wrench,
  Crown,
} from "lucide-react"

interface ActionMenuProps {
  playerCountry: Country
  targetCountry: Country | null
  onExecuteAction: (action: GameAction) => void
  ownedTerritories?: Country[] // Nuevos territorios conquistados
}

export function ActionMenu({ playerCountry, targetCountry, onExecuteAction, ownedTerritories = [] }: ActionMenuProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null)

  const getActionCost = (actionType: string): number => {
    const baseCosts: Record<string, number> = {
      // Acciones Internas
      economic_investment: 1000,
      social_policy: 500,
      legal_system_change: 800,
      military_buildup: 1200,
      infrastructure_development: 1500,
      education_reform: 600,
      healthcare_expansion: 700,
      propaganda_campaign: 400,

      // Acciones Externas - Diplomacia
      diplomatic_alliance: 300,
      trade_agreement: 500,
      diplomatic_message: 100,
      peace_treaty: 200,

      // Acciones Externas - Económicas
      economic_sanction: 200,
      trade_embargo: 400,
      resource_extraction: 800,
      economic_aid: 600,

      // Acciones Externas - Militares
      military_action: 3000,
      naval_blockade: 1500,
      cyber_attack: 1000,
      espionage: 800,

      // Acciones Externas - Conspirativas
      geoengineering: 2000,
      masonic_influence: 1500,
      media_manipulation: 600,
      regime_change: 2500,

      // Acciones Externas - Tecnológicas
      technology_theft: 1200,
      satellite_surveillance: 900,
      biological_warfare: 3500,

      // Conquista Especial
      special_conquest: 5000, // Base cost, real cost calculated dynamically
      
      // Sistema de Deuda Internacional
      debt_emission: 0, // No cost to emit debt, generates money instead
    }
    
    const baseCost = baseCosts[actionType] || 1000
    
    // Sistema de costos escalados para acciones militares y de conquista
    const militaryActions = ['military_action', 'special_conquest', 'naval_blockade', 'regime_change', 'biological_warfare']
    
    if (militaryActions.includes(actionType)) {
      // Calcular multiplicador basado en el PIB del país atacante
      const playerGDP = playerCountry.economy.gdp
      let costMultiplier = 1
      
      // Top 10 países más poderosos tienen costos escalados
      if (playerGDP >= 20000) { // Superpotencias (USA, China)
        costMultiplier = 8.0
      } else if (playerGDP >= 15000) { // Potencias mayores (Alemania, Japón, Reino Unido)
        costMultiplier = 6.0
      } else if (playerGDP >= 10000) { // Potencias regionales (Francia, India, Italia)
        costMultiplier = 4.5
      } else if (playerGDP >= 5000) { // Potencias medianas (Brasil, Canadá, Rusia)
        costMultiplier = 3.0
      } else if (playerGDP >= 2000) { // Países desarrollados
        costMultiplier = 2.0
      } else if (playerGDP >= 1000) { // Países en desarrollo
        costMultiplier = 1.5
      }
      // Países pobres (PIB < 1000) mantienen costo base (multiplicador = 1)
      
      return Math.round(baseCost * costMultiplier)
    }
    
    return baseCost
  }

  const canAffordAction = (actionType: string): boolean => {
    if (actionType === "special_conquest" && targetCountry) {
      const scaledCost = getActionCost(actionType)
      const realCost = Math.max(scaledCost, targetCountry.economy.gdp * 0.8)
      const maxAffordable = playerCountry.economy.gdp + (playerCountry.economy.gdp * (200 - playerCountry.economy.debt)) / 100
      return maxAffordable >= realCost
    }
    if (actionType === "debt_emission") {
      return canEmitDebt()
    }
    const actionCost = getActionCost(actionType)
    const maxAffordable = playerCountry.economy.gdp + (playerCountry.economy.gdp * (200 - playerCountry.economy.debt)) / 100
    return maxAffordable >= actionCost
  }

  const canEmitDebt = (): boolean => {
    // Solo Estados Unidos e Israel pueden emitir deuda internacional
    if (playerCountry.id !== "usa" && playerCountry.id !== "israel") {
      return false
    }

    // Verificar cooldown de 3 horas
    const cooldownTime = 3 * 60 * 60 * 1000 // 3 horas en milisegundos
    const currentTime = Date.now()
    const lastEmission = playerCountry.lastDebtEmission || 0
    const timeRemaining = cooldownTime - (currentTime - lastEmission)

    return timeRemaining <= 0
  }

  const getDebtEmissionAmount = (): number => {
    // Estados Unidos puede emitir más deuda que Israel
    if (playerCountry.id === "usa") {
      return Math.round(playerCountry.economy.gdp * 0.3) // 30% del PIB
    } else if (playerCountry.id === "israel") {
      return Math.round(playerCountry.economy.gdp * 0.2) // 20% del PIB
    }
    return 0
  }

  const getDebtEmissionCooldown = (): string => {
    if (playerCountry.id !== "usa" && playerCountry.id !== "israel") {
      return "No disponible"
    }

    const cooldownTime = 3 * 60 * 60 * 1000 // 3 horas en milisegundos
    const currentTime = Date.now()
    const lastEmission = playerCountry.lastDebtEmission || 0
    const timeRemaining = cooldownTime - (currentTime - lastEmission)

    if (timeRemaining <= 0) {
      return "Disponible"
    }

    const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000))
    const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m`
    } else {
      return `${minutesRemaining}m`
    }
  }

  const isNeighbor = (countryId: string): boolean => {
    // Verificar si es vecino del país principal
    if (playerCountry.neighbors?.includes(countryId)) {
      return true
    }
    
    // Verificar si es vecino de algún territorio conquistado
    for (const territory of ownedTerritories) {
      if (territory.neighbors?.includes(countryId)) {
        return true
      }
    }
    
    return false
  }

  const canConquer = (country: Country | null): boolean => {
    return country !== null && country.stability <= 20 && !country.ownedBy && !country.isSovereign
  }

  const getConquestCost = (country: Country): number => {
    const scaledBaseCost = getActionCost("special_conquest") // Ya incluye el escalado por PIB del atacante
    const baseCost = Math.max(scaledBaseCost, country.economy.gdp * 0.8)
    
    // Si no es vecino, multiplicar el costo por 3-5 veces dependiendo de la distancia/poder
    if (!isNeighbor(country.id)) {
      let multiplier = 3.5 // Base para conquista a distancia
      
      // Aumentar costo si es una superpotencia o potencia mayor
      if (country.powerLevel === "superpower") multiplier = 6
      else if (country.powerLevel === "major") multiplier = 4.5
      
      // Reducir algo el costo si el país está muy desestabilizado
      if (country.stability <= 5) multiplier *= 0.8
      
      return Math.round(baseCost * multiplier)
    }
    
    return baseCost
  }

  // Acciones internas (ahora incluye territorios conquistados)
  const allTerritories = [playerCountry, ...ownedTerritories]

  const internalActions = [
    {
      id: "economic_investment",
      name: "Inversión Económica",
      description: "Invertir en infraestructura para mejorar el PIB",
      icon: TrendingUp,
      cost: getActionCost("economic_investment"),
      risk: "Bajo",
    },
    {
      id: "social_policy",
      name: "Política Social",
      description: "Implementar políticas para mejorar la satisfacción",
      icon: Users,
      cost: getActionCost("social_policy"),
      risk: "Bajo",
    },
    {
      id: "legal_system_change",
      name: "Reforma Legal",
      description: "Cambiar entre ley natural y positiva",
      icon: Scale,
      cost: getActionCost("legal_system_change"),
      risk: "Medio",
    },
    {
      id: "military_buildup",
      name: "Fortalecimiento Militar",
      description: "Aumentar la fuerza militar del país",
      icon: Shield,
      cost: getActionCost("military_buildup"),
      risk: "Bajo",
    },
    {
      id: "infrastructure_development",
      name: "Desarrollo de Infraestructura",
      description: "Construir carreteras, puertos y aeropuertos",
      icon: Wrench,
      cost: getActionCost("infrastructure_development"),
      risk: "Bajo",
    },
    {
      id: "education_reform",
      name: "Reforma Educativa",
      description: "Mejorar el sistema educativo nacional",
      icon: Microscope,
      cost: getActionCost("education_reform"),
      risk: "Bajo",
    },
    {
      id: "propaganda_campaign",
      name: "Campaña de Propaganda",
      description: "Influir en la opinión pública nacional",
      icon: Radio,
      cost: getActionCost("propaganda_campaign"),
      risk: "Medio",
    },
  ]

  // Agregar emisión de deuda solo para países elegibles
  const debtEmissionActions = (playerCountry.id === "usa" || playerCountry.id === "israel") ? [
    {
      id: "debt_emission",
      name: "💰 Deuda Internacional",
      description: canEmitDebt() 
        ? `Emitir deuda para obtener +$${getDebtEmissionAmount()}B`
        : `En cooldown: ${getDebtEmissionCooldown()}`,
      icon: DollarSign,
      cost: 0, // No cost, generates money
      risk: "Medio",
      isSpecial: true,
      generates: canEmitDebt() ? getDebtEmissionAmount() : 0,
      disabled: !canEmitDebt(),
    }
  ] : []

  // Combinar acciones internas con emisión de deuda si está disponible
  const allInternalActions = [...internalActions, ...debtEmissionActions]

  const diplomaticActions = targetCountry
    ? [
        {
          id: "diplomatic_alliance",
          name: "Propuesta de Alianza",
          description: `Proponer alianza estratégica con ${targetCountry.name}`,
          icon: UserPlus,
          cost: getActionCost("diplomatic_alliance"),
          risk: "Bajo",
          requiresNeighbor: false,
        },
        {
          id: "trade_agreement",
          name: "Acuerdo Comercial",
          description: `Establecer comercio preferencial con ${targetCountry.name}`,
          icon: Truck,
          cost: getActionCost("trade_agreement"),
          risk: "Bajo",
          requiresNeighbor: true,
        },
        {
          id: "diplomatic_message",
          name: "Mensaje Diplomático",
          description: `Enviar comunicación oficial a ${targetCountry.name}`,
          icon: MessageSquare,
          cost: getActionCost("diplomatic_message"),
          risk: "Bajo",
          requiresNeighbor: false,
        },
        {
          id: "economic_aid",
          name: "Ayuda Económica",
          description: `Proporcionar asistencia económica a ${targetCountry.name}`,
          icon: Gift,
          cost: getActionCost("economic_aid"),
          risk: "Bajo",
          requiresNeighbor: false,
        },
      ]
    : []

  const militaryActions = targetCountry
    ? [
        {
          id: "military_action",
          name: "Invasión Militar",
          description: `Invasión directa de ${targetCountry.name}`,
          icon: Sword,
          cost: getActionCost("military_action"),
          risk: "Muy Alto",
          requiresNeighbor: true,
        },
        {
          id: "naval_blockade",
          name: "Bloqueo Naval",
          description: `Bloquear puertos de ${targetCountry.name}`,
          icon: Shield,
          cost: getActionCost("naval_blockade"),
          risk: "Alto",
          requiresNeighbor: false,
        },
        {
          id: "cyber_attack",
          name: "Ciberataque",
          description: `Atacar infraestructura digital de ${targetCountry.name}`,
          icon: Cpu,
          cost: getActionCost("cyber_attack"),
          risk: "Alto",
          requiresNeighbor: false,
        },
        {
          id: "espionage",
          name: "Operación de Espionaje",
          description: `Infiltrar agentes en ${targetCountry.name}`,
          icon: Eye,
          cost: getActionCost("espionage"),
          risk: "Alto",
          requiresNeighbor: false,
        },
      ]
    : []

  // Acción especial de conquista dorada
  const specialConquestAction =
    targetCountry && canConquer(targetCountry)
      ? {
          id: "special_conquest",
          name: isNeighbor(targetCountry.id) ? "🏆 Conquista Imperial" : "🚀 Conquista a Distancia",
          description: isNeighbor(targetCountry.id) 
            ? `Conquistar ${targetCountry.name} aprovechando su colapso total`
            : `Conquistar ${targetCountry.name} a distancia con operación masiva (COSTO EXTREMO)`,
          icon: Crown,
          cost: getConquestCost(targetCountry),
          risk: "Extremo",
          requiresNeighbor: false,
          isSpecial: true,
          isDistant: !isNeighbor(targetCountry.id),
        }
      : null

  const economicActions = targetCountry
    ? [
        {
          id: "economic_sanction",
          name: "Sanciones Económicas",
          description: `Imponer sanciones a ${targetCountry.name}`,
          icon: DollarSign,
          cost: getActionCost("economic_sanction"),
          risk: "Medio",
          requiresNeighbor: false,
        },
        {
          id: "trade_embargo",
          name: "Embargo Comercial",
          description: `Prohibir comercio con ${targetCountry.name}`,
          icon: Briefcase,
          cost: getActionCost("trade_embargo"),
          risk: "Alto",
          requiresNeighbor: false,
        },
        {
          id: "resource_extraction",
          name: "Extracción de Recursos",
          description: `Negociar acceso a recursos de ${targetCountry.name}`,
          icon: Factory,
          cost: getActionCost("resource_extraction"),
          risk: "Medio",
          requiresNeighbor: true,
        },
      ]
    : []

  const conspiracyActions = targetCountry
    ? [
        {
          id: "geoengineering",
          name: "Geoingeniería",
          description: `Manipular el clima en ${targetCountry.name}`,
          icon: Cloud,
          cost: getActionCost("geoengineering"),
          risk: "Muy Alto",
          requiresNeighbor: false,
        },
        {
          id: "masonic_influence",
          name: "Influencia Masónica",
          description: `Sobornar líderes en ${targetCountry.name}`,
          icon: Crown,
          cost: getActionCost("masonic_influence"),
          risk: "Alto",
          requiresNeighbor: false,
        },
        {
          id: "media_manipulation",
          name: "Manipulación Mediática",
          description: `Influir en medios de ${targetCountry.name}`,
          icon: Radio,
          cost: getActionCost("media_manipulation"),
          risk: "Medio",
          requiresNeighbor: false,
        },
        {
          id: "regime_change",
          name: "Cambio de Régimen",
          description: `Orquestar golpe de estado en ${targetCountry.name}`,
          icon: Target,
          cost: getActionCost("regime_change"),
          risk: "Muy Alto",
          requiresNeighbor: false,
        },
        {
          id: "technology_theft",
          name: "Robo de Tecnología",
          description: `Robar secretos tecnológicos de ${targetCountry.name}`,
          icon: Satellite,
          cost: getActionCost("technology_theft"),
          risk: "Alto",
          requiresNeighbor: false,
        },
        {
          id: "biological_warfare",
          name: "Guerra Biológica",
          description: `Desplegar armas biológicas en ${targetCountry.name}`,
          icon: Bomb,
          cost: getActionCost("biological_warfare"),
          risk: "Extremo",
          requiresNeighbor: false,
        },
        {
          id: "financial_infiltration",
          name: "Infiltración Financiera",
          description: `Infiltrar el sistema bancario de ${targetCountry.name}`,
          icon: DollarSign,
          cost: getActionCost("financial_infiltration"),
          risk: "Bajo",
          requiresNeighbor: false,
        },
        {
          id: "deep_state_operation",
          name: "Operación Estado Profundo",
          description: `Activar células durmientes en ${targetCountry.name}`,
          icon: Eye,
          cost: getActionCost("deep_state_operation"),
          risk: "Muy Alto",
          requiresNeighbor: false,
        },
        {
          id: "social_engineering",
          name: "Ingeniería Social",
          description: `Manipular opinión pública en ${targetCountry.name}`,
          icon: Users,
          cost: getActionCost("social_engineering"),
          risk: "Medio",
          requiresNeighbor: false,
        },
        {
          id: "quantum_disruption",
          name: "Disrupción Cuántica",
          description: `Sabotear infraestructura cuántica de ${targetCountry.name}`,
          icon: Zap,
          cost: getActionCost("quantum_disruption"),
          risk: "Alto",
          requiresNeighbor: false,
        },
        {
          id: "psychological_warfare",
          name: "Guerra Psicológica",
          description: `Operaciones psicológicas masivas en ${targetCountry.name}`,
          icon: Microscope,
          cost: getActionCost("psychological_warfare"),
          risk: "Extremo",
          requiresNeighbor: false,
        },
      ]
    : []

  const executeAction = (actionId: string) => {
    const targetId = selectedTerritory || playerCountry.id
    const action: GameAction = {
      id: Date.now().toString(),
      type: actionId,
      sourceCountry: playerCountry.id,
      targetCountry:
        actionId.startsWith("economic_investment") ||
        actionId.startsWith("social_policy") ||
        actionId.startsWith("military_buildup") ||
        actionId.startsWith("legal_system_change") ||
        actionId.startsWith("infrastructure_development") ||
        actionId.startsWith("education_reform") ||
        actionId.startsWith("propaganda_campaign")
          ? targetId
          : targetCountry?.id || playerCountry.id,
      cost: actionId === "special_conquest" && targetCountry ? getConquestCost(targetCountry) : getActionCost(actionId),
      timestamp: Date.now(),
    }

    onExecuteAction(action)
    setSelectedAction(null)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Bajo":
        return "bg-green-600"
      case "Medio":
        return "bg-yellow-600"
      case "Alto":
        return "bg-orange-600"
      case "Muy Alto":
        return "bg-red-600"
      case "Extremo":
        return "bg-red-800"
      default:
        return "bg-gray-600"
    }
  }

  const renderActionList = (actions: any[], showNeighborRequirement = false) => {
    return actions.map((action) => {
      const Icon = action.icon
      const canAfford = canAffordAction(action.id)
      const neighborRequired = action.requiresNeighbor && !isNeighbor(targetCountry?.id || "")
      
      // Verificar si ya existe una alianza para la acción diplomatic_alliance
      const allianceExists = action.id === "diplomatic_alliance" && 
        targetCountry && 
        playerCountry.alliances?.includes(targetCountry.id)
      
      const isDisabled = !canAfford || neighborRequired || action.disabled || allianceExists

      // Debug logging
      if (action.id === "military_action") {
        console.log("🔍 Debug Military Action:", {
          canAfford,
          playerGDP: playerCountry.economy.gdp,
          actionCost: action.cost,
          neighborRequired,
          targetCountry: targetCountry?.name,
          isNeighbor: targetCountry ? isNeighbor(targetCountry.id) : false,
          isDisabled
        })
      }

      return (
        <div key={action.id} className="space-y-2">
          <Button
            variant={selectedAction === action.id ? "default" : "outline"}
            className={`w-full justify-start text-left h-auto p-3 ${
              action.isSpecial
                ? "border-2 border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 hover:from-yellow-800/30 hover:to-amber-800/30"
                : ""
            }`}
            disabled={isDisabled}
            onClick={() => setSelectedAction(selectedAction === action.id ? null : action.id)}
          >
            <div className="flex items-start gap-3 w-full">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${action.isSpecial ? "text-yellow-400" : ""}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-medium truncate ${action.isSpecial ? "text-yellow-300" : ""}`}>{action.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={getRiskColor(action.risk)} variant="secondary">
                      {action.risk}
                    </Badge>
                    {action.id === "debt_emission" ? (
                      <span className={`text-xs ${action.disabled ? "text-orange-400" : "text-green-400"} font-semibold`}>
                        {action.disabled ? "🕐" : `+$${action.generates}B`}
                      </span>
                    ) : (
                      <span className={`text-xs ${!canAfford ? "text-red-400 font-semibold" : "text-gray-400"}`}>
                        ${action.cost}B
                        {!canAfford && " ❌"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1 break-words">{action.description}</p>
                {neighborRequired && <p className="text-xs text-red-400 mt-1">⚠️ Requiere país vecino</p>}
                {action.isSpecial && (
                  <p className="text-xs text-yellow-400 mt-1">
                    👑 Solo disponible para países colapsados (&lt;20% estabilidad)
                  </p>
                )}
              </div>
            </div>
          </Button>

          {selectedAction === action.id && (
            <div className="ml-8 space-y-2">
              {/* Avisos de por qué está deshabilitada la acción */}
              {isDisabled && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-600/30">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-semibold">Acción no disponible:</span>
                  </div>
                  {!canAfford && !action.disabled && (
                    <p>• Fondos insuficientes (Necesitas: ${action.cost}B, Tienes: ${playerCountry.economy.gdp}B)</p>
                  )}
                  {neighborRequired && (
                    <p>• Requiere ser país vecino de {targetCountry?.name}</p>
                  )}
                  {allianceExists && (
                    <p>• Ya existe una alianza con {targetCountry?.name}</p>
                  )}
                  {action.disabled && action.id === "debt_emission" && (
                    <p>• Tiempo restante: {getDebtEmissionCooldown()}</p>
                  )}
                </div>
              )}
              
              {action.risk === "Alto" || action.risk === "Muy Alto" || action.risk === "Extremo" ? (
                <div className="text-xs text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Esta acción puede tener consecuencias impredecibles
                </div>
              ) : null}
              {action.isSpecial && (
                <div className={`text-xs p-2 rounded border ${
                  action.isDistant 
                    ? "text-red-300 bg-red-900/20 border-red-600/30"
                    : "text-yellow-300 bg-yellow-900/20 border-yellow-600/30"
                }`}>
                  <p className="font-semibold">
                    {action.isDistant ? "⚠️ CONQUISTA A DISTANCIA:" : "⚠️ CONQUISTA IMPERIAL:"}
                  </p>
                  <p>• Costo {action.isDistant ? "EXTREMO" : "muy alto"}: ${action.cost}B</p>
                  {action.isDistant && (
                    <>
                      <p>• Operación logística masiva requerida</p>
                      <p>• Riesgo de resistencia internacional</p>
                    </>
                  )}
                  <p>• Deberás gestionar este territorio</p>
                  <p>• Costos de mantenimiento continuos</p>
                </div>
              )}
              <Button
                onClick={() => executeAction(action.id)}
                className={
                  action.isSpecial
                    ? action.isDistant
                      ? "bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold"
                      : "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-black font-bold"
                    : action.risk === "Extremo"
                      ? "bg-red-800 hover:bg-red-900"
                      : action.risk === "Muy Alto"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-cyan-600 hover:bg-cyan-700"
                }
                disabled={isDisabled}
              >
                {action.isSpecial 
                  ? action.isDistant 
                    ? "🚀 CONQUISTAR A DISTANCIA" 
                    : "👑 CONQUISTAR IMPERIO" 
                  : "Ejecutar Acción"}
              </Button>
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <Card className="bg-slate-800/50 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Centro de Comando
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-300">
          <p>
            PIB Disponible: <span className="text-green-400 font-semibold">${playerCountry.economy.gdp}B</span>
          </p>
          <p>
            Territorios Controlados: <span className="text-cyan-400 font-semibold">{1 + ownedTerritories.length}</span>
          </p>
          {ownedTerritories.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Territorios conquistados:</p>
              <div className="flex flex-wrap gap-1">
                {ownedTerritories.map((territory) => (
                  <Badge key={territory.id} variant="outline" className="text-xs border-purple-500 text-purple-300">
                    {territory.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="internal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal">Gestión Imperial</TabsTrigger>
            <TabsTrigger value="external" disabled={!targetCountry}>
              {targetCountry ? `vs ${targetCountry.name}` : "Selecciona Objetivo"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="space-y-4">
            {/* Selector de territorio para acciones internas */}
            {allTerritories.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Seleccionar territorio:</p>
                <div className="grid grid-cols-1 gap-2">
                  {allTerritories.map((territory) => (
                    <Button
                      key={territory.id}
                      variant={selectedTerritory === territory.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTerritory(selectedTerritory === territory.id ? null : territory.id)}
                      className="justify-start"
                    >
                      <div className="flex items-center gap-2">
                        {territory.id === playerCountry.id ? (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <div className="w-4 h-4 bg-purple-600 rounded" />
                        )}
                        <span>{territory.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {territory.stability}%
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

                            <div className="space-y-2">{renderActionList(allInternalActions)}</div>
          </TabsContent>

          <TabsContent value="external" className="space-y-4">
            {targetCountry ? (
              <>
                {/* Mostrar acción especial de conquista si está disponible */}
                {specialConquestAction && (
                  <div className="space-y-2 border border-yellow-500/30 rounded-lg p-3 bg-gradient-to-r from-yellow-900/10 to-amber-900/10">
                    <h4 className="text-yellow-400 font-semibold flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Oportunidad de Conquista
                    </h4>
                    {renderActionList([specialConquestAction])}
                  </div>
                )}

                <Tabs defaultValue="diplomacy" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="diplomacy">Diplomacia</TabsTrigger>
                    <TabsTrigger value="economic">Económico</TabsTrigger>
                    <TabsTrigger value="military">Militar</TabsTrigger>
                    <TabsTrigger value="conspiracy">Conspiración</TabsTrigger>
                  </TabsList>

                  <TabsContent value="diplomacy" className="space-y-2">
                    {renderActionList(diplomaticActions, true)}
                  </TabsContent>

                  <TabsContent value="economic" className="space-y-2">
                    {renderActionList(economicActions, true)}
                  </TabsContent>

                  <TabsContent value="military" className="space-y-2">
                    {renderActionList(militaryActions, true)}
                  </TabsContent>

                  <TabsContent value="conspiracy" className="space-y-2">
                    {renderActionList(conspiracyActions)}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div className="space-y-2">
                  <p className="font-semibold">Selecciona un país objetivo en el mapa</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Haz clic en un país enemigo para atacarlo</p>
                    <p>• Los países conquistados por ti no pueden ser objetivos</p>
                    <p>• Tu país principal tampoco puede ser objetivo</p>
                    <p>• Puedes atacar aliados si las relaciones son tensas (&lt;20)</p>
                  </div>
                  {playerCountry.economy.gdp < 1000 && (
                    <div className="mt-4 text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-600/30">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Advertencia: Fondos bajos (${playerCountry.economy.gdp}B)</span>
                      </div>
                      <p>Considera hacer inversiones económicas primero</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
