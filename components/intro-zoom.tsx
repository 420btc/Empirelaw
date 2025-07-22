import React, { useEffect, useRef } from "react"

interface IntroZoomProps {
  onEnd: () => void
}

export const IntroZoom: React.FC<IntroZoomProps> = ({ onEnd }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      onEnd()
    }, 3000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [onEnd])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <img
        src="/images/geoma.png"
        alt="Intro Geoma"
        className="w-full h-full object-contain max-w-none animate-intro-zoom"
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
      <style jsx global>{`
        @keyframes intro-zoom {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          80% {
            transform: scale(1.25);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .animate-intro-zoom {
          animation: intro-zoom 3s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>
    </div>
  )
}
