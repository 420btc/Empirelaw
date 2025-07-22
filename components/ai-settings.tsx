"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Settings, Key, Bot, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { aiDiplomacyService } from "@/lib/ai-diplomacy"

interface AISettingsProps {
  onClose: () => void
}

export function AISettings({ onClose }: AISettingsProps) {
  const [apiKey, setApiKey] = useState("")
  const [isAIEnabled, setIsAIEnabled] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  // Cargar configuración desde localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key')
    const savedAIEnabled = localStorage.getItem('ai_diplomacy_enabled') === 'true'
    
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
    setIsAIEnabled(savedAIEnabled)
  }, [])

  // Guardar configuración en localStorage
  const saveSettings = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim())
    } else {
      localStorage.removeItem('openai_api_key')
    }
    localStorage.setItem('ai_diplomacy_enabled', isAIEnabled.toString())
    
    // Actualizar el servicio de IA
    aiDiplomacyService.updateSettings()
  }

  // Probar conexión con OpenAI
  const testConnection = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("Por favor ingresa una API key válida")
      setConnectionStatus('error')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')
    setErrorMessage("")

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setConnectionStatus('success')
        saveSettings()
      } else {
        const errorData = await response.json()
        setConnectionStatus('error')
        setErrorMessage(errorData.error?.message || 'Error de autenticación')
      }
    } catch (error) {
      setConnectionStatus('error')
      setErrorMessage('Error de conexión. Verifica tu conexión a internet.')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSave = () => {
    saveSettings()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-900 border-red-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Configuración de IA Diplomática
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información sobre la funcionalidad */}
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              Habilita la IA diplomática para que los países respondan de forma inteligente usando OpenAI.
              Los países podrán tomar decisiones autónomas basadas en su situación económica, militar y diplomática.
            </AlertDescription>
          </Alert>

          {/* Switch para habilitar/deshabilitar IA */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Habilitar IA Diplomática</Label>
              <p className="text-sm text-gray-400">
                Los países usarán IA para responder y tomar acciones automáticas
              </p>
            </div>
            <Switch
              checked={isAIEnabled}
              onCheckedChange={setIsAIEnabled}
            />
          </div>

          {/* Configuración de API Key */}
          {isAIEnabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-white font-medium flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key de OpenAI
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="bg-slate-800 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400">
                  Obtén tu API key en{" "}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>

              {/* Botón de prueba de conexión */}
              <div className="flex gap-2">
                <Button
                  onClick={testConnection}
                  disabled={!apiKey.trim() || isTestingConnection}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isTestingConnection ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
                </Button>
                
                {connectionStatus === 'success' && (
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    ✓ Conexión exitosa
                  </Badge>
                )}
              </div>

              {/* Mensaje de error */}
              {connectionStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">¿Qué hace la IA Diplomática?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Los países responden de forma inteligente en el chat diplomático</li>
              <li>• Pueden iniciar conversaciones y proponer alianzas o comercio</li>
              <li>• Toman decisiones basadas en su situación económica y militar</li>
              <li>• Pueden atacar, formar alianzas o aplicar sanciones automáticamente</li>
              <li>• Cada país tiene personalidad y objetivos únicos</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}