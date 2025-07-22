"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Country } from "@/lib/types"
import { X, Send, MessageCircle, Crown, Flag } from "lucide-react"

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: number
  type: "sent" | "received"
}

interface DiplomaticChatProps {
  playerCountry: Country
  countries: Country[]
  onClose: () => void
  onDiplomaticChange: (country1: string, country2: string, change: number) => void
}

export function DiplomaticChat({ playerCountry, countries, onClose, onDiplomaticChange }: DiplomaticChatProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Obtener países vecinos y con relaciones diplomáticas
  const availableCountries = countries.filter(
    (country) =>
      country.id !== playerCountry.id &&
      !country.ownedBy &&
      (playerCountry.neighbors?.includes(country.id) || playerCountry.diplomaticRelations?.[country.id] !== undefined),
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = async (message: string, targetCountry: Country): Promise<string> => {
    // Simular respuesta de IA basada en el contexto del juego
    const relation = playerCountry.diplomaticRelations?.[targetCountry.id] || 0
    const playerStability = playerCountry.stability
    const targetStability = targetCountry.stability
    const playerGDP = playerCountry.economy.gdp
    const targetGDP = targetCountry.economy.gdp

    // Determinar el tono de la respuesta basado en las relaciones
    let tone = "neutral"
    if (relation > 50) tone = "friendly"
    else if (relation > 0) tone = "cautious"
    else if (relation > -50) tone = "cold"
    else tone = "hostile"

    // Generar respuesta contextual
    const responses = {
      friendly: [
        `Estimado líder de ${playerCountry.name}, valoramos nuestra alianza. ¿En qué podemos colaborar?`,
        `Siempre es un placer escuchar de nuestros amigos en ${playerCountry.name}. Hablemos de cooperación.`,
        `Nuestras naciones han mantenido excelentes relaciones. ¿Qué propuesta tienes para nosotros?`,
      ],
      cautious: [
        `Reconocemos tu mensaje, ${playerCountry.president}. Procederemos con cautela en nuestras negociaciones.`,
        `${targetCountry.name} está dispuesto a escuchar, pero esperamos reciprocidad en cualquier acuerdo.`,
        `Tus palabras son interesantes. Necesitamos garantías antes de comprometernos a algo.`,
      ],
      cold: [
        `${playerCountry.name} debe entender que nuestras relaciones han sido tensas. ¿Qué quieres exactamente?`,
        `No estamos seguros de tus intenciones. ${targetCountry.name} procederá con extrema precaución.`,
        `Después de los eventos recientes, esperamos más que palabras de ${playerCountry.name}.`,
      ],
      hostile: [
        `¿Tienes la audacia de contactarnos después de tus acciones hostiles? ${targetCountry.name} no olvida.`,
        `Tus palabras suenan huecas, ${playerCountry.president}. Nuestras naciones están en conflicto.`,
        `${targetCountry.name} no tiene interés en negociar con agresores. Retira tus fuerzas primero.`,
      ],
    }

    // Añadir contexto específico basado en la situación del juego
    let contextualResponse =
      responses[tone as keyof typeof responses][
        Math.floor(Math.random() * responses[tone as keyof typeof responses].length)
      ]

    // Modificar respuesta basada en estabilidad y economía
    if (targetStability < 40) {
      contextualResponse += ` Nuestro país enfrenta desafíos internos, pero seguimos comprometidos con la diplomacia.`
    }

    if (playerGDP > targetGDP * 2) {
      contextualResponse += ` Reconocemos el poder económico de ${playerCountry.name}.`
    }

    // Respuestas específicas a palabras clave
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes("alianza") || lowerMessage.includes("alliance")) {
      // Verificar si ya existe una alianza
      const allianceExists = playerCountry.alliances?.includes(targetCountry.id) || 
                            targetCountry.alliances?.includes(playerCountry.id)
      
      if (allianceExists) {
        contextualResponse += ` Ya somos aliados estratégicos. Nuestra cooperación continúa fortaleciéndose.`
      } else if (relation > 0) {
        contextualResponse += ` Una alianza podría beneficiar a ambas naciones.`
      } else {
        contextualResponse += ` Las alianzas requieren confianza mutua, algo que falta actualmente.`
      }
    }

    if (lowerMessage.includes("comercio") || lowerMessage.includes("trade")) {
      contextualResponse += ` El comercio puede ser beneficioso si se establecen términos justos.`
    }

    if (lowerMessage.includes("guerra") || lowerMessage.includes("war") || lowerMessage.includes("militar")) {
      contextualResponse += ` ${targetCountry.name} no busca conflictos, pero defenderemos nuestros intereses.`
    }

    return contextualResponse
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedCountry) return

    const newMessage: Message = {
      id: Date.now().toString(),
      from: playerCountry.id,
      to: selectedCountry.id,
      content: inputMessage,
      timestamp: Date.now(),
      type: "sent",
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simular delay de respuesta
    setTimeout(
      async () => {
        const aiResponse = await generateAIResponse(inputMessage, selectedCountry)

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          from: selectedCountry.id,
          to: playerCountry.id,
          content: aiResponse,
          timestamp: Date.now(),
          type: "received",
        }

        setMessages((prev) => [...prev, responseMessage])
        setIsTyping(false)

        // Influir en las relaciones diplomáticas basado en el mensaje
        const relationChange = calculateRelationChange(inputMessage, selectedCountry)
        if (relationChange !== 0) {
          onDiplomaticChange(playerCountry.id, selectedCountry.id, relationChange)
        }
      },
      2000 + Math.random() * 3000,
    ) // 2-5 segundos de delay
  }

  const calculateRelationChange = (message: string, targetCountry: Country): number => {
    const lowerMessage = message.toLowerCase()
    let change = 0

    // Palabras positivas
    if (lowerMessage.includes("amistad") || lowerMessage.includes("cooperación") || lowerMessage.includes("paz")) {
      change += 5
    }
    if (lowerMessage.includes("alianza") || lowerMessage.includes("partnership")) {
      change += 3
    }
    if (lowerMessage.includes("comercio") || lowerMessage.includes("trade")) {
      change += 2
    }

    // Palabras negativas
    if (lowerMessage.includes("amenaza") || lowerMessage.includes("guerra") || lowerMessage.includes("hostil")) {
      change -= 8
    }
    if (lowerMessage.includes("sanción") || lowerMessage.includes("embargo")) {
      change -= 5
    }

    // Limitar el cambio basado en las relaciones actuales
    const currentRelation = playerCountry.diplomaticRelations?.[targetCountry.id] || 0
    if (currentRelation < -50 && change > 0) change = Math.min(change, 2) // Difícil mejorar relaciones muy malas
    if (currentRelation > 50 && change < 0) change = Math.max(change, -2) // Difícil empeorar relaciones muy buenas

    return change
  }

  const getRelationColor = (relation: number) => {
    if (relation > 50) return "text-green-400"
    if (relation > 0) return "text-yellow-400"
    if (relation > -50) return "text-orange-400"
    return "text-red-400"
  }

  const getRelationText = (relation: number) => {
    if (relation > 70) return "Aliado"
    if (relation > 30) return "Amistoso"
    if (relation > 0) return "Neutral+"
    if (relation > -30) return "Neutral-"
    if (relation > -70) return "Hostil"
    return "Enemigo"
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-slate-900 border-red-500/30 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Centro Diplomático
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex gap-4 overflow-hidden">
          {/* Lista de países */}
          <div className="w-1/3 space-y-2">
            <h3 className="font-semibold text-white mb-2">Países Disponibles</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {availableCountries.map((country) => {
                  const relation = playerCountry.diplomaticRelations?.[country.id] || 0
                  return (
                    <Button
                      key={country.id}
                      variant={selectedCountry?.id === country.id ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setSelectedCountry(country)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Flag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{country.name}</span>
                            <Badge variant="outline" className={getRelationColor(relation)}>
                              {getRelationText(relation)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            <Crown className="w-3 h-3 inline mr-1" />
                            {country.president}
                          </p>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            {selectedCountry ? (
              <>
                <div className="bg-slate-800 p-3 rounded-lg mb-4">
                  <h3 className="font-semibold text-white">Conversación con {selectedCountry.name}</h3>
                  <p className="text-sm text-gray-400">
                    Líder: {selectedCountry.president} | Relación:{" "}
                    <span className={getRelationColor(playerCountry.diplomaticRelations?.[selectedCountry.id] || 0)}>
                      {getRelationText(playerCountry.diplomaticRelations?.[selectedCountry.id] || 0)}
                    </span>
                  </p>
                </div>

                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3 p-2">
                    {messages
                      .filter(
                        (msg) =>
                          (msg.from === playerCountry.id && msg.to === selectedCountry.id) ||
                          (msg.from === selectedCountry.id && msg.to === playerCountry.id),
                      )
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.type === "sent" ? "bg-red-600 text-white" : "bg-slate-700 text-gray-100"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 text-gray-100 p-3 rounded-lg">
                          <p className="text-sm">{selectedCountry.president} está escribiendo...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Escribe un mensaje a ${selectedCountry.name}...`}
                    className="flex-1 bg-slate-800 border-gray-600"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isTyping}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un país para iniciar una conversación diplomática</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
