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
import { useGameState } from "@/hooks/use-game-state"
import type { Country, TradeOffer } from "@/lib/types"

export default function GeopoliticsGame() {
  const {
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
  } = useGameState()

  const [showCountrySelection, setShowCountrySelection] = useState(true)
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null)
  const [showDiplomaticChat, setShowDiplomaticChat] = useState(false)
  const [showTradeCenter, setShowTradeCenter] = useState(false)
  const [showEventHistory, setShowEventHistory] = useState(false)

  const handleCountrySelection = (country: Country) => {
    setPlayerCountry(country.id)
    setShowCountrySelection(false)
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

  // Helper para determinar si un país puede ser objetivo
  const getTargetCountry = (): Country | null => {
    if (!selectedCountry) return null
    if (selectedCountry === playerCountry) return null
    
    const selectedCountryData = countries.find((c) => c.id === selectedCountry)
    if (!selectedCountryData) return null
    if (selectedCountryData.ownedBy === playerCountry) return null
    
    return selectedCountryData
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-black text-white">
      <div className="container mx-auto p-4 min-h-screen flex flex-col">
        <GameHeader
          playerCountry={playerCountry ? countries.find((c) => c.id === playerCountry) || null : null}
          gameStats={gameStats}
          actionHistory={actionHistory}
          events={gameEvents} // Cronología completa para el badge
          onShowEventHistory={() => setShowEventHistory(true)}
          onShowDiplomacy={() => setShowDiplomaticChat(true)}
          onShowTrade={() => setShowTradeCenter(true)}
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          <div className="lg:col-span-3 relative">
            <WorldMap
              countries={countries}
              selectedCountry={selectedCountry}
              playerCountry={playerCountry}
              hoveredCountry={hoveredCountry?.id || null}
              onCountryClick={handleMapCountryClick}
              onCountryHover={handleMapCountryHover}
              onMapClick={handleMapClick} // Nueva prop
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

          <div className="space-y-4">
            <CountryPanel
              country={selectedCountry ? countries.find((c) => c.id === selectedCountry) || null : null}
              isPlayerCountry={selectedCountry === playerCountry}
            />

            {playerCountry && (
              <ActionMenu
                playerCountry={countries.find((c) => c.id === playerCountry)!}
                targetCountry={getTargetCountry()}
                onExecuteAction={executeAction}
                ownedTerritories={ownedTerritories} // Pasar territorios conquistados
              />
            )}
          </div>
        </div>

        {/* Notificaciones flotantes - SOLO visibleNotifications */}
        <EventNotifications events={visibleNotifications} onDismiss={dismissNotification} />
      </div>

      {/* Modales */}
      {showCountrySelection && <CountrySelectionModal countries={countries} onSelect={handleCountrySelection} />}

      {showDiplomaticChat && playerCountry && (
        <DiplomaticChat
          playerCountry={countries.find((c) => c.id === playerCountry)!}
          countries={countries}
          onClose={() => setShowDiplomaticChat(false)}
          onDiplomaticChange={updateDiplomaticRelations}
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
    </div>
  )
}
