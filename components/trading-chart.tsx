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
}

export function TradingChart({ resource, currentPrice, onOrderPlaced }: TradingChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [orders, setOrders] = useState<MarketOrder[]>([])
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [orderQuantity, setOrderQuantity] = useState<number>(1)
  const [orderPrice, setOrderPrice] = useState<number>(currentPrice)
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1h')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Cargar datos guardados
  useEffect(() => {
    const savedOrders = localStorage.getItem(`orders_${resource}`)
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
    
    // Cargar historial de precios guardado
    const savedHistory = localStorage.getItem(`priceHistory_${resource}`)
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory)
      console.log('Loaded saved price history:', parsedHistory.length, 'points')
      setPriceHistory(parsedHistory)
    } else {
      generateInitialHistory()
    }
  }, [resource])

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

  const generateInitialHistory = () => {
    const history: PricePoint[] = []
    let price = currentPrice || 100 // Precio base si currentPrice es 0
    const now = Date.now()
    
    // Generar 50 puntos históricos
    for (let i = 49; i >= 0; i--) {
      const timestamp = now - (i * 60000) // Cada minuto hacia atrás
      price = price + (Math.random() - 0.5) * price * 0.05 // ±5% variación para más movimiento
      history.push({
        timestamp,
        price: Math.max(price, 10), // Precio mínimo de $10
        volume: Math.floor(Math.random() * 1000) + 100
      })
    }
    
    console.log('Generated initial history:', history.length, 'points')
    setPriceHistory(history)
  }

  // Dibujar gráfica
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Si no hay datos, mostrar mensaje
    if (priceHistory.length === 0) {
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Cargando datos del gráfico...', canvas.width / 2, canvas.height / 2)
      return
    }

    const padding = 60
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    const prices = priceHistory.map(p => p.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    // Fondo del gráfico
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
      ctx.font = '14px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 5)
    }

    // Líneas verticales (tiempo)
    for (let i = 0; i <= 4; i++) {
      const x = padding + (chartWidth / 4) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, padding + chartHeight)
      ctx.stroke()
    }

    // Dibujar línea de precios
    if (priceHistory.length > 1) {
      ctx.strokeStyle = '#22C55E'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      priceHistory.forEach((point, index) => {
        const x = padding + (chartWidth / (priceHistory.length - 1)) * index
        const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
      
      // Dibujar puntos en la línea
      ctx.fillStyle = '#22C55E'
      priceHistory.forEach((point, index) => {
        const x = padding + (chartWidth / (priceHistory.length - 1)) * index
        const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
        
        // Borde blanco en los puntos
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    console.log('Chart drawn with', priceHistory.length, 'data points')
  }, [priceHistory])

  const placeOrder = () => {
    if (orderQuantity <= 0 || orderPrice <= 0) return

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {resource.charAt(0).toUpperCase() + resource.slice(1)} - ${currentPrice.toFixed(2)}
              </CardTitle>
              <div className="flex gap-2">
                {(['1h', '4h', '1d', '1w'] as const).map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className="text-xs"
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-96 border border-slate-600 rounded-lg bg-slate-900"
            />
            
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
                Cantidad
              </label>
              <Input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="bg-slate-700 border-gray-600 text-white"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio por unidad
              </label>
              <Input
                type="number"
                value={orderPrice}
                onChange={(e) => setOrderPrice(Number(e.target.value))}
                className="bg-slate-700 border-gray-600 text-white"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-gray-300 text-sm">
                Total: <span className="text-white font-semibold">
                  ${(orderQuantity * orderPrice).toFixed(2)}
                </span>
              </p>
            </div>
            
            <Button
              onClick={placeOrder}
              disabled={orderQuantity <= 0 || orderPrice <= 0}
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