"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MainMenuProps {
  onPlay: () => void
  onProfile: () => void
  onExit: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onProfile, onExit }) => {
  const [visitorCount, setVisitorCount] = useState(0)

  useEffect(() => {
    // Simular contador de visitantes (en una app real esto vendría de una API)
    const storedCount = localStorage.getItem('geopolitics-visitor-count')
    const currentCount = storedCount ? parseInt(storedCount) : Math.floor(Math.random() * 10000) + 5000
    
    // Incrementar el contador para esta visita
    const newCount = currentCount + 1
    localStorage.setItem('geopolitics-visitor-count', newCount.toString())
    setVisitorCount(newCount)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      {/* Minimapa animado de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="minimapa-container">
          {/* Continentes animados */}
          <div className="continent continent-1"></div>
          <div className="continent continent-2"></div>
          <div className="continent continent-3"></div>
          <div className="continent continent-4"></div>
          <div className="continent continent-5"></div>
          <div className="continent continent-6"></div>
          
          {/* Líneas de conexión animadas */}
          <div className="connection-line line-1"></div>
          <div className="connection-line line-2"></div>
          <div className="connection-line line-3"></div>
          <div className="connection-line line-4"></div>
          
          {/* Puntos de actividad */}
          <div className="activity-dot dot-1"></div>
          <div className="activity-dot dot-2"></div>
          <div className="activity-dot dot-3"></div>
          <div className="activity-dot dot-4"></div>
          <div className="activity-dot dot-5"></div>
        </div>
      </div>

      {/* Contenido principal del menú */}
      <div className="relative z-10 text-center">
        {/* Logo/Título */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">
            <span className="text-red-500">GEO</span>
            <span className="text-white">POLITICS</span>
          </h1>
          <p className="text-xl text-gray-300 font-light">
            Domina el mundo a través de la estrategia
          </p>
        </div>

        {/* Botones del menú */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={onPlay}
            className="w-64 h-14 text-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
          >
            🎮 JUGAR
          </Button>
          
          <Button
            onClick={onProfile}
            className="w-64 h-14 text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25"
          >
            👤 PERFIL
          </Button>
          
          <Button
            onClick={onExit}
            className="w-64 h-14 text-xl font-semibold bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-800 border-2 border-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gray-600/25"
          >
            🚪 SALIR
          </Button>
        </div>

        {/* Información adicional */}
        <div className="text-gray-400 text-sm">
          <p>Versión 1.0.0 | Desarrollado con ❤️</p>
        </div>
      </div>

      {/* Contador de visitantes */}
      <Card className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm border-gray-700 p-4">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Visitantes</p>
          <p className="text-white font-bold text-lg">
            {visitorCount.toLocaleString()}
          </p>
        </div>
      </Card>

      {/* Estilos CSS para las animaciones */}
      <style jsx global>{`
        .minimapa-container {
          position: relative;
          width: 100%;
          height: 100%;
          filter: blur(2px);
        }

        .continent {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, #dc2626, #ffffff, #000000);
          animation: float 6s ease-in-out infinite;
        }

        .continent-1 {
          width: 120px;
          height: 80px;
          top: 20%;
          left: 15%;
          animation-delay: 0s;
        }

        .continent-2 {
          width: 100px;
          height: 100px;
          top: 15%;
          right: 20%;
          animation-delay: 1s;
        }

        .continent-3 {
          width: 80px;
          height: 60px;
          bottom: 30%;
          left: 10%;
          animation-delay: 2s;
        }

        .continent-4 {
          width: 90px;
          height: 70px;
          bottom: 25%;
          right: 15%;
          animation-delay: 3s;
        }

        .continent-5 {
          width: 60px;
          height: 60px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 4s;
        }

        .continent-6 {
          width: 70px;
          height: 50px;
          top: 40%;
          right: 40%;
          animation-delay: 5s;
        }

        .connection-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, transparent);
          animation: pulse-line 4s ease-in-out infinite;
        }

        .line-1 {
          width: 200px;
          top: 25%;
          left: 25%;
          transform: rotate(45deg);
          animation-delay: 0s;
        }

        .line-2 {
          width: 150px;
          top: 60%;
          right: 30%;
          transform: rotate(-30deg);
          animation-delay: 1s;
        }

        .line-3 {
          width: 180px;
          bottom: 40%;
          left: 20%;
          transform: rotate(15deg);
          animation-delay: 2s;
        }

        .line-4 {
          width: 120px;
          top: 45%;
          left: 60%;
          transform: rotate(-60deg);
          animation-delay: 3s;
        }

        .activity-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #dc2626;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .dot-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .dot-2 {
          top: 30%;
          right: 25%;
          animation-delay: 0.4s;
        }

        .dot-3 {
          bottom: 35%;
          left: 15%;
          animation-delay: 0.8s;
        }

        .dot-4 {
          bottom: 20%;
          right: 20%;
          animation-delay: 1.2s;
        }

        .dot-5 {
          top: 55%;
          left: 55%;
          animation-delay: 1.6s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes pulse-line {
          0%, 100% {
            opacity: 0.3;
            transform: scaleX(0.8);
          }
          50% {
            opacity: 0.7;
            transform: scaleX(1.2);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }

        /* Animación de entrada del menú */
        .main-menu-enter {
          animation: menuFadeIn 1s ease-out forwards;
        }

        @keyframes menuFadeIn {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
