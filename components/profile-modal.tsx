"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ProfileModalProps {
  onClose: () => void
}

interface UserProfile {
  name: string
  avatar: string
  level: number
  experience: number
  gamesPlayed: number
  victories: number
  favoriteCountry: string
  joinDate: string
  achievements: string[]
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Jugador",
    avatar: "/placeholder-user.jpg",
    level: 1,
    experience: 0,
    gamesPlayed: 0,
    victories: 0,
    favoriteCountry: "España",
    joinDate: new Date().toLocaleDateString(),
    achievements: []
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(profile.name)

  useEffect(() => {
    // Cargar perfil desde localStorage
    const savedProfile = localStorage.getItem('geopolitics-user-profile')
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfile(parsedProfile)
      setEditName(parsedProfile.name)
    }
  }, [])

  const saveProfile = () => {
    const updatedProfile = { ...profile, name: editName }
    setProfile(updatedProfile)
    localStorage.setItem('geopolitics-user-profile', JSON.stringify(updatedProfile))
    setIsEditing(false)
  }

  const getWinRate = () => {
    if (profile.gamesPlayed === 0) return 0
    return Math.round((profile.victories / profile.gamesPlayed) * 100)
  }

  const getNextLevelExp = () => {
    return profile.level * 1000
  }

  const getExpProgress = () => {
    const nextLevelExp = getNextLevelExp()
    return (profile.experience / nextLevelExp) * 100
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-red-900/20 to-black border-red-500/30 text-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-red-400">👤 Perfil de Usuario</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-red-500/20"
            >
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <Card className="p-4 bg-black/40 border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="bg-red-600 text-white text-xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Nombre de usuario"
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={saveProfile}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditing(false)
                              setEditName(profile.name)
                            }}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold">{profile.name}</h3>
                        <p className="text-gray-400">Nivel {profile.level}</p>
                        <Button
                          onClick={() => setIsEditing(true)}
                          size="sm"
                          variant="ghost"
                          className="mt-1 text-blue-400 hover:text-blue-300"
                        >
                          ✏️ Editar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de experiencia */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Experiencia</span>
                    <span>{profile.experience} / {getNextLevelExp()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getExpProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* Estadísticas */}
              <Card className="p-4 bg-black/40 border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-red-400">📊 Estadísticas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profile.gamesPlayed}</p>
                    <p className="text-sm text-gray-400">Partidas Jugadas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{profile.victories}</p>
                    <p className="text-sm text-gray-400">Victorias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{getWinRate()}%</p>
                    <p className="text-sm text-gray-400">Tasa de Victoria</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{profile.level}</p>
                    <p className="text-sm text-gray-400">Nivel Actual</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              {/* Preferencias */}
              <Card className="p-4 bg-black/40 border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-red-400">⚙️ Preferencias</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300">País Favorito</Label>
                    <p className="text-white font-medium">{profile.favoriteCountry}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Fecha de Registro</Label>
                    <p className="text-white font-medium">{profile.joinDate}</p>
                  </div>
                </div>
              </Card>

              {/* Logros */}
              <Card className="p-4 bg-black/40 border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-red-400">🏆 Logros Recientes</h4>
                <div className="space-y-2">
                  {profile.achievements.length > 0 ? (
                    profile.achievements.slice(0, 5).map((achievement, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                      >
                        {achievement}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      ¡Juega para desbloquear logros!
                    </p>
                  )}
                </div>
              </Card>

              {/* Progreso */}
              <Card className="p-4 bg-black/40 border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-red-400">📈 Progreso</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Dominio Mundial</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Maestría Diplomática</span>
                      <span>8%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Estratega Económico</span>
                      <span>22%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => {
                // Resetear estadísticas
                const resetProfile = {
                  ...profile,
                  level: 1,
                  experience: 0,
                  gamesPlayed: 0,
                  victories: 0,
                  achievements: []
                }
                setProfile(resetProfile)
                localStorage.setItem('geopolitics-user-profile', JSON.stringify(resetProfile))
              }}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              🔄 Resetear Estadísticas
            </Button>
            <Button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
