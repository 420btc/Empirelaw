"use client"

import type React from "react"

import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { useEffect, useState } from "react"
import type { Country } from "@/lib/types"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface WorldMapProps {
  countries: Country[]
  selectedCountry: string | null
  playerCountry: string | null
  hoveredCountry: string | null
  onCountryClick: (countryId: string) => void
  onCountryHover: (countryId: string | null) => void
  onMapClick: () => void // Nueva prop para deseleccionar
}

export function WorldMap({
  countries,
  selectedCountry,
  playerCountry,
  hoveredCountry,
  onCountryClick,
  onCountryHover,
  onMapClick,
}: WorldMapProps) {
  const [blinkState, setBlinkState] = useState(true)

  // Efecto de parpadeo para el país seleccionado
  useEffect(() => {
    if (!selectedCountry) return

    const interval = setInterval(() => {
      setBlinkState((prev) => !prev)
    }, 800) // Parpadea cada 800ms

    return () => clearInterval(interval)
  }, [selectedCountry])

  const getCountryColor = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId)
    if (!country) return "#374151"

    // Prioridad 1: País seleccionado (azul parpadeante)
    if (countryId === selectedCountry) {
      return blinkState ? "#3b82f6" : "#1d4ed8" // Alterna entre azul claro y azul oscuro
    }

    // Prioridad 2: País con hover (púrpura claro)
    if (countryId === hoveredCountry) return "#a855f7"

    // Prioridad 3: País del jugador principal (púrpura)
    if (countryId === playerCountry) return "#8b5cf6"

    // Prioridad 4: Territorios conquistados por el jugador (púrpura más oscuro)
    if (country.ownedBy === playerCountry) return "#7c3aed"

    // Prioridad 5: Estados soberanos (ámbar)
    if (country.isSovereign) return "#f59e0b"

    // Prioridad 6: Países colapsados (rojo intenso)
    if (country.stability <= 0) return "#dc2626" // Rojo intenso para países colapsados

    // Prioridad 7: Color basado en estabilidad
    if (country.stability >= 80) return "#22c55e" // Verde - Estable
    if (country.stability >= 60) return "#eab308" // Amarillo - Moderado
    if (country.stability >= 40) return "#f97316" // Naranja - Inestable
    if (country.stability >= 20) return "#ef4444" // Rojo - Crisis
    return "#dc2626" // Rojo intenso - Colapso inminente
  }

  const getCountryData = (geoId: string) => {
    // Map geographic IDs to our country IDs - Expandido para más países
    const countryMapping: Record<string, string> = {
      "840": "usa", // United States
      "124": "canada",
      "484": "mexico",
      "076": "brazil",
      "032": "argentina",
      "152": "chile",
      "826": "uk", // United Kingdom
      "250": "france",
      "276": "germany",
      "380": "italy",
      "724": "spain",
      "620": "portugal",
      "643": "russia",
      "156": "china",
      "392": "japan",
      "410": "south_korea",
      "408": "north_korea",
      "356": "india",
      "036": "australia",
      "554": "new_zealand",
      "710": "south_africa",
      "818": "egypt",
      "566": "nigeria",
      "352": "iceland",
      "438": "liechtenstein",
      "756": "switzerland",
      "792": "turkey",
      "364": "iran",
      "682": "saudi_arabia",
      "376": "israel",
    }

    return countryMapping[geoId] || null
  }

  // Manejar clic en el mapa (para deseleccionar)
  const handleMapClick = (event: React.MouseEvent) => {
    // Solo deseleccionar si el clic no fue en un país
    const target = event.target as Element
    if (target.tagName === "path") {
      // Es un país, no hacer nada (se maneja en Geography)
      return
    }
    // Es océano u otra área, deseleccionar
    onMapClick()
  }

  return (
    <div className="w-full h-full bg-slate-800 rounded-lg border border-cyan-500/30 overflow-hidden">
      <div onClick={handleMapClick} className="w-full h-full cursor-pointer">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [0, 20],
          }}
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryId = getCountryData(geo.id)
                const country = countryId ? countries.find((c) => c.id === countryId) : null

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={countryId ? getCountryColor(countryId) : "#374151"}
                    stroke="#1f2937"
                    strokeWidth={countryId === selectedCountry ? 1.5 : 0.5} // Borde más grueso para país seleccionado
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        filter: "brightness(1.2)",
                        cursor: countryId ? "pointer" : "default",
                      },
                      pressed: { outline: "none" },
                    }}
                    onClick={(event) => {
                      event.stopPropagation() // Evitar que se propague al mapa
                      if (countryId) onCountryClick(countryId)
                    }}
                    onMouseEnter={() => {
                      if (countryId) onCountryHover(countryId)
                    }}
                    onMouseLeave={() => onCountryHover(null)}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded animate-pulse"></div>
            <span>País seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Tu país principal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-700 rounded"></div>
            <span>Territorios conquistados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Estado soberano</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Estable (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Moderado (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Inestable (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Crisis (20-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded animate-pulse"></div>
            <span>Colapsado (0-19%)</span>
          </div>
          <div className="text-gray-400 text-xs mt-2 border-t border-gray-600 pt-2">
            💡 Clic en océano para deseleccionar
          </div>
        </div>
      </div>
    </div>
  )
}
