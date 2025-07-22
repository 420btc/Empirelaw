"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.president.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = () => {
    if (selectedCountry) {
      onSelect(selectedCountry)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400 flex items-center gap-2">
            <Crown className="w-6 h-6" />
            Selecciona tu País para Liderar
          </DialogTitle>
        </DialogHeader>

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
                onClick={() => setSelectedCountry(country)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white">{country.name}</h3>
                  {country.isSovereign && (
                    <Badge variant="outline" className="border-amber-500 text-amber-400 text-xs">
                      Soberano
                    </Badge>
                  )}
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
            <p className="text-sm text-gray-400">
              {selectedCountry ? `Seleccionado: ${selectedCountry.name}` : "Selecciona un país para comenzar"}
            </p>
            <Button onClick={handleSelect} disabled={!selectedCountry} className="bg-cyan-600 hover:bg-cyan-700">
              Comenzar Partida
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
