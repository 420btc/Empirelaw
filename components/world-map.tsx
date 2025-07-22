"use client"

import type React from "react"

import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { useEffect, useState } from "react"
import type { Country, GameAction } from "@/lib/types"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface MissileAnimation {
  id: string
  sourceCountry: string
  targetCountry: string
  actionType: string
  startTime: number
  duration: number
}

interface WorldMapProps {
  countries: Country[]
  selectedCountry: string | null
  playerCountry: string | null
  hoveredCountry: string | null
  onCountryClick: (countryId: string) => void
  onCountryHover: (countryId: string | null) => void
  onMapClick: () => void // Nueva prop para deseleccionar
  recentAction?: GameAction | null // Nueva prop para activar animaciones
}

export function WorldMap({
  countries,
  selectedCountry,
  playerCountry,
  hoveredCountry,
  onCountryClick,
  onCountryHover,
  onMapClick,
  recentAction,
}: WorldMapProps) {
  const [blinkState, setBlinkState] = useState(true)
  const [activeAnimations, setActiveAnimations] = useState<MissileAnimation[]>([])

  // Coordenadas aproximadas de los países (centros geográficos)
  const countryCoordinates: Record<string, [number, number]> = {
    usa: [-95, 37],
    canada: [-106, 56],
    mexico: [-102, 23],
    brazil: [-55, -14],
    argentina: [-64, -34],
    chile: [-71, -35],
    colombia: [-74, 4],
    peru: [-76, -9],
    uk: [-3, 55],
    france: [2, 46],
    germany: [10, 51],
    italy: [12, 41],
    spain: [-8, 40],
    portugal: [-8, 39],
    netherlands: [5, 52],
    sweden: [18, 60],
    norway: [10, 60],
    russia: [105, 61],
    china: [104, 35],
    japan: [138, 36],
    south_korea: [127, 37],
    north_korea: [127, 40],
    india: [78, 20],
    australia: [133, -27],
    new_zealand: [174, -40],
    south_africa: [22, -30],
    nigeria: [8, 9],
    ghana: [-2, 7],
    egypt: [30, 26],
    kenya: [37, -0],
    morocco: [-7, 31],
    ethiopia: [40, 9],
    iceland: [-19, 64],
    liechtenstein: [9, 47],
    switzerland: [8, 46],
    greenland: [-42, 71],
    turkey: [35, 39],
    iran: [53, 32],
    saudi_arabia: [45, 23],
    israel: [34, 31],
    indonesia: [113, -0],
    philippines: [121, 13],
  }

  // Efecto de parpadeo para el país seleccionado
  useEffect(() => {
    if (!selectedCountry) return

    const interval = setInterval(() => {
      setBlinkState((prev) => !prev)
    }, 800) // Parpadea cada 800ms

    return () => clearInterval(interval)
  }, [selectedCountry])

  // Efecto para crear animaciones de misil cuando hay nuevas acciones
  useEffect(() => {
    if (!recentAction) return
    
    // Solo crear animaciones para acciones que involucran dos países diferentes
    if (recentAction.sourceCountry === recentAction.targetCountry) return
    if (!recentAction.targetCountry) return
    
    // Verificar que tenemos coordenadas para ambos países
    const sourceCoords = countryCoordinates[recentAction.sourceCountry]
    const targetCoords = countryCoordinates[recentAction.targetCountry]
    
    if (!sourceCoords || !targetCoords) {
      console.log(`⚠️ No se encontraron coordenadas para ${recentAction.sourceCountry} o ${recentAction.targetCountry}`)
      return
    }

         // Duración simple y rápida para todas las acciones
     const getAnimationDuration = (actionType: string): number => {
       return 800 // 0.8 segundos para todas las acciones - más rápido y simple
     }

    const newAnimation: MissileAnimation = {
      id: `missile_${Date.now()}`,
      sourceCountry: recentAction.sourceCountry,
      targetCountry: recentAction.targetCountry,
      actionType: recentAction.type,
      startTime: Date.now(),
      duration: getAnimationDuration(recentAction.type)
    }

    console.log(`🚀 Creando animación SIMPLE: ${recentAction.sourceCountry} → ${recentAction.targetCountry} (${recentAction.type})`)
    
    setActiveAnimations(prev => [...prev, newAnimation])

    // Remover la animación después de que termine
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id))
    }, newAnimation.duration)

  }, [recentAction])

  // Limpiar animaciones expiradas
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      setActiveAnimations(prev => 
        prev.filter(anim => now - anim.startTime < anim.duration)
      )
    }, 100)

    return () => clearInterval(cleanup)
  }, [])

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

    // Prioridad 7: Color basado en estabilidad (escala realista)
    if (country.stability >= 85) return "#16a34a" // Verde fuerte - Muy estable
    if (country.stability >= 70) return "#4ade80" // Verde lima - Estable
    if (country.stability >= 50) return "#eab308" // Amarillo - Moderada
    if (country.stability >= 30) return "#f97316" // Naranja - Inestable
    if (country.stability >= 15) return "#ef4444" // Rojo - Crisis
    if (country.stability >= 1) return "#7f1d1d" // Rojo oscuro - Colapso inminente
    return "#18181b" // Gris oscuro/negro - Colapsado
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
      "404": "kenya",
      "504": "morocco",
      "231": "ethiopia",
      // NUEVOS PAÍSES AÑADIDOS
      "304": "greenland", // Groenlandia
      "170": "colombia", // Colombia
      "604": "peru", // Perú
      "528": "netherlands", // Holanda
      "752": "sweden", // Suecia
      "578": "norway", // Noruega
      "360": "indonesia", // Indonesia
      "608": "philippines", // Filipinas
    }

    return countryMapping[geoId] || null
  }

  // Función para generar línea simple entre dos puntos
  const generateSimplePath = (start: [number, number], end: [number, number], progress: number): string => {
    const [x1, y1] = start
    const [x2, y2] = end
    
    // Línea recta simple desde inicio hasta posición actual
    const currentX = x1 + (x2 - x1) * progress
    const currentY = y1 + (y2 - y1) * progress
    
    return `M ${x1} ${y1} L ${currentX} ${currentY}`
  }

  // Función para obtener color del misil basado en tipo de acción
  const getMissileColor = (actionType: string): string => {
    switch (actionType) {
      case "military_action":
      case "naval_blockade":
        return "#ef4444" // Rojo para acciones militares
      case "cyber_attack":
      case "biological_warfare":
        return "#8b5cf6" // Púrpura para acciones especiales
      case "economic_sanction":
      case "trade_embargo":
        return "#f59e0b" // Ámbar para acciones económicas
      case "diplomatic_alliance":
      case "diplomatic_message":
        return "#10b981" // Verde para diplomacia
      default:
        return "#06b6d4" // Cian por defecto
    }
  }

  // Manejar clic en el mapa (para deseleccionar)
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
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
            scale: 145,
            center: [0, 20],
          }}
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
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
                    onClick={(event: React.MouseEvent) => {
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
          
          {/* Renderizar líneas animadas de misiles */}
          {activeAnimations.map((animation) => {
            const now = Date.now()
            const elapsed = now - animation.startTime
            const progress = Math.min(elapsed / animation.duration, 1)
            
            const sourceCoords = countryCoordinates[animation.sourceCountry]
            const targetCoords = countryCoordinates[animation.targetCountry]
            
            if (!sourceCoords || !targetCoords) return null
            
            const simplePath = generateSimplePath(sourceCoords, targetCoords, progress)
            const lineColor = getMissileColor(animation.actionType)
            
            return (
              <g key={animation.id}>
                {/* Línea simple y delgada */}
                <path
                  d={simplePath}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />
                
                {/* Punto del proyectil (pequeño) */}
                {progress > 0 && progress < 1 && (
                  <circle
                    cx={sourceCoords[0] + (targetCoords[0] - sourceCoords[0]) * progress}
                    cy={sourceCoords[1] + (targetCoords[1] - sourceCoords[1]) * progress}
                    r="2"
                    fill={lineColor}
                    opacity="1"
                  />
                )}
                
                {/* Flash al final (más simple) */}
                {progress >= 1 && (
                  <circle
                    cx={targetCoords[0]}
                    cy={targetCoords[1]}
                    r="5"
                    fill={lineColor}
                    opacity="0.6"
                  >
                    <animate attributeName="r" values="5;10;0" dur="0.3s" begin="0s" />
                    <animate attributeName="opacity" values="0.6;0.2;0" dur="0.3s" begin="0s" />
                  </circle>
                )}
              </g>
            )
          })}
          

        </ComposableMap>
      </div>

      {/* Leyenda horizontal en la parte inferior aprovechando el espacio de la Antártida */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="flex items-center justify-center gap-4 text-xs">
          {/* Primera fila de leyenda */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded animate-pulse"></div>
            <span className="text-white">Seleccionado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded"></div>
            <span className="text-white">Tu país</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-700 rounded"></div>
            <span className="text-white">Conquistados</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded"></div>
            <span className="text-white">Soberano</span>
          </div>
          
          {/* Separador */}
          <div className="w-px h-4 bg-gray-500"></div>
          
          {/* Estabilidad */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded"></div>
            <span className="text-white">Estable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded"></div>
            <span className="text-white">Moderado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded"></div>
            <span className="text-white">Inestable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span className="text-white">Crisis</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-600 rounded animate-pulse"></div>
            <span className="text-white">Colapsado</span>
          </div>
          
          {/* Separador */}
          <div className="w-px h-4 bg-gray-500"></div>
          
          {/* Tip */}
          <div className="text-gray-300 text-xs">
            💡 Clic en océano para deseleccionar
          </div>
        </div>
      </div>
    </div>
  )
}
