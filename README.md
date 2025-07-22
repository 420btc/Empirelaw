# GeoPolitics 2025 - Juego de Geopolítica Interactivo

Un juego de estrategia geopolítica ambientado en el año 2025, donde los jugadores lideran países y manipulan el orden mundial a través de economía, política, conspiraciones y diplomacia.

## 🎮 Características del Juego

### Mapa Mundial Interactivo
- Mapa SVG interactivo con países seleccionables
- Visualización en tiempo real del estado de cada país
- Sistema de colores basado en estabilidad política
- Zoom y navegación fluida

### Gestión de Países
- **20 países jugables** con datos realistas
- **Líderes ficticios** con ideologías y características únicas
- **Sistemas económicos** con PIB, recursos naturales y comercio
- **Estabilidad política** que afecta todas las decisiones
- **Sistemas legales** (Ley Natural vs Ley Positiva)
- **Estados soberanos** como refugios independientes

### Mecánicas de Conspiración
- **Geoingeniería**: Manipula el clima para causar desastres
- **Influencia Masónica**: Soborna y controla líderes secretamente
- **Guerra Legal**: Promueve diferentes sistemas jurídicos
- **Operaciones Encubiertas** con riesgos y consecuencias

### Sistema de Acciones
- **Acciones Internas**: Inversión económica, políticas sociales, reformas legales
- **Acciones Externas**: Intervenciones militares, sanciones, alianzas
- **Sistema de Costos**: Cada acción requiere recursos del PIB
- **Consecuencias Dinámicas**: Resultados impredecibles y realistas

### Eventos Aleatorios
- Crisis económicas globales
- Desastres naturales (¿naturales o artificiales?)
- Levantamientos políticos
- Avances tecnológicos
- Incidentes diplomáticos
- Exposición de conspiraciones

## 🚀 Tecnologías Utilizadas

- **Next.js 15** con App Router
- **TypeScript** para código robusto
- **React Simple Maps** para mapas SVG interactivos
- **Tailwind CSS** para diseño responsivo
- **Shadcn/ui** para componentes modernos
- **Lucide React** para iconografía

## 🎯 Objetivos del Juego

1. **Conquista Mundial**: Anexa países mediante guerra, diplomacia o colapso interno
2. **Control Poblacional**: Mantén la estabilidad para evitar rebeliones
3. **Resistencia Soberana**: Evita que los estados soberanos crezcan en poder
4. **Dominación Conspirativa**: Usa geoingeniería y masonería para controlar el mundo

## 🎨 Diseño Visual

- **Tema Futurista**: Inspirado en Cyberpunk 2077 y 1984
- **Paleta Oscura**: Gradientes de púrpura y cian sobre fondo oscuro
- **Interfaz Distópica**: Reflejando las conspiraciones y el control global
- **Responsive Design**: Adaptable a todos los dispositivos

## 🎲 Mecánicas de Juego

### Estados de País
- **Estable (80%+)**: Verde - País próspero y controlado
- **Moderado (60-79%)**: Amarillo - Situación manejable
- **Inestable (40-59%)**: Naranja - Riesgo de problemas
- **Crisis (0-39%)**: Rojo - Colapso inminente

### Sistemas de Influencia
- **Influencia Conspirativa**: Porcentajes de control secreto
- **Alianzas Diplomáticas**: Redes de países aliados
- **Fuerza Militar**: Capacidad de intervención directa
- **Poder Económico**: PIB disponible para acciones

### Eventos Dinámicos
- **Probabilidad del 30%** cada 10 segundos
- **Efectos Cascada**: Un evento puede desencadenar otros
- **Consecuencias Realistas**: Basadas en geopolítica real
- **Adaptación Requerida**: Los jugadores deben reaccionar constantemente

## 🏗️ Arquitectura del Código

\`\`\`
app/
├── page.tsx                 # Componente principal del juego
├── layout.tsx              # Layout base de Next.js
└── globals.css             # Estilos globales

components/
├── world-map.tsx           # Mapa mundial interactivo
├── country-panel.tsx       # Panel de información de países
├── action-menu.tsx         # Menú de acciones disponibles
├── event-notifications.tsx # Sistema de notificaciones
├── game-header.tsx         # Cabecera con estadísticas globales
├── country-selection-modal.tsx # Modal de selección inicial
└── ui/                     # Componentes de UI reutilizables

hooks/
└── use-game-state.tsx      # Hook principal del estado del juego

lib/
├── types.ts                # Definiciones de TypeScript
├── game-engine.ts          # Motor de lógica del juego
└── data/
    └── countries.ts        # Datos iniciales de países
\`\`\`

## 🎮 Cómo Jugar

1. **Selección Inicial**: Elige un país para liderar al inicio
2. **Exploración**: Haz clic en países del mapa para ver información
3. **Planificación**: Usa el panel de acciones para planear estrategias
4. **Ejecución**: Ejecuta acciones internas y externas
5. **Adaptación**: Responde a eventos aleatorios y consecuencias
6. **Dominación**: Expande tu influencia hasta controlar el mundo

## 🔮 Características Futuras

- **Sistema de Guardado**: Persistencia de partidas
- **Multijugador**: Competencia entre jugadores reales
- **Más Conspiraciones**: Ciberataques, IA, bioingeniería
- **Campaña Narrativa**: Historia estructurada con objetivos
- **Análisis de IA**: Oponentes controlados por IA avanzada

## 🌍 Inspiración

- **Civilization VI**: Mecánicas de estrategia por turnos
- **Geo-Political Simulator**: Realismo geopolítico
- **Cyberpunk 2077**: Estética futurista distópica
- **1984**: Temas de control y conspiración
- **Europa Universalis**: Diplomacia compleja

---

**¡Bienvenido al futuro de la geopolítica! ¿Serás el arquitecto del nuevo orden mundial o caerás víctima de tus propias conspiraciones?**
