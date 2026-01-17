"use client"

import { useEffect, useState } from "react"
import type { GameEvent } from "@/lib/types"

interface NewsTickerProps {
    events: GameEvent[]
    maxItems?: number
}

export function NewsTicker({ events, maxItems = 8 }: NewsTickerProps) {
    const [isPaused, setIsPaused] = useState(false)

    // Deduplicate events by ID and sort descending
    const uniqueEvents = Array.from(new Map(events.map(event => [event.id, event])).values())
    const recentEvents = uniqueEvents
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxItems)

    const getEventIcon = (type: string): string => {
        switch (type) {
            case "success": return "✅"
            case "error": return "🚨"
            case "warning": return "⚠️"
            case "rebellion": return "🔥"
            case "money": return "💰"
            case "economic": return "💰"
            default: return "📢"
        }
    }

    const getEventColor = (type: string): string => {
        switch (type) {
            case "success": return "text-green-400"
            case "error": return "text-red-400"
            case "warning": return "text-yellow-400"
            case "rebellion": return "text-orange-400"
            case "money": return "text-cyan-400"
            case "economic": return "text-cyan-400"
            default: return "text-gray-300"
        }
    }

    const formatTime = (timestamp: number): string => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }

    if (recentEvents.length === 0) {
        return null
    }

    return (
        <div
            className="w-full bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-t border-cyan-500/30 backdrop-blur-sm overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex items-center h-10">
                {/* Fixed label */}
                <div className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm flex items-center gap-2 z-10 shadow-lg">
                    <span className="animate-pulse">🔴</span>
                    <span>EN VIVO</span>
                </div>

                {/* Scrolling ticker */}
                <div className="flex-1 overflow-hidden relative">
                    <div
                        className={`flex gap-8 whitespace-nowrap ${!isPaused ? 'animate-ticker' : ''}`}
                        style={{
                            animationDuration: `${Math.max(20, recentEvents.length * 8)}s`,
                            animationPlayState: isPaused ? 'paused' : 'running'
                        }}
                    >
                        {/* Events list */}
                        {recentEvents.map((event, index) => (
                            <div
                                key={`${event.id}-${index}`}
                                className="flex items-center gap-2 px-4"
                            >
                                <span className="text-lg">{getEventIcon(event.type)}</span>
                                <span className={`font-semibold ${getEventColor(event.type)}`}>
                                    {event.title}
                                </span>
                                <span className="text-gray-500 text-xs">
                                    {formatTime(event.timestamp)}
                                </span>
                                <span className="text-gray-600">|</span>
                            </div>
                        ))}
                    </div>

                    {/* Gradient fade edges */}
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />
                </div>

                {/* Event counter badge */}
                <div className="flex-shrink-0 px-3">
                    <div className="bg-cyan-600/30 border border-cyan-500/50 rounded-full px-2 py-0.5 text-xs text-cyan-300 font-semibold">
                        {events.length} eventos
                    </div>
                </div>
            </div>
        </div>
    )
}
