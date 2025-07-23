"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, BarChart3, DollarSign, ShoppingCart } from "lucide-react"

interface PricePoint {
  timestamp: number
  price: number
  volume: number
}

interface MarketOrder {
  id: string
  type: 'buy' | 'sell'
  resource: string
  quantity: number
  price: number
  timestamp: number
  status: 'pending' | 'filled' | 'cancelled'
}

interface TradingChartProps {
  resource: string
  currentPrice: number
   onOrderPlaced: (order: MarketOrder) => void
  playerCountry: {
    resources: { [key: string]: number }
    treasury: number
  }
  availableSupply?: number
  onResourceChange?: (resource: string) => void
  availableResources?: string[]
}

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

export function TradingChart({ resource, currentPrice, onOrderPlaced, playerCountry, availableSupply = 1000000, onResourceChange, availableResources = [] }: TradingChartProps) {
  console.log('TradingChart initialized with:', { resource, currentPrice, playerResources: playerCountry.resources[resource] })
  
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [orders, setOrders] = useState<MarketOrder[]>([])
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [orderQuantity, setOrderQuantity] = useState<number>(1)
  const [orderPrice, setOrderPrice] = useState<number>(currentPrice)
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1h')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Recursos del jugador
  const playerResourceAmount = playerCountry.resources[resource] || 0
  const playerTreasury = playerCountry.treasury || 0
  
  // Límites de transacción
  const maxSellQuantity = playerResourceAmount
  const maxBuyQuantity = Math.floor(playerTreasury / (orderPrice || currentPrice))
  const maxBuyFromSupply = Math.min(availableSupply, maxBuyQuantity)
  
  // Actualizar precio de orden cuando cambie el precio actual
  useEffect(() => {
    if (orderPrice === 0) {
      setOrderPrice(currentPrice)
    }
  }, [currentPrice])

  // Cargar datos guardados
  useEffect(() => {
    const savedOrders = localStorage.getItem(`orders_${resource}`)
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (error) {
        console.error('Error loading saved orders:', error)
        localStorage.removeItem(`orders_${resource}`)
      }
    }
  }, [resource])
  
  // Cargar historial según temporalidad
  useEffect(() => {
    const savedHistory = localStorage.getItem(`priceHistory_${resource}_${timeframe}`)
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        console.log('Loaded saved', timeframe, 'price history:', parsedHistory.length, 'points')
        if (parsedHistory.length > 0) {
          setPriceHistory(parsedHistory)
        } else {
          generateInitialHistory()
        }
      } catch (error) {
        console.error('Error loading saved price history:', error)
        localStorage.removeItem(`priceHistory_${resource}_${timeframe}`)
        generateInitialHistory()
      }
    } else {
      generateInitialHistory()
    }
  }, [resource, timeframe])

  // Guardar órdenes cuando cambien
  useEffect(() => {
    localStorage.setItem(`orders_${resource}`, JSON.stringify(orders))
  }, [orders, resource])

  // Guardar historial de precios cuando cambie
  useEffect(() => {
    if (priceHistory.length > 0) {
      localStorage.setItem(`priceHistory_${resource}`, JSON.stringify(priceHistory))
      console.log('Saved price history:', priceHistory.length, 'points')
    }
  }, [priceHistory, resource])

  // Actualizar precio actual
  useEffect(() => {
    setOrderPrice(currentPrice)
    
    // Agregar nuevo punto de precio cada minuto (simulado)
    const interval = setInterval(() => {
      const newPrice = currentPrice + (Math.random() - 0.5) * currentPrice * 0.02 // ±2% variación
      const newPoint: PricePoint = {
        timestamp: Date.now(),
        price: newPrice,
        volume: Math.floor(Math.random() * 1000) + 100
      }
      
      setPriceHistory(prev => {
        const updated = [...prev, newPoint]
        // Mantener solo los últimos 100 puntos
        return updated.slice(-100)
      })
    }, 60000) // Cada minuto

    return () => clearInterval(interval)
  }, [currentPrice])

  // Generar historial inicial basado en temporalidad
  const generateInitialHistory = () => {
    console.log('Generating initial history for', resource, 'with base price:', currentPrice, 'timeframe:', timeframe)
    const history: PricePoint[] = []
    let price = currentPrice || 100
    const now = Date.now()
    
    // Configuración según temporalidad
    const timeConfig = {
      '1h': { points: 60, interval: 60000, volatility: 0.02 }, // 1 minuto cada punto
      '4h': { points: 48, interval: 300000, volatility: 0.03 }, // 5 minutos cada punto
      '1d': { points: 24, interval: 3600000, volatility: 0.05 }, // 1 hora cada punto
      '1w': { points: 168, interval: 3600000, volatility: 0.08 } // 1 hora cada punto, 7 días
    }
    
    const config = timeConfig[timeframe]
    
    // Generar tendencia general (alcista, bajista o lateral)
    const trendType = Math.random()
    let trendDirection = 0
    if (trendType < 0.4) trendDirection = 0.001 // Tendencia alcista
    else if (trendType < 0.8) trendDirection = -0.001 // Tendencia bajista
    // else lateral (0)
    
    for (let i = config.points - 1; i >= 0; i--) {
      const timestamp = now - (i * config.interval)
      
      // Aplicar tendencia + volatilidad
      const trend = price * trendDirection
      const volatility = (Math.random() - 0.5) * price * config.volatility
      price = Math.max(price + trend + volatility, 1)
      
      // Volumen más realista (mayor en movimientos grandes)
      const priceChange = Math.abs(volatility / price)
      const baseVolume = 100 + Math.random() * 500
      const volume = Math.floor(baseVolume * (1 + priceChange * 10))
      
      history.push({
        timestamp,
        price: Math.round(price * 100) / 100,
        volume
      })
    }
    
    console.log('Generated', timeframe, 'history:', history.length, 'points, price range:', 
      Math.min(...history.map(h => h.price)).toFixed(2), '-', 
      Math.max(...history.map(h => h.price)).toFixed(2))
    
    setPriceHistory(history)
    
    try {
      localStorage.setItem(`priceHistory_${resource}_${timeframe}`, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving price history to localStorage:', error)
    }
  }

  // Función para dibujar el gráfico
  const drawChart = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (priceHistory.length === 0) {
      ctx.fillStyle = '#64748b'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Cargando datos...', canvas.width / 2, canvas.height / 2)
      return
    }
    
    console.log('Drawing chart with', priceHistory.length, 'data points')

    const padding = 60
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Calcular rango de precios con validación
    const prices = priceHistory.map(p => p.price).filter(p => p > 0)
    if (prices.length === 0) {
      ctx.fillStyle = '#ef4444'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('No hay datos de precios válidos', canvas.width / 2, canvas.height / 2)
      return
    }

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    console.log('Price range:', minPrice, 'to', maxPrice, 'range:', priceRange)

    // Dibujar fondo completo
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Fondo del área del gráfico
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(padding, padding, chartWidth, chartHeight)

    // Líneas de cuadrícula horizontales
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
      
      // Etiquetas de precio
      const price = maxPrice - (priceRange / 5) * i
      ctx.fillStyle = '#CBD5E1'
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 4)
    }

    // Líneas verticales (tiempo) con etiquetas
    const timePoints = 6
    for (let i = 0; i <= timePoints; i++) {
      const x = padding + (chartWidth / timePoints) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, padding + chartHeight)
      ctx.stroke()
      
      // Etiquetas de tiempo
      if (i < priceHistory.length) {
        const pointIndex = Math.floor((priceHistory.length - 1) * (i / timePoints))
        const timestamp = priceHistory[pointIndex]?.timestamp
        if (timestamp) {
          const time = new Date(timestamp).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          ctx.fillStyle = '#9ca3af'
          ctx.font = '10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(time, x, canvas.height - padding + 15)
        }
      }
    }

    // Dibujar línea de precios
    if (priceHistory.length > 1) {
      ctx.strokeStyle = '#22C55E'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      let validPointsDrawn = 0
      priceHistory.forEach((point, index) => {
        if (point.price > 0) {
          const x = padding + (chartWidth / (priceHistory.length - 1)) * index
          const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
          
          if (validPointsDrawn === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
          validPointsDrawn++
        }
      })
      
      ctx.stroke()
      
      // Dibujar puntos en la línea
      ctx.fillStyle = '#22C55E'
      priceHistory.forEach((point, index) => {
        if (point.price > 0) {
          const x = padding + (chartWidth / (priceHistory.length - 1)) * index
          const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
          
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fill()
          
          // Borde blanco en los puntos
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
      
      console.log('Chart line drawn with', validPointsDrawn, 'valid points')
    } else {
      console.log('Not enough data points to draw line')
    }

  }

  // Regenerar datos cuando cambie el precio actual
  useEffect(() => {
    if (currentPrice && currentPrice > 0 && priceHistory.length === 0) {
      console.log('Current price changed to:', currentPrice, 'generating new history')
      generateInitialHistory()
    }
  }, [currentPrice, resource])
  
  // Dibujar gráfica
  useEffect(() => {
    console.log('Drawing chart effect triggered, priceHistory length:', priceHistory.length)
    drawChart()
  }, [priceHistory])
  
  // Redraw cuando el canvas esté listo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current && priceHistory.length > 0) {
        console.log('Canvas ready, redrawing chart')
        drawChart()
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const placeOrder = () => {
    if (orderQuantity <= 0 || orderPrice <= 0) return
    
    // Validar límites
    if (orderType === 'sell' && orderQuantity > maxSellQuantity) {
      alert(`No puedes vender más de ${maxSellQuantity} unidades de ${resource}. Tienes ${playerResourceAmount} en tu inventario.`)
      return
    }
    
    if (orderType === 'buy') {
      const totalCost = orderQuantity * orderPrice
      if (totalCost > playerTreasury) {
        alert(`No tienes suficiente dinero. Necesitas $${totalCost.toFixed(2)} pero solo tienes $${playerTreasury.toFixed(2)}.`)
        return
      }
      if (orderQuantity > availableSupply) {
        alert(`No hay suficiente ${resource} disponible en el mercado. Máximo disponible: ${availableSupply} unidades.`)
        return
      }
    }

    const newOrder: MarketOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: orderType,
      resource,
      quantity: orderQuantity,
      price: orderPrice,
      timestamp: Date.now(),
      status: 'pending'
    }

    setOrders(prev => [...prev, newOrder])
    onOrderPlaced(newOrder)
    
    // Simular ejecución de orden después de un delay
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id 
          ? { ...order, status: 'filled' }
          : order
      ))
    }, Math.random() * 5000 + 1000) // 1-6 segundos
    
    // Reset form
    setOrderQuantity(1)
    setOrderPrice(currentPrice)
  }

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'cancelled' }
        : order
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'text-green-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-green-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-yellow-600'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Gráfica de Precios */}
      <div className="lg:col-span-2">
        <Card className="bg-slate-800/50 h-full">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  {onResourceChange && availableResources.length > 0 ? (
                    <Select value={resource} onValueChange={onResourceChange}>
                      <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getResourceIcon(resource)}</span>
                            <span className="text-white font-semibold">{resource}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {availableResources.map((res) => (
                          <SelectItem key={res} value={res} className="text-white hover:bg-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getResourceIcon(res)}</span>
                              <span>{res}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <h3 className="text-lg font-semibold text-white">{resource}</h3>
                  )}
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    ${currentPrice.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  {['1H', '4H', '1D', '1W'].map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(tf.toLowerCase() as '1h' | '4h' | '1d' | '1w')}
                      className="text-xs"
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Información del jugador */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Tus {resource}</p>
                  <p className="text-white font-semibold">
                    {playerResourceAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Tu Dinero</p>
                  <p className="text-green-400 font-semibold">
                    ${playerTreasury.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Disponible</p>
                  <p className="text-blue-400 font-semibold">
                    {availableSupply.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 border border-slate-600 rounded-lg bg-slate-900 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="absolute inset-0 w-full h-full"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Volumen 24h</p>
                <p className="text-white font-semibold">
                  {priceHistory.reduce((sum, p) => sum + p.volume, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Máximo 24h</p>
                <p className="text-green-400 font-semibold">
                  ${Math.max(...priceHistory.map(p => p.price)).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Mínimo 24h</p>
                <p className="text-red-400 font-semibold">
                  ${Math.min(...priceHistory.map(p => p.price)).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Trading */}
      <div className="space-y-4">
        {/* Crear Orden */}
        <Card className="bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Crear Orden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={orderType === 'buy' ? "default" : "outline"}
                onClick={() => setOrderType('buy')}
                className="bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar
              </Button>
              <Button
                variant={orderType === 'sell' ? "default" : "outline"}
                onClick={() => setOrderType('sell')}
                className="bg-red-600 hover:bg-red-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Vender
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad {orderType === 'sell' ? `(máx: ${maxSellQuantity})` : `(máx: ${maxBuyFromSupply})`}
              </label>
              <Input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="bg-slate-700 border-gray-600 text-white"
                min="1"
                max={orderType === 'sell' ? maxSellQuantity : maxBuyFromSupply}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio por unidad
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(Number(e.target.value))}
                  className="bg-slate-700 border-gray-600 text-white flex-1"
                  min="0.01"
                  step="0.01"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrderPrice(currentPrice)}
                  className="text-xs"
                >
                  Mercado
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Total:</span>
                <span className="text-white font-semibold">
                  ${(orderQuantity * orderPrice).toFixed(2)}
                </span>
              </div>
              {orderType === 'buy' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Dinero restante:</span>
                  <span className={`font-semibold ${
                    playerTreasury - (orderQuantity * orderPrice) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    ${(playerTreasury - (orderQuantity * orderPrice)).toFixed(2)}
                  </span>
                </div>
              )}
              {orderType === 'sell' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Recursos restantes:</span>
                  <span className={`font-semibold ${
                    playerResourceAmount - orderQuantity >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {playerResourceAmount - orderQuantity}
                  </span>
                </div>
              )}
            </div>
            
            <Button
              onClick={placeOrder}
              disabled={
                orderQuantity <= 0 || 
                orderPrice <= 0 ||
                (orderType === 'sell' && orderQuantity > maxSellQuantity) ||
                (orderType === 'buy' && (
                  orderQuantity * orderPrice > playerTreasury ||
                  orderQuantity > availableSupply
                ))
              }
              className={`w-full ${
                orderType === 'buy' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {orderType === 'buy' ? 'Comprar' : 'Vender'} {resource}
            </Button>
          </CardContent>
        </Card>

        {/* Órdenes Activas */}
        <Card className="bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Órdenes ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orders.slice(-10).reverse().map((order) => (
                <div key={order.id} className="p-2 bg-slate-700/50 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                    <span className={order.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      {order.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    {order.quantity} × ${order.price.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </div>
                  {order.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                      className="mt-1 text-xs h-6"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay órdenes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}