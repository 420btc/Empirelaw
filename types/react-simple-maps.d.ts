declare module 'react-simple-maps' {
  import { ComponentType, MouseEvent } from 'react'

  export interface GeographyProps {
    key: string
    geography: any
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: any
      hover?: any
      pressed?: any
    }
    onClick?: (event: MouseEvent) => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
  }

  export interface GeographiesProps {
    geography: string
    children: (props: { geographies: any[] }) => React.ReactNode
  }

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: {
      scale?: number
      center?: [number, number]
    }
    className?: string
    children: React.ReactNode
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
} 