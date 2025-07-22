"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Country } from "@/lib/types"
import { Crown, Users, DollarSign, Shield, Scale, Zap, TrendingDown, AlertTriangle } from "lucide-react"

interface CountryPanelProps {
  country: Country | null
  isPlayerCountry: boolean
  countries?: Country[]
}

export function CountryPanel({ country, isPlayerCountry, countries = [] }: CountryPanelProps) {
  if (!country) {
    return (
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">Información del País</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Selecciona un país en el mapa para ver su información</p>
        </CardContent>
      </Card>
    )
  }

  const getStabilityColor = (stability: number) => {
    if (stability >= 85) return "text-green-600" // Verde fuerte
    if (stability >= 70) return "text-green-400" // Verde lima
    if (stability >= 50) return "text-yellow-400" // Amarillo
    if (stability >= 30) return "text-orange-400" // Naranja
    if (stability >= 15) return "text-red-400" // Rojo
    if (stability >= 1) return "text-red-900" // Rojo oscuro
    return "text-gray-700" // Gris oscuro/negro
  }

  const getDebtColor = (debt: number) => {
    if (debt <= 50) return "text-green-400"
    if (debt <= 100) return "text-yellow-400"
    if (debt <= 150) return "text-orange-400"
    return "text-red-400"
  }

  const getPowerLevelColor = (powerLevel?: string) => {
    switch (powerLevel) {
      case "superpower":
        return "bg-red-600"
      case "major":
        return "bg-blue-600"
      case "regional":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  const getPowerLevelText = (powerLevel?: string) => {
    switch (powerLevel) {
      case "superpower":
        return "Superpotencia"
      case "major":
        return "Potencia Mayor"
      case "regional":
        return "Potencia Regional"
      default:
        return "Potencia Menor"
    }
  }

  const getIdeologyColor = (ideology: string) => {
    switch (ideology.toLowerCase()) {
      case "capitalismo":
        return "bg-blue-600"
      case "socialismo":
        return "bg-red-600"
      case "autoritarismo":
        return "bg-purple-600"
      case "neutralidad":
        return "bg-gray-600"
      default:
        return "bg-slate-600"
    }
  }

  const getBlockColor = (block?: string) => {
    switch (block) {
      case "nato":
        return "text-blue-400"
      case "eu":
        return "text-yellow-400"
      case "brics":
        return "text-red-400"
      case "africa":
        return "text-green-400"
      case "latin_america":
        return "text-orange-400"
      case "middle_east":
        return "text-purple-400"
      case "neutral":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getBlockName = (block?: string) => {
    switch (block) {
      case "nato":
        return "OTAN/Occidente"
      case "eu":
        return "Unión Europea"
      case "brics":
        return "BRICS+"
      case "africa":
        return "Unión Africana"
      case "latin_america":
        return "América Latina"
      case "middle_east":
        return "Oriente Medio"
      case "neutral":
        return "Neutral"
      default:
        return "Sin Bloque"
    }
  }

  return (
    <Card className="bg-slate-800/50 border-cyan-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            {isPlayerCountry && <Crown className="w-5 h-5 text-yellow-400" />}
            {country.name}
          </CardTitle>
          <div className="flex gap-2">
            {country.isSovereign && (
              <Badge variant="outline" className="border-amber-500 text-amber-400">
                Estado Soberano
              </Badge>
            )}
            <Badge className={getPowerLevelColor(country.powerLevel)}>{getPowerLevelText(country.powerLevel)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Líder:</span>
            </div>
            <p className="font-semibold text-white">{country.president}</p>
            <Badge className={getIdeologyColor(country.ideology)}>{country.ideology}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Población:</span>
            </div>
            <p className="font-semibold text-white">{(country.population / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Estabilidad:</span>
              </div>
              <span className={`font-semibold ${getStabilityColor(country.stability)}`}>{country.stability}%</span>
            </div>
            <Progress value={country.stability} className="h-2" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">Economía:</span>
            </div>
            <p className="font-semibold text-white">${country.economy.gdp}B PIB</p>

            {/* Nuevo: Mostrar deuda */}
            <div className="flex items-center justify-between mt-1 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Deuda:</span>
              </div>
              <span className={`text-xs font-semibold truncate max-w-[80px] ${getDebtColor(country.economy.debt)}`}>{country.economy.debt}% PIB</span>
            </div>

            {country.economy.debt > 100 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-orange-400">Alto endeudamiento</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1 mt-2">
              {country.economy.resources.map((resource, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {resource}
                </Badge>
              ))}
            </div>
          </div>

          {/* Nuevo: Mostrar bloque geopolítico */}
          <div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-300">Bloque Geopolítico:</span>
            </div>
            <Badge variant="outline" className={getBlockColor(country.geopoliticalBlock)}>
              {getBlockName(country.geopoliticalBlock)}
            </Badge>
          </div>

          {/* Mostrar alianzas */}
          {country.alliances && country.alliances.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Alianzas:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {country.alliances.slice(0, 4).map((allyId, index) => {
                  const allyCountry = countries.find(c => c.id === allyId)
                  const allyName = allyCountry ? allyCountry.name : allyId.toUpperCase()
                  return (
                    <Badge key={index} variant="outline" className="text-xs border-green-500 text-green-400">
                      {allyName}
                    </Badge>
                  )
                })}
                {country.alliances.length > 4 && (
                  <Badge variant="outline" className="text-xs text-gray-400">
                    +{country.alliances.length - 4} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-300">Sistema Legal:</span>
            </div>
            <Badge variant={country.legalSystem === "natural" ? "default" : "secondary"}>
              Ley {country.legalSystem === "natural" ? "Natural" : "Positiva"}
            </Badge>
          </div>

          {country.conspiracyInfluence && (
            <div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Zap className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Influencia Conspirativa:</span>
              </div>
              <div className="space-y-1">
                {Object.entries(country.conspiracyInfluence).map(([type, level]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="capitalize text-gray-400">{type}:</span>
                    <span className="text-red-400">{level}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
