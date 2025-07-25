"use client"

import { useState } from "react"
import { WorldMap } from "@/components/world-map"
import { CountryPanel } from "@/components/country-panel"
import { ActionMenu } from "@/components/action-menu"
import { EventNotifications } from "@/components/event-notifications"
import { EventHistoryPanel } from "@/components/event-history-panel"
import { GameHeader } from "@/components/game-header"
import { CountrySelectionModal } from "@/components/country-selection-modal"
import { DiplomaticChat } from "@/components/diplomatic-chat"
import { WorldTradeCenter } from "@/components/world-trade-center"
import { LevelUpNotification } from "@/components/level-up-notification"
import { AchievementsPanel } from "@/components/achievements-panel"
import { GameOverModal } from "@/components/game-over-modal"
import { AISettings } from "@/components/ai-settings"
import { useGameState } from "@/hooks/use-game-state"
import type { Country, TradeOffer, GameAction } from "@/lib/types"

import { IntroZoom } from "@/components/intro-zoom"

export default function GeopoliticsGame() {
  const {
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
    playerLevel,
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
  } = useGameState()

  const [showCountrySelection, setShowCountrySelection] = useState(true)
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null)
  const [showDiplomaticChat, setShowDiplomaticChat] = useState(false)
  const [showTradeCenter, setShowTradeCenter] = useState(false)
  const [showEventHistory, setShowEventHistory] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showAISettings, setShowAISettings] = useState(false)
  const [recentAction, setRecentAction] = useState<GameAction | null>(null)
  const [showIntro, setShowIntro] = useState(true)

  // Función personalizada de reinicio que resetea tanto el estado del juego como los estados locales
  const handleRestart = () => {
    restartGame() // Resetea el estado del juego
    setShowCountrySelection(true) // Muestra el modal de selección de país
    setShowIntro(true) // Muestra la intro
    setHoveredCountry(null)
    setShowDiplomaticChat(false)
    setShowTradeCenter(false)
    setShowEventHistory(false)
    setShowAchievements(false)
    setShowAISettings(false)
    setRecentAction(null)
  }

  const handleCountrySelection = (country: Country) => {
    console.log("🏛️ handleCountrySelection llamado con:", country.name, country.id)
    setPlayerCountry(country.id)
    console.log("✅ setPlayerCountry llamado con:", country.id)
    setShowCountrySelection(false)
    console.log("✅ Modal cerrado")
  }

  const handleMapCountryClick = (countryId: string) => {
    if (!playerCountry) {
      const country = countries.find((c) => c.id === countryId)
      if (country) {
        handleCountrySelection(country)
      }
    } else {
      selectCountry(countryId)
    }
  }

  const handleMapCountryHover = (countryId: string | null) => {
    if (countryId) {
      const country = countries.find((c) => c.id === countryId)
      setHoveredCountry(country || null)
    } else {
      setHoveredCountry(null)
    }
  }

  // Nueva función para deseleccionar país
  const handleMapClick = () => {
    selectCountry(null)
  }

  const handleTradeExecuted = (trade: TradeOffer) => {
    executeTradeOffer(trade)
  }

  // Función para manejar acciones de IA
  const handleAIAction = (action: any) => {
    console.log('🤖 Acción de IA recibida:', action)
    
    // Convertir la acción de IA al formato esperado por executeAction
    const gameAction: GameAction = {
      id: `ai_action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: action.type,
      targetCountry: action.target || 'Global',
      cost: 0, // Las acciones de IA no tienen costo para el jugador
      timestamp: action.timestamp || Date.now(),
      sourceCountry: action.sourceCountry,
      severity: action.severity || 5
    }
    
    // Ejecutar la acción
    executeAction(gameAction)
    setRecentAction(gameAction)
    
    // Limpiar la acción después de un tiempo
    setTimeout(() => {
      setRecentAction(null)
    }, 3000)
  }

  // Función para manejar acciones ejecutadas y activar animaciones
  const handleActionExecuted = (action: GameAction) => {
    executeAction(action)
    setRecentAction(action)
    
    // Limpiar la acción después de un tiempo para permitir nuevas animaciones
    setTimeout(() => {
      setRecentAction(null)
    }, 3000)
  }

  // Helper para determinar si un país puede ser objetivo
  const getTargetCountry = (): Country | null => {
    if (!selectedCountry) return null
    if (selectedCountry === playerCountry) return null
    
    const selectedCountryData = countries.find((c) => c.id === selectedCountry)
    if (!selectedCountryData) return null
    if (selectedCountryData.ownedBy === playerCountry) return null
    
    // Permitir atacar países aliados si las relaciones diplomáticas son muy tensas (< 20)
    const playerCountryData = countries.find((c) => c.id === playerCountry)
    if (playerCountryData) {
      const isAlly = playerCountryData.alliances?.includes(selectedCountryData.id)
      const diplomaticRelation = playerCountryData.diplomaticRelations?.[selectedCountryData.id] || 0
      
      // Si es aliado pero las relaciones son muy tensas, permitir el ataque
      if (isAlly && diplomaticRelation >= 20) {
        return null // No permitir ataque a aliados con buenas relaciones
      }
    }
    
    return selectedCountryData
  }

  if (showIntro) {
    return <IntroZoom onEnd={() => setShowIntro(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-black text-white">
      <div className="container mx-auto p-4 min-h-screen flex flex-col">
        <GameHeader
          playerCountry={playerCountry ? countries.find((c) => c.id === playerCountry) || null : null}
          gameStats={gameStats}
          actionHistory={actionHistory}
          events={gameEvents}
          onShowEventHistory={() => {
            setShowEventHistory(true)
            markEventsAsSeen()
          }}
          onShowDiplomacy={() => setShowDiplomaticChat(true)}
          onShowTrade={() => setShowTradeCenter(true)}
          onShowAchievements={() => {
            // Marcar logros desbloqueados como vistos
            const updated = achievements.map(a => a.unlocked ? { ...a, seen: true } : a)
            setAchievements(updated)
            setShowAchievements(true)
          }}
          onShowAISettings={() => setShowAISettings(true)}
          playerLevel={playerLevel}
          gameProgression={gameProgression}
          unseenAchievementsCount={achievements.filter(a => a.unlocked && !a.seen).length}
          eventStreak={eventStreak}
          gameTime={gameTime}
          isClockAnimating={isClockAnimating}
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          <div className="lg:col-span-3 relative h-[600px] lg:h-[720px]">
            <WorldMap
              countries={countries}
              selectedCountry={selectedCountry}
              playerCountry={playerCountry}
              hoveredCountry={hoveredCountry?.id || null}
              aiCountries={aiCountries} // Países controlados por IA
              onCountryClick={handleMapCountryClick}
              onCountryHover={handleMapCountryHover}
              onMapClick={handleMapClick} // Nueva prop
              recentAction={recentEvent} // Eventos para animaciones del mapa
            />

            {hoveredCountry && (
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30">
                <h3 className="font-bold text-cyan-400">{hoveredCountry.name}</h3>
                <p className="text-sm text-gray-300">Líder: {hoveredCountry.president}</p>
                <p className="text-sm text-gray-300">Estabilidad: {hoveredCountry.stability}%</p>
                <p className="text-sm text-gray-300">PIB: ${hoveredCountry.economy.gdp}B</p>
                {hoveredCountry.ownedBy === playerCountry && (
                  <p className="text-sm text-purple-400">👑 Territorio conquistado</p>
                )}
                {hoveredCountry.stability <= 20 && !hoveredCountry.ownedBy && !hoveredCountry.isSovereign && (
                  <p className="text-sm text-yellow-400 animate-pulse">⚠️ Disponible para conquista</p>
                )}
                <div className="mt-2">
                  <p className="text-xs text-gray-400">Recursos principales:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hoveredCountry.economy.resources.slice(0, 3).map((resource) => (
                      <span key={resource} className="text-xs bg-slate-700 px-1 rounded">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="space-y-4 max-h-[600px] lg:max-h-[720px] overflow-y-auto scrollbar-hide">
            <CountryPanel
              country={selectedCountry ? countries.find((c) => c.id === selectedCountry) || null : null}
              isPlayerCountry={selectedCountry === playerCountry}
              countries={countries}
            />

            {playerCountry && (
              <ActionMenu
                playerCountry={countries.find((c) => c.id === playerCountry)!}
                targetCountry={getTargetCountry()}
                onExecuteAction={handleActionExecuted}
                ownedTerritories={ownedTerritories} // Pasar territorios conquistados
              />
            )}
          </div>
        </div>

        {/* Notificaciones flotantes - SOLO visibleNotifications */}
        <EventNotifications events={visibleNotifications} onDismiss={dismissNotification} />

        {/* Notificación de subida de nivel */}
        <LevelUpNotification 
          show={showLevelUp} 
          playerLevel={playerLevel}
          onDismiss={dismissLevelUp}
        />
      </div>

      {/* Modales */}
      {showCountrySelection && <CountrySelectionModal countries={countries} onSelect={handleCountrySelection} />}

      {showDiplomaticChat && playerCountry && (
        <DiplomaticChat
          playerCountry={countries.find((c) => c.id === playerCountry)!}
          countries={countries}
          onClose={() => setShowDiplomaticChat(false)}
          onDiplomaticChange={updateDiplomaticRelations}
          gameEvents={gameEvents}
          actionHistory={actionHistory}
          onAIAction={handleAIAction}
          onShowAISettings={() => setShowAISettings(true)}
        />
      )}

      {showTradeCenter && playerCountry && (
        <WorldTradeCenter
          playerCountry={countries.find((c) => c.id === playerCountry)!}
          countries={countries}
          onClose={() => setShowTradeCenter(false)}
          onTradeExecuted={handleTradeExecuted}
        />
      )}

      {/* Cronología completa - TODOS los eventos gameEvents */}
      {showEventHistory && <EventHistoryPanel events={gameEvents} onClose={() => setShowEventHistory(false)} />}

      {/* Panel de Logros */}
      {showAchievements && (
        <AchievementsPanel
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Modal de Game Over */}
      <GameOverModal
        isOpen={isGameOver}
        conquerorCountry={conquerorCountry}
        playerCountry={countries.find((c) => c.id === playerCountry)?.name || "Tu País"}
        onRestart={handleRestart}
      />

      {/* Configuración de IA */}
      {showAISettings && (
        <AISettings onClose={() => setShowAISettings(false)} />
      )}
    </div>
  )
}
