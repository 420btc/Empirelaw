"use client"

import type React from "react"

import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { useEffect, useState } from "react"
import { geoMercator } from "d3-geo"
import type { Country, GameAction, GameEvent } from "@/lib/types"

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
  aiCountries?: Country[] // Nueva prop para países IA
  onCountryClick: (countryId: string) => void
  onCountryHover: (countryId: string | null) => void
  onMapClick: () => void // Nueva prop para deseleccionar
  recentAction?: GameAction | GameEvent | null // Nueva prop para activar animaciones
}

export function WorldMap({
  countries,
  selectedCountry,
  playerCountry,
  hoveredCountry,
  aiCountries = [],
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
    senegal: [-14, 14],
    tanzania: [35, -6],
    angola: [17, -12],
    uganda: [32, 1],
    mozambique: [35, -18], // Nueva
    cameroon: [12, 6], // Nueva
    ivory_coast: [-5, 8], // Nueva
    zambia: [27, -15], // Nueva
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
    // NUEVOS PAÍSES AÑADIDOS
    greece: [22, 39],
    algeria: [3, 28],
    niger: [8, 16],
    // Países añadidos recientemente
    libya: [17, 25],
    chad: [19, 15],
    tunisia: [9, 34],
    mali: [-4, 17],
    sudan: [30, 12],
    gabon: [11, -1],
    mauritania: [-10, 20],
    uzbekistan: [64, 41],
    tajikistan: [71, 39],
    kyrgyzstan: [75, 41],
    moldova: [29, 47],
    estonia: [26, 59],
    latvia: [25, 57],
    lithuania: [24, 56],
    syria: [38, 35],
    bulgaria: [25, 43],
    romania: [25, 46],
    croatia: [15, 45],
    yemen: [48, 15],
    afghanistan: [67, 33],
    // PAÍSES AÑADIDOS RECIENTEMENTE
    kazakhstan: [66, 48],
    ukraine: [31, 49],
    poland: [19, 52],
    austria: [14, 47],
    congo_drc: [21, -4],
    bolivia: [-64, -16],
    paraguay: [-58, -23],
    cuba: [-77, 21],
    mongolia: [103, 46],
    // NUEVOS PAÍSES AÑADIDOS
    oman: [56, 21], // Omán - Golfo Pérsico
    madagascar: [47, -19], // Madagascar - Isla al este de África
    venezuela: [-66, 6], // Venezuela - Norte de Sudamérica
  }

  // Efecto de parpadeo para el país seleccionado
  useEffect(() => {
    if (!selectedCountry) return

    const interval = setInterval(() => {
      setBlinkState((prev) => !prev)
    }, 800) // Parpadea cada 800ms

    return () => clearInterval(interval)
  }, [selectedCountry])

  // Efecto para crear animaciones cuando hay nuevas acciones o eventos
  useEffect(() => {
    if (!recentAction) return
    
    let sourceCountry: string | null = null
    let targetCountry: string | null = null
    let actionType: string = 'event'
    
    // Manejar GameAction (acciones del jugador)
    if ('sourceCountry' in recentAction && 'targetCountry' in recentAction) {
      sourceCountry = recentAction.sourceCountry
      targetCountry = recentAction.targetCountry
      actionType = recentAction.type
    }
    // Manejar GameEvent (eventos automáticos y de IA)
    else if ('effects' in recentAction) {
      // Extraer países de los efectos del evento
      const effects = recentAction.effects || []
      const description = recentAction.description || ''
      const title = recentAction.title || ''
      
      // Buscar patrones de países en el texto
      const allText = `${title} ${description} ${effects.join(' ')}`
      const countryNames = countries.map(c => c.name)
      const foundCountries: string[] = []
      
      // Buscar nombres de países en el texto
      countryNames.forEach(name => {
        if (allText.includes(name)) {
          const country = countries.find(c => c.name === name)
          if (country && !foundCountries.includes(country.id)) {
            foundCountries.push(country.id)
          }
        }
      })
      
      // Si encontramos al menos 2 países, usar los primeros dos
      if (foundCountries.length >= 2) {
        sourceCountry = foundCountries[0]
        targetCountry = foundCountries[1]
      }
      // Si solo encontramos 1 país y hay un playerCountry, usar como origen/destino
      else if (foundCountries.length === 1 && playerCountry) {
        if (foundCountries[0] === playerCountry) {
          // El evento afecta al jugador, buscar otro país mencionado
          sourceCountry = playerCountry
          targetCountry = foundCountries[0]
        } else {
          // El evento viene de otro país hacia el jugador o es general
          sourceCountry = foundCountries[0]
          targetCountry = playerCountry
        }
      }
      
      actionType = recentAction.type
    }
    
    // Solo crear animaciones si tenemos origen y destino válidos
    if (!sourceCountry || !targetCountry || sourceCountry === targetCountry) {
      return
    }
    
    // Verificar que tenemos coordenadas para ambos países
    const sourceCoords = countryCoordinates[sourceCountry]
    const targetCoords = countryCoordinates[targetCountry]
    
    if (!sourceCoords || !targetCoords) {
      console.log(`⚠️ No se encontraron coordenadas para ${sourceCountry} o ${targetCountry}`)
      return
    }

    // Duración fija de 2 segundos para todas las animaciones
    const ANIMATION_DURATION = 2000

    const newAnimation: MissileAnimation = {
      id: `missile_${Date.now()}`,
      sourceCountry: sourceCountry,
      targetCountry: targetCountry,
      actionType: actionType,
      startTime: Date.now(),
      duration: ANIMATION_DURATION
    }

    console.log(`🚀 Creando animación: ${sourceCountry} → ${targetCountry} (${actionType}) - 2s`)
    
    setActiveAnimations(prev => [...prev, newAnimation])

    // Remover la animación después de que termine
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id))
    }, newAnimation.duration)

  }, [recentAction, countries, playerCountry])

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
    // Verificación robusta para conquistas tanto directas como a distancia
    if (country.ownedBy === playerCountry) {
      console.log(`🎨 País ${country.name} conquistado - aplicando color púrpura`)
      return "#7c3aed"
    }

    // Los países de IA mantienen su color original según su estado
    // (se identificarán con etiquetas "IA" en lugar de color especial)

    // Prioridad 6: Estados soberanos (blanco)
    if (country.isSovereign) return "#ffffff"

    // Prioridad 7: Países colapsados (rojo intenso)
    if (country.stability <= 0) return "#dc2626" // Rojo intenso para países colapsados

    // Prioridad 8: Color basado en estabilidad (escala realista)
    if (country.stability >= 85) return "#16a34a" // Verde fuerte - Muy estable
    if (country.stability >= 70) return "#4ade80" // Verde lima - Estable
    if (country.stability >= 50) return "#eab308" // Amarillo - Moderada
    if (country.stability >= 30) return "#f97316" // Naranja - Inestable
    if (country.stability >= 15) return "#ef4444" // Rojo - Crisis
    if (country.stability >= 1) return "#7f1d1d" // Rojo oscuro - Colapso inminente
    return "#18181b" // Gris oscuro/negro - Colapsado
  }

  // Nueva función para obtener el color del borde según la alianza/bloque geopolítico
  const getAllianceStrokeColor = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId)
    if (!country) return "#1f2937"

    // Si el país tiene alianzas específicas, usar un color único para esa alianza
    if (country.alliances && country.alliances.length > 0) {
      // Generar un color consistente basado en la primera alianza (alfabéticamente)
      const sortedAlliances = [...country.alliances].sort()
      const primaryAlly = sortedAlliances[0]
      
      // Crear un hash simple del nombre de la alianza para generar un color consistente
      let hash = 0
      for (let i = 0; i < primaryAlly.length; i++) {
        hash = primaryAlly.charCodeAt(i) + ((hash << 5) - hash)
      }
      
      // Convertir el hash a un color HSL para mejor distribución de colores
      const hue = Math.abs(hash) % 360
      return `hsl(${hue}, 70%, 60%)` // Saturación y luminosidad fijas para consistencia
    }

    // Si no tiene alianzas específicas, usar color del bloque geopolítico
    switch (country.geopoliticalBlock) {
      case "nato":
        return "#3b82f6" // Azul - OTAN/Occidente
      case "eu":
        return "#fbbf24" // Amarillo/Dorado - Unión Europea
      case "brics":
        return "#ef4444" // Rojo - BRICS+
      case "africa":
        return "#10b981" // Verde - Unión Africana
      case "latin_america":
        return "#f59e0b" // Naranja - América Latina
      case "middle_east":
        return "#8b5cf6" // Púrpura - Oriente Medio
      case "neutral":
        return "#6b7280" // Gris - Países Neutrales
      default:
        return "#1f2937" // Gris oscuro por defecto
    }
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
      "686": "senegal",
      "834": "tanzania",
      "024": "angola",
      "800": "uganda",
      "508": "mozambique", // Mozambique
      "120": "cameroon", // Camerún
      "384": "ivory_coast", // Costa de Marfil
      "894": "zambia", // Zambia
      // NUEVOS PAÍSES AÑADIDOS
      "304": "greenland", // Groenlandia
      "170": "colombia", // Colombia
      "604": "peru", // Perú
      "528": "netherlands", // Holanda
      "752": "sweden", // Suecia
      "578": "norway", // Noruega
      "360": "indonesia", // Indonesia
      "608": "philippines", // Filipinas
      // NUEVOS PAÍSES AÑADIDOS
      "300": "greece", // Grecia
      "012": "algeria", // Argelia
      "562": "niger", // Níger
      "760": "syria", // Siria
      "100": "bulgaria", // Bulgaria
      "642": "romania", // Rumanía
      "191": "croatia", // Croacia
      "887": "yemen", // Yemen
      "004": "afghanistan", // Afganistán
      // PAÍSES AÑADIDOS RECIENTEMENTE
      "398": "kazakhstan", // Kazajistán
      "804": "ukraine", // Ucrania
      "616": "poland", // Polonia
      "040": "austria", // Austria
      "180": "congo_drc", // República Democrática del Congo
      "068": "bolivia", // Bolivia
      "600": "paraguay", // Paraguay
      "192": "cuba", // Cuba
      "496": "mongolia", // Mongolia
      // PAÍSES AÑADIDOS RECIENTEMENTE - SEGUNDA TANDA
      "434": "libya", // Libia
      "148": "chad", // Chad
      "788": "tunisia", // Túnez
      "466": "mali", // Malí
      "729": "sudan", // Sudán
      "266": "gabon", // Gabón
      "478": "mauritania", // Mauritania
      "860": "uzbekistan", // Uzbekistán
      "762": "tajikistan", // Tayikistán
      "417": "kyrgyzstan", // Kirguistán
      "498": "moldova", // Moldavia
      "233": "estonia", // Estonia
      "428": "latvia", // Letonia
      "440": "lithuania", // Lituania
      // NUEVOS PAÍSES AÑADIDOS - TERCERA TANDA
      "512": "oman", // Omán
      "450": "madagascar", // Madagascar
      "862": "venezuela", // Venezuela
    }

    return countryMapping[geoId] || null
  }

  // Función para calcular el centroide de un polígono
  const getCentroid = (coordinates: number[][]): [number, number] => {
    let x = 0
    let y = 0
    const length = coordinates.length
    
    coordinates.forEach(coord => {
      x += coord[0]
      y += coord[1]
    })
    
    return [x / length, y / length]
  }

  // Configuración de proyección (debe coincidir con la del mapa)
  const projection = geoMercator()
    .scale(145)
    .center([0, 20])
    .translate([400, 300]) // Ajustar según el tamaño del contenedor

  // Función para determinar el color del efecto de impacto
  const getImpactColor = (actionType: string): string => {
    // Acciones positivas (verde)
    if (actionType === 'diplomatic_alliance' || actionType === 'trade_agreement') {
      return '#22c55e' // Verde
    }
    // Acciones negativas (rojo)
    if (actionType === 'military_action' || actionType === 'economic_sanction' || 
        actionType === 'cyber_attack' || actionType === 'regime_change' || 
        actionType === 'masonic_influence') {
      return '#ef4444' // Rojo
    }
    // Acciones neutrales (amarillo)
    return '#eab308' // Amarillo para otras acciones
  }

  // Función para generar trayectoria curva tipo misil entre dos puntos
  const generateSimplePath = (start: [number, number], end: [number, number], progress: number): string => {
    // Convertir coordenadas geográficas a coordenadas de píxeles
    const startPixels = projection(start)
    const endPixels = projection(end)
    
    if (!startPixels || !endPixels) return ""
    
    const [x1, y1] = startPixels
    const [x2, y2] = endPixels
    
    // Calcular punto de control para crear una curva tipo misil
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    
    // Altura de la curva reducida (más baja para movimiento más rápido)
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const curveHeight = Math.min(distance * 0.25, 80) // Altura reducida y máximo 80px
    
    // Punto de control elevado para crear el arco
    const controlX = midX
    const controlY = midY - curveHeight
    
    // Calcular posición actual en la curva usando interpolación acelerada
    const t = Math.pow(progress, 0.7) // Aceleración más rápida
    const currentX = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * controlX + t ** 2 * x2
    const currentY = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * controlY + t ** 2 * y2
    
    // Crear path curvo desde inicio hasta posición actual
    if (progress < 0.01) {
      return `M ${x1} ${y1}`
    }
    
    // Calcular punto de control proporcional al progreso acelerado
    const partialControlX = x1 + (controlX - x1) * Math.min(t * 2, 1)
    const partialControlY = y1 + (controlY - y1) * Math.min(t * 2, 1)
    
    return `M ${x1} ${y1} Q ${partialControlX} ${partialControlY} ${currentX} ${currentY}`
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
                    stroke={countryId ? getAllianceStrokeColor(countryId) : "#1f2937"}
                    strokeWidth={countryId === selectedCountry ? 2.5 : (countryId ? 1.5 : 0.5)} // Borde más grueso para alianzas y selección
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
          
          {/* Renderizar líneas curvas con efectos de impacto */}
          {activeAnimations.map((animation) => {
            const now = Date.now()
            const elapsed = now - animation.startTime
            const progress = Math.min(elapsed / animation.duration, 1)
            
            const sourceCoords = countryCoordinates[animation.sourceCountry]
            const targetCoords = countryCoordinates[animation.targetCountry]
            
            if (!sourceCoords || !targetCoords) return null
            
            const simplePath = generateSimplePath(sourceCoords, targetCoords, progress)
            const impactColor = getImpactColor(animation.actionType)
            const lineColor = impactColor
            
            // Convertir coordenadas del país de destino a píxeles
            const targetPixels = projection(targetCoords)
            if (!targetPixels) return null
            const [targetX, targetY] = targetPixels
            
            // Calcular opacidad de desvanecimiento cuando la línea llega al destino
            let lineOpacity = 0.9
            let glowOpacity = 0.5
            
            if (progress >= 0.85) {
              // Comenzar desvanecimiento en el último 15% del recorrido
              const fadeProgress = (progress - 0.85) / 0.15 // 0 a 1 en los últimos 15%
              lineOpacity = 0.9 * (1 - fadeProgress)
              glowOpacity = 0.5 * (1 - fadeProgress)
            }
            
            // Mostrar efecto de impacto cuando la línea llega al destino
            const showImpact = progress >= 0.85
            const impactProgress = Math.max(0, (progress - 0.85) / 0.15) // 0 a 1 en los últimos 15%
            const impactRadius = 8 + impactProgress * 15 // Crece de 8 a 23px
            const impactOpacity = Math.max(0, 0.8 - impactProgress * 0.8) // Desvanece de 0.8 a 0
            
            return (
              <g key={animation.id}>
                {/* Línea curva con color según el tipo de acción y desvanecimiento */}
                <path
                  d={simplePath}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="3"
                  strokeOpacity={lineOpacity}
                  strokeLinecap="round"
                />
                {/* Efecto de brillo con color más claro y desvanecimiento */}
                <path
                  d={simplePath}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="1"
                  strokeOpacity={glowOpacity}
                  strokeLinecap="round"
                  filter="blur(1px)"
                />
                
                {/* Círculo de impacto en el país de destino */}
                {showImpact && (
                  <g>
                    {/* Círculo exterior (más grande y transparente) */}
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r={impactRadius + 5}
                      fill={impactColor}
                      fillOpacity={impactOpacity * 0.3}
                      stroke={impactColor}
                      strokeWidth="2"
                      strokeOpacity={impactOpacity * 0.6}
                    />
                    {/* Círculo interior (más pequeño y opaco) */}
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r={impactRadius}
                      fill={impactColor}
                      fillOpacity={impactOpacity * 0.6}
                    />
                  </g>
                )}
              </g>
            )
          })}
          
          {/* Etiquetas "IA" para países controlados por IA */}
          <Geographies geography={geoUrl}>
            {({ geographies }) => {
              return aiCountries.map((aiCountry) => {
                // Encontrar la geografía correspondiente al país de IA
                const geography = geographies.find(geo => {
                  const countryId = getCountryData(geo.id)
                  return countryId === aiCountry.id
                })
                
                if (!geography) return null
                
                // Calcular el centroide de la geometría del país
                const centroid = geography.geometry.type === 'Polygon' 
                  ? getCentroid(geography.geometry.coordinates[0])
                  : geography.geometry.type === 'MultiPolygon'
                  ? getCentroid(geography.geometry.coordinates[0][0])
                  : null
                
                if (!centroid) return null
                
                const pixels = projection(centroid)
                if (!pixels) return null
                const [x, y] = pixels
                
                return (
                  <g key={`ai-label-${aiCountry.id}`}>
                    {/* Fondo semi-transparente para la etiqueta */}
                    <rect
                      x={x - 12}
                      y={y - 8}
                      width="24"
                      height="16"
                      fill="rgba(139, 92, 246, 0.9)"
                      stroke="#8b5cf6"
                      strokeWidth="1"
                      rx="3"
                      ry="3"
                    />
                    {/* Texto "IA" */}
                    <text
                      x={x}
                      y={y + 3}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      style={{ pointerEvents: 'none' }}
                    >
                      IA
                    </text>
                  </g>
                )
              })
            }}
          </Geographies>

        </ComposableMap>
      </div>

      {/* Leyenda horizontal en la parte inferior aprovechando el espacio de la Antártida */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3">
        <div className="flex flex-col gap-2">
          {/* Primera fila: Estados y estabilidad */}
          <div className="flex items-center justify-center gap-4 text-xs">
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
              <div className="px-1 py-0.5 bg-violet-500 text-white text-xs font-bold rounded border border-violet-400">IA</div>
              <span className="text-white">🤖 IA Activa</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded"></div>
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
          </div>
          
          {/* Segunda fila: Alianzas/Bloques Geopolíticos */}
          <div className="flex items-center justify-center gap-3 text-xs border-t border-gray-600 pt-2">
            <span className="text-gray-300 font-semibold">🌍 Alianzas (Bordes):</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-blue-500 rounded"></div>
              <span className="text-white">OTAN</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-yellow-400 rounded"></div>
              <span className="text-white">UE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-red-500 rounded"></div>
              <span className="text-white">BRICS</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-green-500 rounded"></div>
              <span className="text-white">África</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-orange-500 rounded"></div>
              <span className="text-white">Latinoamérica</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-purple-500 rounded"></div>
              <span className="text-white">Oriente Medio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-gray-500 rounded"></div>
              <span className="text-white">Neutrales</span>
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
    </div>
  )
}
