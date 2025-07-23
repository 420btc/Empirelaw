"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Country, TradeOffer, ResourcePrice, TradeHistory } from "@/lib/types"
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  Package,
  DollarSign,
  Globe,
  ArrowUpDown,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react"
import { TradingChart } from "@/components/trading-chart"

interface MarketOrder {
  id: string
  type: 'buy' | 'sell'
  resource: string
  quantity: number
  price: number
  timestamp: number
  status: 'pending' | 'filled' | 'cancelled'
}

interface WorldTradeCenterProps {
  playerCountry: Country
  countries: Country[]
  onClose: () => void
  onTradeExecuted: (trade: TradeOffer) => void
}

export function WorldTradeCenter({ playerCountry, countries, onClose, onTradeExecuted }: WorldTradeCenterProps) {
  const [activeOffers, setActiveOffers] = useState<TradeOffer[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>([])
  const [selectedTradingResource, setSelectedTradingResource] = useState<string>("")

  // --- Persistencia en localStorage ---
  // Cargar historial, ofertas activas y órdenes de mercado al montar
  useEffect(() => {
    const savedHistory = localStorage.getItem("tradeHistory")
    const savedOffers = localStorage.getItem("activeOffers")
    const savedMarketOrders = localStorage.getItem("marketOrders")
    const savedTradingResource = localStorage.getItem("selectedTradingResource")
    
    if (savedHistory) setTradeHistory(JSON.parse(savedHistory))
    if (savedOffers) setActiveOffers(JSON.parse(savedOffers))
    if (savedMarketOrders) setMarketOrders(JSON.parse(savedMarketOrders))
    if (savedTradingResource) setSelectedTradingResource(savedTradingResource)
  }, [])

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("tradeHistory", JSON.stringify(tradeHistory))
  }, [tradeHistory])

  // Guardar ofertas activas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("activeOffers", JSON.stringify(activeOffers))
  }, [activeOffers])

  // Guardar órdenes de mercado en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("marketOrders", JSON.stringify(marketOrders))
  }, [marketOrders])

  // Guardar recurso de trading seleccionado
  useEffect(() => {
    localStorage.setItem("selectedTradingResource", selectedTradingResource)
  }, [selectedTradingResource])

  const [resourcePrices, setResourcePrices] = useState<ResourcePrice[]>([])

  // Auto-seleccionar el primer recurso disponible si no hay ninguno seleccionado
  useEffect(() => {
    if (!selectedTradingResource && resourcePrices.length > 0) {
      setSelectedTradingResource(resourcePrices[0].resource)
    }
  }, [selectedTradingResource, resourcePrices])

  // Función para manejar nuevas órdenes de mercado
  const handleMarketOrder = (order: MarketOrder) => {
    setMarketOrders(prev => [...prev, order])
    
    // Agregar al historial de comercio
    const newTrade: TradeHistory = {
      id: order.id,
      fromCountry: playerCountry.id,
      toCountry: "market", // Mercado global
      resource: order.resource,
      quantity: order.quantity,
      pricePerUnit: order.price,
      totalValue: order.quantity * order.price,
      timestamp: order.timestamp
    }
    
    setTradeHistory(prev => [...prev, newTrade])
  }
  const [selectedResource, setSelectedResource] = useState<string>("")
  const [offerQuantity, setOfferQuantity] = useState<number>(0)
  const [requestQuantity, setRequestQuantity] = useState<number>(0)
  const [selectedPartner, setSelectedPartner] = useState<string>("")

  // Lista de todos los recursos disponibles
  const allResources = [
    "petróleo",
    "gas natural",
    "carbón",
    "oro",
    "plata",
    "cobre",
    "hierro",
    "litio",
    "tierras raras",
    "uranio",
    "diamantes",
    "trigo",
    "maíz",
    "soja",
    "arroz",
    "café",
    "azúcar",
    "algodón",
    "madera",
    "pescado",
    "tecnología",
    "semiconductores",
    "medicinas",
    "armas",
  ]

  // Inicializar precios de recursos
  useEffect(() => {
    const initialPrices: ResourcePrice[] = allResources.map((resource) => ({
      resource,
      currentPrice: Math.floor(Math.random() * 1000) + 100, // $100-$1100 por unidad
      trend: Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable",
      weeklyChange: (Math.random() - 0.5) * 20, // -10% a +10%
      demand: Math.floor(Math.random() * 1000) + 500,
      supply: Math.floor(Math.random() * 1000) + 500,
    }))
    setResourcePrices(initialPrices)
  }, [])

  // Simular fluctuaciones de precios
  useEffect(() => {
    const interval = setInterval(() => {
      setResourcePrices((prev) =>
        prev.map((price) => {
          const change = (Math.random() - 0.5) * 50 // Cambio de -$25 a +$25
          const newPrice = Math.max(50, price.currentPrice + change)
          const weeklyChange = ((newPrice - price.currentPrice) / price.currentPrice) * 100

          return {
            ...price,
            currentPrice: Math.floor(newPrice),
            trend: change > 5 ? "up" : change < -5 ? "down" : "stable",
            weeklyChange: Math.floor(weeklyChange * 100) / 100,
          }
        }),
      )
    }, 15000) // Actualizar precios cada 15 segundos

    return () => clearInterval(interval)
  }, [])

  const getResourceIcon = (resource: string) => {
    const icons: Record<string, string> = {
      petróleo: "🛢️",
      "gas natural": "🔥",
      carbón: "⚫",
      oro: "🥇",
      plata: "🥈",
      cobre: "🟤",
      hierro: "⚙️",
      litio: "🔋",
      "tierras raras": "💎",
      uranio: "☢️",
      diamantes: "💍",
      trigo: "🌾",
      maíz: "🌽",
      soja: "🫘",
      arroz: "🍚",
      café: "☕",
      azúcar: "🍯",
      algodón: "🤍",
      madera: "🪵",
      pescado: "🐟",
      tecnología: "💻",
      semiconductores: "🔌",
      medicinas: "💊",
      armas: "🔫",
    }
    return icons[resource] || "📦"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const createTradeOffer = () => {
    if (!selectedResource || !selectedPartner || offerQuantity <= 0 || requestQuantity <= 0) return

    const resourcePrice = resourcePrices.find((p) => p.resource === selectedResource)
    if (!resourcePrice) return

    const newOffer: TradeOffer = {
      id: Date.now().toString(),
      fromCountry: playerCountry.id,
      toCountry: selectedPartner,
      offering: { [selectedResource]: offerQuantity },
      requesting: { money: requestQuantity },
      pricePerUnit: requestQuantity / offerQuantity,
      totalValue: requestQuantity,
      status: "pending",
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    }

    setActiveOffers((prev) => {
      const updated = [...prev, newOffer]
      localStorage.setItem("activeOffers", JSON.stringify(updated))
      return updated
    })

    // IA inteligente para respuesta de comercio
    setTimeout(
      () => {
        const partnerCountry = countries.find(c => c.id === selectedPartner)
        if (!partnerCountry) return

        // Calcular si la oferta es atractiva para el país objetivo
        const marketPrice = resourcePrice.currentPrice
        const offerPrice = newOffer.pricePerUnit
        const priceRatio = offerPrice / marketPrice

        let acceptanceProbability = 0.5 // Base 50%

        // Factor 1: Precio atractivo (mejor precio = más probabilidad)
        if (priceRatio <= 0.8) acceptanceProbability += 0.3 // 30% bonus si es 20% más barato
        else if (priceRatio <= 0.9) acceptanceProbability += 0.2 // 20% bonus si es 10% más barato
        else if (priceRatio >= 1.2) acceptanceProbability -= 0.3 // -30% si es 20% más caro
        else if (priceRatio >= 1.1) acceptanceProbability -= 0.2 // -20% si es 10% más caro

        // Factor 2: Capacidad económica del país (más PIB = más probable comprar)
        const economicFactor = Math.min(0.2, partnerCountry.economy.gdp / 10000) // Máximo 20% bonus
        acceptanceProbability += economicFactor

        // Factor 3: Nivel de deuda (más deuda = menos probable comprar)
        if (partnerCountry.economy.debt > 100) acceptanceProbability -= 0.2
        else if (partnerCountry.economy.debt > 150) acceptanceProbability -= 0.4

        // Factor 4: Estabilidad del país (más estable = más comercio)
        const stabilityFactor = (partnerCountry.stability - 50) / 100 * 0.2 // -20% a +20%
        acceptanceProbability += stabilityFactor

        // Factor 5: Relaciones diplomáticas
        const diplomaticRelation = partnerCountry.diplomaticRelations?.[playerCountry.id] || 0
        const diplomaticFactor = diplomaticRelation / 100 * 0.25 // -25% a +25%
        acceptanceProbability += diplomaticFactor

        // Factor 6: Necesidad del recurso (si no lo tiene = más probable)
        const hasResource = partnerCountry.economy.resources.includes(selectedResource)
        if (!hasResource) acceptanceProbability += 0.15

        // Limitar entre 5% y 95%
        acceptanceProbability = Math.max(0.05, Math.min(0.95, acceptanceProbability))

        const success = Math.random() < acceptanceProbability

        console.log(`🤖 IA Comercial - ${partnerCountry.name}:`, {
          offerPrice: offerPrice.toFixed(2),
          marketPrice: marketPrice.toFixed(2),
          priceRatio: priceRatio.toFixed(2),
          acceptanceProbability: (acceptanceProbability * 100).toFixed(1) + '%',
          result: success ? 'ACEPTADO' : 'RECHAZADO'
        })

        setActiveOffers((prev) => {
          const updated = prev.map((offer) =>
            offer.id === newOffer.id ? { ...offer, status: (success ? "accepted" : "rejected") as "accepted" | "rejected" } : offer
          )
          localStorage.setItem("activeOffers", JSON.stringify(updated))
          return updated
        })

        if (success) {
          onTradeExecuted(newOffer)
          const historyEntry: TradeHistory = {
            id: newOffer.id,
            fromCountry: newOffer.fromCountry,
            toCountry: newOffer.toCountry,
            resource: selectedResource,
            quantity: offerQuantity,
            pricePerUnit: newOffer.pricePerUnit,
            totalValue: newOffer.totalValue,
            timestamp: Date.now(),
          }
          setTradeHistory((prev) => {
            const updated = [...prev, historyEntry]
            localStorage.setItem("tradeHistory", JSON.stringify(updated))
            return updated
          })
        }
      },
      6000, // Exactamente 6 segundos como solicitaste
    )

    // Limpiar formulario
    setSelectedResource("")
    setOfferQuantity(0)
    setRequestQuantity(0)
    setSelectedPartner("")
  }

  const getCountryResources = (country: Country) => {
    return country.economy.resources || []
  }

  const getCountryReserves = (country: Country, resource: string) => {
    return country.economy.resourceReserves?.[resource] || 0
  }

  const getCountryProduction = (country: Country, resource: string) => {
    return country.economy.resourceProduction?.[resource] || 0
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[85vh] bg-slate-900 border-green-500/30 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Centro Mundial de Comercio
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="market" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="market">Mercado Global</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="trade">Crear Oferta</TabsTrigger>
              <TabsTrigger value="offers">Ofertas Activas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                {/* Precios de Recursos */}
                <Card className="bg-slate-800/50 flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Precios Globales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-2">
                        {resourcePrices.map((price) => (
                          <div
                            key={price.resource}
                            className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getResourceIcon(price.resource)}</span>
                              <span className="text-white capitalize">{price.resource}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(price.trend)}
                              <span className="text-white font-semibold">${price.currentPrice}</span>
                              <span className={`text-xs ${getTrendColor(price.trend)}`}>
                                {price.weeklyChange > 0 ? "+" : ""}
                                {price.weeklyChange.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Recursos por País */}
                <Card className="bg-slate-800/50 flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Recursos por País
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-3">
                        {countries
                          .filter((c) => !c.ownedBy)
                          .map((country) => (
                            <div key={country.id} className="p-3 bg-slate-700/50 rounded-lg">
                              <h4 className="font-semibold text-white mb-2">{country.name}</h4>
                              <div className="flex flex-wrap gap-1">
                                {getCountryResources(country).map((resource) => (
                                  <Badge key={resource} variant="outline" className="text-xs">
                                    {getResourceIcon(resource)} {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trading" className="flex-1 overflow-hidden">
              <div className="h-full">
                {selectedTradingResource ? (
                  <TradingChart
                    resource={selectedTradingResource}
                    currentPrice={resourcePrices.find(p => p.resource === selectedTradingResource)?.currentPrice || 100}
                    onOrderPlaced={handleMarketOrder}
                    playerCountry={{
                      resources: playerCountry.economy.resourceReserves,
                      treasury: playerCountry.economy.gdp
                    }}
                    availableSupply={(() => {
                      // Calcular suministro disponible basado en otros países
                      const totalSupply = countries
                        .filter(c => c.id !== playerCountry.id)
                        .reduce((sum, country) => {
                          return sum + (country.economy.resourceReserves[selectedTradingResource] || 0)
                        }, 0)
                      return Math.floor(totalSupply * 0.1) // Solo 10% está disponible para comercio
                    })()}
                    onResourceChange={setSelectedTradingResource}
                    availableResources={resourcePrices.map(p => p.resource)}
                  />
                ) : (
                  <Card className="bg-slate-800/50 h-full flex items-center justify-center">
                    <CardContent className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-white mb-2">Selecciona un Recurso</h3>
                      <p className="text-gray-400 mb-6">Elige un recurso para ver sus gráficas de precios y realizar órdenes de mercado</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl">
                        {resourcePrices.slice(0, 12).map((price) => (
                          <Button
                            key={price.resource}
                            variant="outline"
                            onClick={() => setSelectedTradingResource(price.resource)}
                            className="p-4 h-auto flex flex-col items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border-slate-600"
                          >
                            <span className="text-2xl">{getResourceIcon(price.resource)}</span>
                            <span className="text-sm text-white capitalize">{price.resource}</span>
                            <span className="text-xs text-green-400">${price.currentPrice}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="trade" className="flex-1">
              <Card className="bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5" />
                    Crear Nueva Oferta Comercial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Recurso a Ofrecer</label>
                      <select
                        value={selectedResource}
                        onChange={(e) => setSelectedResource(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Seleccionar recurso...</option>
                        {getCountryResources(playerCountry).map((resource) => (
                          <option key={resource} value={resource}>
                            {getResourceIcon(resource)} {resource}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">País Destino</label>
                      <select
                        value={selectedPartner}
                        onChange={(e) => setSelectedPartner(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Seleccionar país...</option>
                        {countries
                          .filter((c) => c.id !== playerCountry.id && !c.ownedBy)
                          .map((country) => (
                            <option key={country.id} value={country.id}>
                              {country.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cantidad a Ofrecer</label>
                      <Input
                        type="number"
                        value={offerQuantity}
                        onChange={(e) => setOfferQuantity(Number(e.target.value))}
                        className="bg-slate-700 border-gray-600"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Precio Solicitado ($B)</label>
                      <Input
                        type="number"
                        value={requestQuantity}
                        onChange={(e) => setRequestQuantity(Number(e.target.value))}
                        className="bg-slate-700 border-gray-600"
                        min="1"
                      />
                    </div>
                  </div>

                  {selectedResource && offerQuantity > 0 && requestQuantity > 0 && (
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-gray-300">
                        Precio por unidad:{" "}
                        <span className="text-green-400">${(requestQuantity / offerQuantity).toFixed(2)}</span>
                      </p>
                      <p className="text-sm text-gray-300">
                        Precio de mercado:{" "}
                        <span className="text-yellow-400">
                          ${resourcePrices.find((p) => p.resource === selectedResource)?.currentPrice || 0}
                        </span>
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={createTradeOffer}
                    disabled={!selectedResource || !selectedPartner || offerQuantity <= 0 || requestQuantity <= 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Crear Oferta Comercial
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="flex-1">
              <Card className="bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Ofertas Comerciales Activas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {activeOffers.length > 0 ? (
                        activeOffers.map((offer) => {
                          const fromCountry = countries.find((c) => c.id === offer.fromCountry)
                          const toCountry = countries.find((c) => c.id === offer.toCountry)
                          const resource = Object.keys(offer.offering)[0]
                          const quantity = Object.values(offer.offering)[0]

                          return (
                            <div key={offer.id} className="p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium">
                                    {fromCountry?.name} → {toCountry?.name}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {getResourceIcon(resource)} {quantity} {resource} por ${offer.totalValue}B
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {offer.status === "pending" && (
                                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pendiente
                                    </Badge>
                                  )}
                                  {offer.status === "accepted" && (
                                    <Badge variant="outline" className="text-green-400 border-green-400">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Aceptada
                                    </Badge>
                                  )}
                                  {offer.status === "rejected" && (
                                    <Badge variant="outline" className="text-red-400 border-red-400">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Rechazada
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No hay ofertas comerciales activas</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="flex-1">
              <Card className="bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Historial de Comercio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {tradeHistory.length > 0 ? (
                        tradeHistory.reverse().map((trade) => {
                          const fromCountry = countries.find((c) => c.id === trade.fromCountry)
                          const toCountry = countries.find((c) => c.id === trade.toCountry)

                          return (
                            <div key={trade.id} className="p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium">
                                    {fromCountry?.name} → {toCountry?.name}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {getResourceIcon(trade.resource)} {trade.quantity} {trade.resource}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-green-400 font-semibold">${trade.totalValue}B</p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(trade.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No hay historial de comercio</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
