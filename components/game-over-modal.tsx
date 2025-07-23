"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skull, Crown, Flag } from "lucide-react"

interface GameOverModalProps {
  isOpen: boolean
  conquerorCountry: string
  playerCountry: string
  onRestart: () => void
}

export function GameOverModal({ isOpen, conquerorCountry, playerCountry, onRestart }: GameOverModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-red-900 via-red-800 to-black border-red-600 border-2">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Skull className="w-16 h-16 text-red-400 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-red-400">
            💀 GAME OVER 💀
          </DialogTitle>
          
          <DialogDescription className="text-white text-center space-y-3">
            <div className="bg-red-800/50 p-4 rounded-lg border border-red-600">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flag className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-300">Tu imperio ha caído</span>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">
                La estabilidad de <span className="font-bold text-red-400">{playerCountry}</span> cayó por debajo del 5%, 
                lo que permitió que <span className="font-bold text-yellow-400">{conquerorCountry}</span> invadiera 
                y conquistara tu territorio.
              </p>
              
              <div className="space-y-2">
                <Badge variant="destructive" className="w-full justify-center py-2">
                  🏴 Conquistado por {conquerorCountry}
                </Badge>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Tu país se volvió vulnerable debido a la baja estabilidad</p>
                  <p>• Las fuerzas enemigas aprovecharon el caos interno</p>
                  <p>• El gobierno colapsó y perdió el control</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-600">
              <p className="text-yellow-300 text-sm font-medium">
                💡 Consejo: Mantén la estabilidad por encima del 5% para evitar invasiones
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={onRestart}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg transform transition-all hover:scale-105"
          >
            🔄 Jugar de Nuevo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}