"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Country } from "@/lib/types"
import { Search, Crown, Users, DollarSign, Shield } from "lucide-react"

interface CountrySelectionModalProps {
  countries: Country[]
  onSelect: (country: Country) => void
}

export function CountrySelectionModal({ countries, onSelect }: CountrySelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  // Debug: Log cuando selectedCountry cambia
  console.log("🔄 Render del modal, selectedCountry actual:", selectedCountry?.name || "ninguno")

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.president.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = () => {
    console.log("🎯 handleSelect llamado, selectedCountry:", selectedCountry)
    if (selectedCountry) {
      console.log("✅ Llamando onSelect con:", selectedCountry.name)
      onSelect(selectedCountry)
    } else {
      console.log("❌ No hay país seleccionado")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl max-h-[80vh] bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl text-cyan-400 flex items-center gap-2 font-bold">
              <Crown className="w-6 h-6" />
              Selecciona tu País para Liderar
            </h2>
            {/* Debug info */}
            <div className="mt-2 text-xs text-yellow-400">
              Debug: Países cargados: {countries.length} | Seleccionado: {selectedCountry?.name || "ninguno"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar país o líder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredCountries.map((country) => (
                <div
                  key={country.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCountry?.id === country.id
                      ? "border-cyan-500 bg-cyan-900/20"
                      : "border-gray-600 bg-slate-800 hover:border-gray-500"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log("🖱️ País clickeado:", country.name)
                    setSelectedCountry(country)
                    console.log("✅ selectedCountry actualizado a:", country.name)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      {selectedCountry?.id === country.id && <span className="text-green-400">✅</span>}
                      {country.name}
                    </h3>
                    <div className="flex gap-2">
                      {selectedCountry?.id === country.id && (
                        <Badge className="bg-green-600 text-white text-xs animate-pulse">
                          SELECCIONADO
                        </Badge>
                      )}
                      {country.isSovereign && (
                        <Badge variant="outline" className="border-amber-500 text-amber-400 text-xs">
                          Soberano
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{country.president}</span>
                      <Badge variant="secondary" className="text-xs">
                        {country.ideology}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span className="text-gray-400">{(country.population / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-400">${country.economy.gdp}B</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span className="text-gray-400">{country.stability}%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {country.economy.resources.slice(0, 3).map((resource, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-600">
              <div className="text-sm">
                {selectedCountry ? (
                  <div className="text-green-400 font-semibold">
                    ✅ Seleccionado: <span className="text-white">{selectedCountry.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    👆 Selecciona un país para comenzar
                  </div>
                )}
              </div>
              <Button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSelect()
                }} 
                disabled={!selectedCountry} 
                className={`px-6 py-2 font-bold text-lg ${
                  selectedCountry 
                    ? "bg-green-600 hover:bg-green-700 text-white animate-pulse" 
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {selectedCountry ? "🚀 Comenzar Partida" : "Selecciona un País"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
