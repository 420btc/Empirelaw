import type { Country } from "@/lib/types"

export const initialCountries: Country[] = [
  // ... (resto de países existentes)
  // --- PAÍSES AFRICANOS AGREGADOS AL FINAL ---
  // Ghana
  // Egipto
  // Nigeria
  {
    id: "nigeria",
    name: "Nigeria",
    president: "Bola Tinubu",
    ideology: "Democracia",
    economy: {
      gdp: 450,
      debt: 40,
      resources: ["petróleo", "gas natural", "cacao", "algodón"],
      resourceProduction: { petróleo: 120, "gas natural": 80, cacao: 60, algodón: 40 },
      resourceReserves: { petróleo: 1800, "gas natural": 1600, cacao: 900, algodón: 700 },
    },
    population: 206000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 30,
    powerLevel: "regional",
    geopoliticalBlock: "africa",
    alliances: ["ghana", "south_africa"],
    neighbors: ["benin", "niger", "cameroon", "chad"],
    diplomaticRelations: { ghana: 70, south_africa: 60, uk: 45, usa: 40, china: 50 },
    conspiracyInfluence: { geoengineering: 3, masonic: 5, legal: 15 },
  },
  // Sudáfrica
  {
    id: "south_africa",
    name: "Sudáfrica",
    president: "Cyril Ramaphosa",
    ideology: "Democracia",
    economy: {
      gdp: 350,
      debt: 60,
      resources: ["oro", "diamantes", "platino", "carbón"],
      resourceProduction: { oro: 110, diamantes: 70, platino: 60, carbón: 50 },
      resourceReserves: { oro: 2000, diamantes: 1700, platino: 1200, carbón: 1100 },
    },
    population: 59000000,
    stability: 60,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "regional",
    geopoliticalBlock: "africa",
    alliances: ["nigeria", "ghana"],
    neighbors: ["namibia", "botswana", "zimbabwe", "mozambique"],
    diplomaticRelations: { nigeria: 60, ghana: 55, uk: 44, usa: 40, china: 48 },
    conspiracyInfluence: { geoengineering: 2, masonic: 4, legal: 12 },
  },
  // Mozambique
  {
    id: "mozambique",
    name: "Mozambique",
    president: "Filipe Nyusi",
    ideology: "Socialismo",
    economy: {
      gdp: 15,
      debt: 100,
      resources: ["carbón", "gas natural", "algodón"],
      resourceProduction: { carbón: 20, "gas natural": 15, algodón: 10 },
      resourceReserves: { carbón: 120, "gas natural": 90, algodón: 80 },
    },
    population: 32000000,
    stability: 48,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 8,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["tanzania", "south_africa"],
    neighbors: ["tanzania", "south_africa", "zimbabwe"],
    diplomaticRelations: { tanzania: 50, south_africa: 45 },
    conspiracyInfluence: { geoengineering: 1, masonic: 2, legal: 4 },
  },
  // Camerún
  {
    id: "cameroon",
    name: "Camerún",
    president: "Paul Biya",
    ideology: "Autoritarismo",
    economy: {
      gdp: 40,
      debt: 60,
      resources: ["petróleo", "cacao", "café"],
      resourceProduction: { petróleo: 18, cacao: 14, café: 12 },
      resourceReserves: { petróleo: 120, cacao: 90, café: 70 },
    },
    population: 27000000,
    stability: 52,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 12,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["nigeria", "ivory_coast"],
    neighbors: ["nigeria", "chad", "central_african_republic", "gabon", "congo", "ivory_coast"],
    diplomaticRelations: { nigeria: 48, ivory_coast: 40 },
    conspiracyInfluence: { geoengineering: 1, masonic: 2, legal: 4 },
  },
  // Costa de Marfil
  {
    id: "ivory_coast",
    name: "Costa de Marfil",
    president: "Alassane Ouattara",
    ideology: "Democracia",
    economy: {
      gdp: 60,
      debt: 45,
      resources: ["cacao", "café", "aceite de palma"],
      resourceProduction: { cacao: 32, café: 21, "aceite de palma": 18 },
      resourceReserves: { cacao: 200, café: 140, "aceite de palma": 120 },
    },
    population: 26000000,
    stability: 54,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 14,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["ghana", "cameroon"],
    neighbors: ["ghana", "burkina_faso", "liberia", "cameroon"],
    diplomaticRelations: { ghana: 42, cameroon: 40 },
    conspiracyInfluence: { geoengineering: 1, masonic: 2, legal: 4 },
  },
  // Zambia
  {
    id: "zambia",
    name: "Zambia",
    president: "Hakainde Hichilema",
    ideology: "Democracia",
    economy: {
      gdp: 30,
      debt: 85,
      resources: ["cobre", "cobalto", "maíz"],
      resourceProduction: { cobre: 24, cobalto: 12, maíz: 10 },
      resourceReserves: { cobre: 200, cobalto: 90, maíz: 80 },
    },
    population: 19000000,
    stability: 50,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 10,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["angola", "south_africa"],
    neighbors: ["angola", "congo", "tanzania", "malawi", "mozambique"],
    diplomaticRelations: { angola: 36, south_africa: 40 },
    conspiracyInfluence: { geoengineering: 1, masonic: 2, legal: 4 },
  },
  // Senegal
  {
    id: "senegal",
    name: "Senegal",
    president: "Macky Sall",
    ideology: "Democracia",
    economy: {
      gdp: 30,
      debt: 65,
      resources: ["pescado", "cacahuete", "fosfato"],
      resourceProduction: { pescado: 40, cacahuete: 30, fosfato: 20 },
      resourceReserves: { pescado: 200, cacahuete: 150, fosfato: 100 },
    },
    population: 17000000,
    stability: 60,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 10,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["ghana", "nigeria"],
    neighbors: ["mali", "guinea", "gambia"],
    diplomaticRelations: { ghana: 60, nigeria: 55 },
    conspiracyInfluence: { geoengineering: 1, masonic: 2, legal: 5 },
  },
  // Tanzania
  {
    id: "tanzania",
    name: "Tanzania",
    president: "Samia Suluhu Hassan",
    ideology: "Socialismo",
    economy: {
      gdp: 70,
      debt: 40,
      resources: ["oro", "café", "algodón"],
      resourceProduction: { oro: 50, café: 30, algodón: 20 },
      resourceReserves: { oro: 400, café: 250, algodón: 200 },
    },
    population: 63000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 18,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["kenya", "uganda"],
    neighbors: ["kenya", "uganda", "mozambique"],
    diplomaticRelations: { kenya: 65, uganda: 60 },
    conspiracyInfluence: { geoengineering: 2, masonic: 2, legal: 6 },
  },
  // Angola
  {
    id: "angola",
    name: "Angola",
    president: "João Lourenço",
    ideology: "Autoritarismo",
    economy: {
      gdp: 90,
      debt: 120,
      resources: ["petróleo", "diamantes", "hierro"],
      resourceProduction: { petróleo: 80, diamantes: 35, hierro: 25 },
      resourceReserves: { petróleo: 700, diamantes: 400, hierro: 300 },
    },
    population: 34000000,
    stability: 50,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 22,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["south_africa", "nigeria"],
    neighbors: ["namibia", "zambia", "congo"],
    diplomaticRelations: { south_africa: 55, nigeria: 50 },
    conspiracyInfluence: { geoengineering: 2, masonic: 3, legal: 8 },
  },
  // Uganda
  {
    id: "uganda",
    name: "Uganda",
    president: "Yoweri Museveni",
    ideology: "Autoritarismo",
    economy: {
      gdp: 40,
      debt: 45,
      resources: ["café", "algodón", "cobre"],
      resourceProduction: { café: 35, algodón: 25, cobre: 15 },
      resourceReserves: { café: 180, algodón: 120, cobre: 90 },
    },
    population: 47000000,
    stability: 53,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 15,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["kenya", "tanzania"],
    neighbors: ["kenya", "tanzania", "congo"],
    diplomaticRelations: { kenya: 60, tanzania: 58 },
    conspiracyInfluence: { geoengineering: 1, masonic: 2, legal: 6 },
  },
  // USA
  {
    id: "usa",
    name: "Estados Unidos",
    president: "Donald Trump", // Actualizado: Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 25000,
      debt: 130, // 130% del PIB - realista
      resources: ["tecnología", "petróleo", "maíz", "soja", "gas natural"],
      resourceProduction: {
        tecnología: 150,
        petróleo: 120,
        maíz: 200,
        soja: 180,
        "gas natural": 140,
      },
      resourceReserves: {
        tecnología: 1500,
        petróleo: 2400,
        maíz: 3200,
        soja: 2800,
        "gas natural": 2100,
      },
    },
    population: 330000000,
    stability: 75,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 95,
    powerLevel: "superpower",
    geopoliticalBlock: "nato",
    alliances: ["uk", "israel", "canada", "japan", "south_korea"],
    neighbors: ["canada", "mexico"],
    diplomaticRelations: {
      canada: 90,
      mexico: 70,
      uk: 95,
      israel: 95,
      japan: 85,
      south_korea: 90,
      china: -20,
      russia: -40,
      iran: -80,
    },
    conspiracyInfluence: {
      geoengineering: 15,
      masonic: 25,
      legal: 10,
    },
  },
  {
    id: "china",
    name: "China",
    president: "Xi Jinping", // Actualizado: Líder real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 17000,
      debt: 70, // 70% del PIB
      resources: ["tierras raras", "carbón", "hierro", "arroz", "tecnología"],
      resourceProduction: {
        "tierras raras": 200,
        carbón: 300,
        hierro: 250,
        arroz: 180,
        tecnología: 120,
      },
      resourceReserves: {
        "tierras raras": 4000,
        carbón: 5500,
        hierro: 3800,
        arroz: 2200,
        tecnología: 1800,
      },
    },
    population: 1400000000,
    stability: 85,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 90,
    powerLevel: "superpower",
    geopoliticalBlock: "brics",
    alliances: ["russia", "north_korea", "iran", "brazil"],
    neighbors: ["russia", "india", "mongolia", "north_korea", "vietnam", "myanmar"],
    diplomaticRelations: {
      russia: 80,
      north_korea: 70,
      iran: 60,
      brazil: 50,
      usa: -20,
      india: -10,
      japan: -30,
    },
    conspiracyInfluence: {
      geoengineering: 20,
      masonic: 5,
      legal: 15,
    },
  },
  {
    id: "russia",
    name: "Rusia",
    president: "Vladimir Putin", // Actualizado: Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 4000,
      debt: 20, // 20% del PIB - muy baja deuda
      resources: ["gas natural", "petróleo", "oro", "trigo", "uranio"],
      resourceProduction: {
        "gas natural": 280,
        petróleo: 220,
        oro: 80,
        trigo: 160,
        uranio: 60,
      },
      resourceReserves: {
        "gas natural": 6000,
        petróleo: 4500,
        oro: 1200,
        trigo: 2400,
        uranio: 800,
      },
    },
    population: 146000000,
    stability: 70,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 85,
    powerLevel: "superpower",
    geopoliticalBlock: "brics",
    alliances: ["china", "belarus", "iran", "north_korea"],
    neighbors: ["china", "mongolia", "kazakhstan", "ukraine", "belarus", "finland", "norway"],
    diplomaticRelations: {
      china: 80,
      belarus: 90,
      iran: 70,
      north_korea: 60,
      usa: -40,
      ukraine: -90,
      uk: -60,
    },
    conspiracyInfluence: {
      geoengineering: 25,
      masonic: 10,
      legal: 5,
    },
  },
  {
    id: "uk",
    name: "Reino Unido",
    president: "Keir Starmer", // Actualizado: Primer Ministro real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 3500,
      debt: 100, // 100% del PIB
      resources: ["servicios financieros", "tecnología", "petróleo"],
      resourceProduction: {
        "servicios financieros": 200,
        tecnología: 120,
        petróleo: 80,
      },
      resourceReserves: {
        "servicios financieros": 3000,
        tecnología: 1800,
        petróleo: 1200,
      },
    },
    population: 67000000,
    stability: 78,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 70,
    powerLevel: "superpower",
    geopoliticalBlock: "nato",
    alliances: ["usa", "france", "germany", "canada", "australia"],
    neighbors: ["ireland", "france"],
    diplomaticRelations: {
      usa: 95,
      france: 70,
      germany: 75,
      canada: 85,
      australia: 90,
      russia: -60,
      china: -10,
    },
    conspiracyInfluence: {
      geoengineering: 12,
      masonic: 30,
      legal: 18,
    },
  },
  {
    id: "israel",
    name: "Israel",
    president: "Benjamin Netanyahu", // Ya era correcto
    ideology: "Capitalismo",
    economy: {
      gdp: 500,
      debt: 75, // 75% del PIB
      resources: ["tecnología", "agricultura", "turismo"],
      resourceProduction: {
        tecnología: 100,
        agricultura: 60,
        turismo: 80,
      },
      resourceReserves: {
        tecnología: 1200,
        agricultura: 900,
        turismo: 1000,
      },
    },
    population: 9000000,
    stability: 75,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 80,
    powerLevel: "superpower", // Poder desproporcionado por alianza con USA
    geopoliticalBlock: "nato",
    alliances: ["usa", "uk"],
    neighbors: ["egypt", "jordan", "lebanon", "syria"],
    diplomaticRelations: {
      usa: 95,
      uk: 80,
      egypt: 30,
      jordan: 40,
      iran: -95,
      syria: -90,
    },
    conspiracyInfluence: {
      geoengineering: 15,
      masonic: 25,
      legal: 20,
    },
  },
  {
    id: "germany",
    name: "Alemania",
    president: "Friedrich Merz", // Actualizado: Canciller real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 4500,
      debt: 70, // 70% del PIB
      resources: ["industria", "tecnología", "energía renovable"],
      resourceProduction: {
        industria: 53,
        "tecnología": 129,
        "energía renovable": 80,
      },
      resourceReserves: {
        industria: 1007,
        "tecnología": 2580,
        "energía renovable": 1520,
      },
    },
    population: 83000000,
    stability: 88,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 60,
    powerLevel: "major",
    geopoliticalBlock: "eu",
    alliances: ["france", "italy", "spain", "uk", "poland"],
    neighbors: ["france", "poland", "czech_republic", "austria", "switzerland", "belgium", "netherlands", "denmark"],
    diplomaticRelations: {
      france: 90,
      italy: 80,
      spain: 75,
      uk: 75,
      poland: 70,
      usa: 65,
      russia: -30,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 15,
      legal: 20,
    },
  },
  {
    id: "france",
    name: "Francia",
    president: "Emmanuel Macron", // Actualizado: Presidente real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 3000,
      debt: 115, // 115% del PIB
      resources: ["agricultura", "turismo", "energía nuclear"],
      resourceProduction: {
        agricultura: 93,
        turismo: 60,
        "energía nuclear": 59,
      },
      resourceReserves: {
        agricultura: 1767,
        turismo: 1020,
        "energía nuclear": 1180,
      },
    },
    population: 68000000,
    stability: 82,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 65,
    powerLevel: "major",
    geopoliticalBlock: "eu",
    alliances: ["germany", "italy", "spain", "uk"],
    neighbors: ["uk", "germany", "italy", "spain", "belgium", "switzerland"],
    diplomaticRelations: {
      germany: 90,
      italy: 85,
      spain: 80,
      uk: 70,
      usa: 60,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 20,
      legal: 15,
    },
  },
  {
    id: "japan",
    name: "Japón",
    president: "Shigeru Ishiba", // Actualizado: Primer Ministro real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 5000,
      debt: 260, // 260% del PIB - la más alta del mundo
      resources: ["tecnología", "manufactura", "pesca"],
      resourceProduction: {
        "tecnología": 125,
        manufactura: 84,
        pesca: 80,
      },
      resourceReserves: {
        "tecnología": 2125,
        manufactura: 1596,
        pesca: 1520,
      },
    },
    population: 125000000,
    stability: 92,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 55,
    powerLevel: "major",
    geopoliticalBlock: "nato",
    alliances: ["usa", "south_korea", "australia"],
    neighbors: ["south_korea", "north_korea"],
    diplomaticRelations: {
      usa: 90,
      south_korea: 50,
      australia: 80,
      china: -30,
      north_korea: -80,
    },
    conspiracyInfluence: {
      geoengineering: 10,
      masonic: 8,
      legal: 12,
    },
  },
  {
    id: "india",
    name: "India",
    president: "Narendra Modi", // Actualizado: Primer Ministro real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 3800,
      debt: 90, // 90% del PIB
      resources: ["tecnología", "textiles", "especias"],
      resourceProduction: {
        "tecnología": 137,
        textiles: 83,
        especias: 64,
      },
      resourceReserves: {
        "tecnología": 2192,
        textiles: 1411,
        especias: 1536,
      },
    },
    population: 1380000000,
    stability: 65,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 75,
    powerLevel: "major",
    geopoliticalBlock: "brics",
    alliances: ["brazil", "south_africa"],
    neighbors: ["china", "pakistan", "bangladesh", "myanmar", "nepal", "bhutan"],
    diplomaticRelations: {
      usa: 60,
      brazil: 50,
      south_africa: 60,
      china: -10,
      pakistan: -70,
      bangladesh: 40,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 12,
      legal: 25,
    },
  },
  {
    id: "brazil",
    name: "Brasil",
    president: "Luiz Inácio Lula da Silva", // Actualizado: Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 2500,
      debt: 95, // 95% del PIB
      resources: ["soja", "café", "hierro", "madera", "azúcar"],
      resourceProduction: {
        soja: 220,
        café: 180,
        hierro: 140,
        madera: 200,
        azúcar: 160,
      },
      resourceReserves: {
        soja: 3200,
        café: 2400,
        hierro: 2800,
        madera: 4000,
        azúcar: 2200,
      },
    },
    population: 215000000,
    stability: 60,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 45,
    powerLevel: "major",
    geopoliticalBlock: "brics",
    alliances: ["china", "russia", "india", "argentina"],
    neighbors: ["argentina", "colombia", "venezuela", "peru", "bolivia", "paraguay", "uruguay"],
    diplomaticRelations: {
      argentina: 80,
      china: 70,
      russia: 60,
      india: 50,
      usa: 40,
    },
    conspiracyInfluence: {
      geoengineering: 15,
      masonic: 8,
      legal: 10,
    },
  },
  {
    id: "canada",
    name: "Canadá",
    president: "Mark Carney", // Actualizado: Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 2200,
      debt: 85, // 85% del PIB
      resources: ["petróleo", "oro", "madera", "trigo", "uranio"],
      resourceProduction: {
        petróleo: 160,
        oro: 100,
        madera: 220,
        trigo: 140,
        uranio: 80,
      },
      resourceReserves: {
        petróleo: 2800,
        oro: 1800,
        madera: 4500,
        trigo: 2200,
        uranio: 1200,
      },
    },
    population: 38000000,
    stability: 90,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 40,
    powerLevel: "major",
    geopoliticalBlock: "nato",
    alliances: ["usa", "uk", "australia"],
    neighbors: ["usa"],
    diplomaticRelations: {
      usa: 90,
      uk: 85,
      australia: 80,
      france: 70,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 15,
      legal: 22,
    },
  },
  {
    id: "mexico",
    name: "México",
    president: "Claudia Sheinbaum", // Actualizado: Presidenta real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 1700,
      debt: 55, // 55% del PIB
      resources: ["petróleo", "agricultura", "turismo"],
      resourceProduction: {
        "petróleo": 119,
        agricultura: 68,
        turismo: 78,
      },
      resourceReserves: {
        "petróleo": 2380,
        agricultura: 1496,
        turismo: 1872,
      },
    },
    population: 128000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 35,
    powerLevel: "regional",
    geopoliticalBlock: "latin_america",
    alliances: ["usa", "brazil", "argentina"],
    neighbors: ["usa", "guatemala", "belize"],
    diplomaticRelations: {
      usa: 70,
      brazil: 60,
      argentina: 55,
      guatemala: 50,
      spain: 65,
    },
    conspiracyInfluence: {
      geoengineering: 10,
      masonic: 12,
      legal: 8,
    },
  },
  {
    id: "south_korea",
    name: "Corea del Sur",
    president: "Lee Jae-myung", // Actualizado: Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 1800,
      debt: 45, // 45% del PIB
      resources: ["tecnología", "manufactura", "acero"],
      resourceProduction: {
        "tecnología": 100,
        manufactura: 86,
        acero: 72,
      },
      resourceReserves: {
        "tecnología": 1500,
        manufactura: 1376,
        acero: 1224,
      },
    },
    population: 52000000,
    stability: 85,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 65,
    powerLevel: "regional",
    geopoliticalBlock: "nato",
    alliances: ["usa", "japan"],
    neighbors: ["north_korea", "japan"],
    diplomaticRelations: {
      usa: 95,
      japan: 50,
      north_korea: -95,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 10,
      legal: 8,
    },
  },
  {
    id: "north_korea",
    name: "Corea del Norte",
    president: "Kim Jong-un",
    ideology: "Autoritarismo",
    economy: {
      gdp: 40,
      debt: 5, // 5% del PIB - muy baja por aislamiento
      resources: ["carbón", "minerales", "agricultura"],
      resourceProduction: {
        "carbón": 86,
        minerales: 62,
        agricultura: 98,
      },
      resourceReserves: {
        "carbón": 1462,
        minerales: 992,
        agricultura: 2058,
      },
    },
    population: 26000000,
    stability: 60,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 70,
    powerLevel: "regional",
    geopoliticalBlock: "brics",
    alliances: ["china", "russia"],
    neighbors: ["south_korea", "china", "japan"],
    diplomaticRelations: {
      china: 70,
      russia: 60,
      south_korea: -95,
      usa: -95,
      japan: -80,
    },
    conspiracyInfluence: {
      geoengineering: 0,
      masonic: 0,
      legal: 0,
    },
  },
  {
    id: "australia",
    name: "Australia",
    president: "Anthony Albanese", // Actualizado: Primer Ministro real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 1800,
      debt: 50, // 50% del PIB
      resources: ["hierro", "oro", "carbón", "cobre", "litio"],
      resourceProduction: {
        hierro: 180,
        oro: 120,
        carbón: 160,
        cobre: 140,
        litio: 100,
      },
      resourceReserves: {
        hierro: 3500,
        oro: 2200,
        carbón: 2800,
        cobre: 2400,
        litio: 1800,
      },
    },
    population: 26000000,
    stability: 87,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 50,
    powerLevel: "regional",
    geopoliticalBlock: "nato",
    alliances: ["usa", "uk", "canada", "japan"],
    neighbors: ["new_zealand", "indonesia"],
    diplomaticRelations: {
      usa: 90,
      uk: 85,
      canada: 80,
      japan: 80,
      new_zealand: 95,
    },
    conspiracyInfluence: {
      geoengineering: 12,
      masonic: 18,
      legal: 15,
    },
  },
  {
    id: "new_zealand",
    name: "Nueva Zelanda",
    president: "Christopher Luxon", // Actualizado: Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 250,
      debt: 35, // 35% del PIB
      resources: ["agricultura", "turismo", "pesca"],
      resourceProduction: {
        agricultura: 99,
        turismo: 85,
        pesca: 56,
      },
      resourceReserves: {
        agricultura: 1782,
        turismo: 2040,
        pesca: 952,
      },
    },
    population: 5000000,
    stability: 95,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 15,
    powerLevel: "minor",
    geopoliticalBlock: "nato",
    alliances: ["australia", "uk", "usa"],
    neighbors: ["australia"],
    diplomaticRelations: {
      australia: 95,
      uk: 80,
      usa: 75,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 5,
      legal: 18,
    },
  },
  // NUEVO PAÍS AFRICANO
  {
    id: "ghana",
    name: "Ghana",
    president: "John Mahama", // Actualizado: Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 180,
      debt: 85, // 85% del PIB - alta deuda
      resources: ["oro", "cacao", "diamantes", "bauxita", "manganeso"],
      resourceProduction: {
        oro: 100,
        cacao: 80,
        diamantes: 60,
        bauxita: 70,
        manganeso: 50,
      },
      resourceReserves: {
        oro: 1500,
        cacao: 1200,
        diamantes: 900,
        bauxita: 1100,
        manganeso: 800,
      },
    },
    population: 32000000,
    stability: 65,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["nigeria", "south_africa"],
    neighbors: ["burkina_faso", "togo", "ivory_coast"],
    diplomaticRelations: {
      nigeria: 70,
      south_africa: 60,
      uk: 55,
      usa: 50,
      china: 60,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 3,
      legal: 10,
    },
  },
  {
    id: "egypt",
    name: "Egipto",
    president: "Abdel Fattah el-Sisi", // Actualizado: Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 500,
      debt: 95, // 95% del PIB
      resources: ["turismo", "petróleo", "agricultura"],
      resourceProduction: {
        turismo: 76,
        "petróleo": 80,
        agricultura: 71,
      },
      resourceReserves: {
        turismo: 1292,
        "petróleo": 1920,
        agricultura: 1349,
      },
    },
    population: 104000000,
    stability: 45,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 40,
    powerLevel: "regional",
    geopoliticalBlock: "middle_east",
    alliances: ["saudi_arabia", "israel"],
    neighbors: ["libya", "sudan", "israel"],
    diplomaticRelations: {
      saudi_arabia: 70,
      israel: 30,
      usa: 60,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 15,
      legal: 5,
    },
  },
  {
    id: "argentina",
    name: "Argentina",
    president: "Javier Milei", // Actualizado: Presidente real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 900,
      debt: 105, // 105% del PIB - muy alta deuda
      resources: ["agricultura", "carne", "litio"],
      resourceProduction: {
        agricultura: 70,
        carne: 64,
        litio: 88,
      },
      resourceReserves: {
        agricultura: 1330,
        carne: 1472,
        litio: 2112,
      },
    },
    population: 45000000,
    stability: 58,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 35,
    powerLevel: "regional",
    geopoliticalBlock: "latin_america",
    alliances: ["brazil", "chile", "mexico"],
    neighbors: ["brazil", "chile", "bolivia", "paraguay", "uruguay"],
    diplomaticRelations: {
      brazil: 80,
      chile: 70,
      mexico: 55,
      uk: -20,
    },
    conspiracyInfluence: {
      geoengineering: 7,
      masonic: 10,
      legal: 12,
    },
  },
  {
    id: "chile",
    name: "Chile",
    president: "Gabriel Boric", // Actualizado: Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 350,
      debt: 35, // 35% del PIB - baja deuda
      resources: ["cobre", "litio", "vino"],
      resourceProduction: {
        cobre: 60,
        litio: 55,
        vino: 56,
      },
      resourceReserves: {
        cobre: 1260,
        litio: 825,
        vino: 896,
      },
    },
    population: 19000000,
    stability: 78,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "regional",
    geopoliticalBlock: "latin_america",
    alliances: ["argentina", "usa"],
    neighbors: ["argentina", "bolivia", "peru"],
    diplomaticRelations: {
      argentina: 70,
      usa: 75,
      peru: 50,
    },
    conspiracyInfluence: {
      geoengineering: 4,
      masonic: 8,
      legal: 15,
    },
  },
  {
    id: "italy",
    name: "Italia",
    president: "Giorgia Meloni", // Actualizado: Primera Ministra real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 2400,
      debt: 150, // 150% del PIB - muy alta deuda
      resources: ["turismo", "manufactura", "agricultura"],
      resourceProduction: {
        turismo: 72,
        manufactura: 82,
        agricultura: 79,
      },
      resourceReserves: {
        turismo: 1224,
        manufactura: 1476,
        agricultura: 1422,
      },
    },
    population: 59000000,
    stability: 72,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 55,
    powerLevel: "major",
    geopoliticalBlock: "eu",
    alliances: ["france", "germany", "spain"],
    neighbors: ["france", "switzerland", "austria", "slovenia"],
    diplomaticRelations: {
      france: 85,
      germany: 80,
      spain: 75,
      usa: 65,
    },
    conspiracyInfluence: {
      geoengineering: 6,
      masonic: 25,
      legal: 18,
    },
  },
  {
    id: "spain",
    name: "España",
    president: "Pedro Sánchez", // Actualizado: Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 1600,
      debt: 115, // 115% del PIB
      resources: ["turismo", "agricultura", "energía renovable"],
      resourceProduction: {
        turismo: 84,
        agricultura: 64,
        "energía renovable": 75,
      },
      resourceReserves: {
        turismo: 1260,
        agricultura: 1344,
        "energía renovable": 1500,
      },
    },
    population: 47000000,
    stability: 80,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 45,
    powerLevel: "major",
    geopoliticalBlock: "eu",
    alliances: ["france", "germany", "italy"],
    neighbors: ["france", "portugal"],
    diplomaticRelations: {
      france: 80,
      germany: 75,
      italy: 75,
      portugal: 90,
      mexico: 65,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 15,
      legal: 20,
    },
  },
  {
    id: "portugal",
    name: "Portugal",
    president: "Luís Montenegro", // Actualizado: Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 250,
      debt: 130, // 130% del PIB
      resources: ["turismo", "vino", "pesca"],
      resourceProduction: {
        turismo: 91,
        vino: 58,
        pesca: 79,
      },
      resourceReserves: {
        turismo: 1365,
        vino: 1392,
        pesca: 1264,
      },
    },
    population: 10000000,
    stability: 85,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["spain", "brazil"],
    neighbors: ["spain"],
    diplomaticRelations: {
      spain: 90,
      brazil: 85,
      uk: 70,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 12,
      legal: 18,
    },
  },
  {
    id: "turkey",
    name: "Turquía",
    president: "Recep Tayyip Erdoğan", // Actualizado: Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 900,
      debt: 40, // 40% del PIB
      resources: ["turismo", "textiles", "agricultura"],
      resourceProduction: {
        turismo: 90,
        textiles: 57,
        agricultura: 93,
      },
      resourceReserves: {
        turismo: 1440,
        textiles: 1083,
        agricultura: 1581,
      },
    },
    population: 84000000,
    stability: 65,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 60,
    powerLevel: "regional",
    geopoliticalBlock: "middle_east",
    alliances: ["saudi_arabia"],
    neighbors: ["greece", "bulgaria", "georgia", "armenia", "iran", "iraq", "syria"],
    diplomaticRelations: {
      saudi_arabia: 60,
      usa: 30,
      russia: 40,
      iran: 50,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 12,
      legal: 10,
    },
  },
  {
    id: "iran",
    name: "Irán",
    president: "Masoud Pezeshkian", // Actualizado: Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 650,
      debt: 25, // 25% del PIB - baja por sanciones
      resources: ["petróleo", "gas natural", "agricultura"],
      resourceProduction: {
        "petróleo": 80,
        "gas natural": 118,
        agricultura: 84,
      },
      resourceReserves: {
        "petróleo": 1600,
        "gas natural": 2124,
        agricultura: 1344,
      },
    },
    population: 84000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 50,
    powerLevel: "regional",
    geopoliticalBlock: "brics",
    alliances: ["china", "russia", "north_korea"],
    neighbors: ["turkey", "iraq", "afghanistan", "pakistan"],
    diplomaticRelations: {
      china: 70,
      russia: 60,
      north_korea: 50,
      usa: -90,
      israel: -95,
    },
    conspiracyInfluence: {
      geoengineering: 10,
      masonic: 5,
      legal: 8,
    },
  },
  {
    id: "saudi_arabia",
    name: "Arabia Saudí",
    president: "Mohammed bin Salman",
    ideology: "Autoritarismo",
    economy: {
      gdp: 800,
      debt: 25, // 25% del PIB - baja deuda por petróleo
      resources: ["petróleo", "gas natural", "oro", "plata"],
      resourceProduction: {
        petróleo: 350,
        "gas natural": 180,
        oro: 40,
        plata: 60,
      },
      resourceReserves: {
        petróleo: 8000,
        "gas natural": 3200,
        oro: 600,
        plata: 900,
      },
    },
    population: 35000000,
    stability: 70,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 55,
    powerLevel: "regional",
    geopoliticalBlock: "middle_east",
    alliances: ["usa", "egypt", "turkey"],
    neighbors: ["iraq", "jordan", "yemen", "oman", "uae"],
    diplomaticRelations: {
      usa: 80,
      egypt: 70,
      turkey: 60,
      iran: -80,
    },
    conspiracyInfluence: {
      geoengineering: 12,
      masonic: 20,
      legal: 5,
    },
  },
  // ESTADOS SOBERANOS (sin alianzas, neutrales)
  {
    id: "iceland",
    name: "Islandia",
    president: "Kristrún Frostadóttir", // Actualizado: Primera Ministra real 2025
    ideology: "Neutralidad",
    economy: {
      gdp: 25,
      debt: 65, // 65% del PIB
      resources: ["pesca", "energía geotérmica", "turismo"],
      resourceProduction: {
        pesca: 89,
        "energía geotérmica": 64,
        turismo: 61,
      },
      resourceReserves: {
        pesca: 2047,
        "energía geotérmica": 1536,
        turismo: 915,
      },
    },
    population: 370000,
    stability: 98,
    legalSystem: "natural",
    isSovereign: true,
    militaryStrength: 5,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: [],
    neighbors: [],
    diplomaticRelations: {
      norway: 85,
      denmark: 80,
      uk: 70,
    },
    conspiracyInfluence: {
      geoengineering: 0,
      masonic: 0,
      legal: 0,
    },
  },
  {
    id: "liechtenstein",
    name: "Liechtenstein",
    president: "Brigitte Haas", // Actualizado: Primera Ministra real 2025
    ideology: "Neutralidad",
    economy: {
      gdp: 8,
      debt: 15, // 15% del PIB - muy baja
      resources: ["servicios financieros", "manufactura", "turismo"],
      resourceProduction: {
        "servicios financieros": 153,
        manufactura: 77,
        turismo: 63,
      },
      resourceReserves: {
        "servicios financieros": 3519,
        manufactura: 1309,
        turismo: 1449,
      },
    },
    population: 39000,
    stability: 95,
    legalSystem: "natural",
    isSovereign: true,
    militaryStrength: 2,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: [],
    neighbors: ["switzerland", "austria"],
    diplomaticRelations: {
      switzerland: 95,
      austria: 90,
      germany: 85,
    },
    conspiracyInfluence: {
      geoengineering: 0,
      masonic: 0,
      legal: 0,
    },
  },
  {
    id: "switzerland",
    name: "Suiza",
    president: "Karin Keller-Sutter", // Actualizado: Presidenta real 2025
    ideology: "Neutralidad",
    economy: {
      gdp: 900,
      debt: 45, // 45% del PIB
      resources: ["servicios financieros", "turismo", "manufactura"],
      resourceProduction: {
        "servicios financieros": 135,
        turismo: 69,
        manufactura: 83,
      },
      resourceReserves: {
        "servicios financieros": 2835,
        turismo: 1242,
        manufactura: 1826,
      },
    },
    population: 8700000,
    stability: 95,
    legalSystem: "natural",
    isSovereign: true,
    militaryStrength: 25,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: [],
    neighbors: ["germany", "france", "italy", "austria", "liechtenstein"],
    diplomaticRelations: {
      liechtenstein: 95,
      austria: 90,
      germany: 85,
    },
    conspiracyInfluence: {
      geoengineering: 0,
      masonic: 0,
      legal: 0,
    },
  },
  // NUEVOS PAÍSES AFRICANOS
  {
    id: "kenya",
    name: "Kenia",
    president: "William Ruto", // Actualizado: Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 120,
      debt: 70, // 70% del PIB
      resources: ["café", "té", "turismo", "flores", "horticultura"],
      resourceProduction: {
        café: 60,
        té: 80,
        turismo: 40,
        flores: 50,
        horticultura: 45,
      },
      resourceReserves: {
        café: 900,
        té: 1200,
        turismo: 600,
        flores: 750,
        horticultura: 680,
      },
    },
    population: 54000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["south_africa", "ethiopia"],
    neighbors: ["ethiopia", "somalia", "tanzania", "uganda"],
    diplomaticRelations: {
      south_africa: 65,
      ethiopia: 70,
      nigeria: 60,
      uk: 60,
      usa: 55,
      china: 50,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 4,
      legal: 8,
    },
  },
  {
    id: "morocco",
    name: "Marruecos",
    president: "Aziz Akhannouch", // Actualizado: Primer Ministro real 2025 (Rey Mohammed VI)
    ideology: "Autoritarismo",
    economy: {
      gdp: 140,
      debt: 75, // 75% del PIB
      resources: ["fosfatos", "turismo", "agricultura", "pesca", "textiles"],
      resourceProduction: {
        fosfatos: 120,
        turismo: 60,
        agricultura: 70,
        pesca: 50,
        textiles: 55,
      },
      resourceReserves: {
        fosfatos: 2800, // Mayores reservas mundiales
        turismo: 900,
        agricultura: 1050,
        pesca: 750,
        textiles: 825,
      },
    },
    population: 37000000,
    stability: 60,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 35,
    powerLevel: "regional",
    geopoliticalBlock: "africa",
    alliances: ["saudi_arabia", "egypt"],
    neighbors: ["algeria", "spain"],
    diplomaticRelations: {
      saudi_arabia: 70,
      egypt: 65,
      spain: 75,
      france: 70,
      usa: 60,
      algeria: -30, // Tensiones históricas
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 8,
      legal: 10,
    },
  },
  {
    id: "ethiopia",
    name: "Etiopía",
    president: "Abiy Ahmed", // Ya era correcto - Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 110,
      debt: 60, // 60% del PIB
      resources: ["café", "agricultura", "ganadería", "oro", "textiles"],
      resourceProduction: {
        café: 100, // Origen del café
        agricultura: 80,
        ganadería: 90,
        oro: 30,
        textiles: 40,
      },
      resourceReserves: {
        café: 1500, // Cuna del café
        agricultura: 1200,
        ganadería: 1350,
        oro: 450,
        textiles: 600,
      },
    },
    population: 120000000,
    stability: 45, // Inestabilidad política
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 30,
    powerLevel: "regional",
    geopoliticalBlock: "africa",
    alliances: ["kenya", "south_africa"],
    neighbors: ["kenya", "sudan", "somalia", "eritrea", "djibouti"],
    diplomaticRelations: {
      kenya: 70,
      south_africa: 60,
      china: 65, // Fuerte cooperación con China
      usa: 40,
      sudan: 30, // Tensiones por la presa
      egypt: -20, // Conflicto por el Nilo
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 2,
      legal: 5,
    },
  },
  // NUEVOS PAÍSES AÑADIDOS
  // GROENLANDIA
  {
    id: "greenland",
    name: "Groenlandia",
    president: "Múte Bourup Egede", // Primer Ministro real 2025
    ideology: "Neutralidad",
    economy: {
      gdp: 3,
      debt: 20, // 20% del PIB - muy baja deuda
      resources: ["pesca", "minerales", "turismo", "hielo", "energía renovable"],
      resourceProduction: {
        pesca: 80,
        minerales: 40,
        turismo: 25,
        hielo: 100,
        "energía renovable": 60,
      },
      resourceReserves: {
        pesca: 1200,
        minerales: 800,
        turismo: 400,
        hielo: 2000,
        "energía renovable": 900,
      },
    },
    population: 56000,
    stability: 92,
    legalSystem: "natural",
    isSovereign: true,
    militaryStrength: 5,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: [],
    neighbors: ["canada", "iceland"],
    diplomaticRelations: {
      canada: 85,
      iceland: 80,
      denmark: 70, // Relación compleja por autonomía
      usa: 60,
    },
    conspiracyInfluence: {
      geoengineering: 0,
      masonic: 0,
      legal: 0,
    },
  },
  // NUEVOS PAÍSES LATINOAMERICANOS
  {
    id: "colombia",
    name: "Colombia",
    president: "Gustavo Petro", // Presidente real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 350,
      debt: 60, // 60% del PIB
      resources: ["café", "petróleo", "carbón", "esmeraldas", "flores"],
      resourceProduction: {
        café: 120,
        petróleo: 90,
        carbón: 80,
        esmeraldas: 60,
        flores: 100,
      },
      resourceReserves: {
        café: 1800,
        petróleo: 1400,
        carbón: 1200,
        esmeraldas: 900,
        flores: 1500,
      },
    },
    population: 52000000,
    stability: 50,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 35,
    powerLevel: "regional",
    geopoliticalBlock: "latin_america",
    alliances: ["brazil", "mexico"],
    neighbors: ["brazil", "venezuela", "ecuador", "peru", "panama"],
    diplomaticRelations: {
      brazil: 75,
      mexico: 65,
      usa: 55,
      venezuela: -30, // Tensiones políticas
      ecuador: 60,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 10,
      legal: 12,
    },
  },
  {
    id: "peru",
    name: "Perú",
    president: "Dina Boluarte", // Presidenta real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 240,
      debt: 35, // 35% del PIB
      resources: ["cobre", "oro", "plata", "zinc", "pesca"],
      resourceProduction: {
        cobre: 150,
        oro: 120,
        plata: 100,
        zinc: 80,
        pesca: 90,
      },
      resourceReserves: {
        cobre: 2400,
        oro: 1800,
        plata: 1500,
        zinc: 1200,
        pesca: 1350,
      },
    },
    population: 33000000,
    stability: 45,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 30,
    powerLevel: "regional",
    geopoliticalBlock: "latin_america",
    alliances: ["chile", "colombia"],
    neighbors: ["colombia", "brazil", "bolivia", "chile", "ecuador"],
    diplomaticRelations: {
      chile: 65,
      colombia: 60,
      brazil: 55,
      bolivia: 40, // Tensiones históricas
      ecuador: 50,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 8,
      legal: 15,
    },
  },
  // NUEVOS PAÍSES EUROPEOS
  {
    id: "netherlands",
    name: "Holanda",
    president: "Dick Schoof", // Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 1000,
      debt: 55, // 55% del PIB
      resources: ["agricultura", "gas natural", "tecnología", "servicios financieros"],
      resourceProduction: {
        agricultura: 110,
        "gas natural": 70,
        tecnología: 130,
        "servicios financieros": 90,
      },
      resourceReserves: {
        agricultura: 1650,
        "gas natural": 1050,
        tecnología: 1950,
        "servicios financieros": 1350,
      },
    },
    population: 17500000,
    stability: 88,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 45,
    powerLevel: "major",
    geopoliticalBlock: "eu",
    alliances: ["germany", "france", "uk"],
    neighbors: ["germany", "belgium"],
    diplomaticRelations: {
      germany: 90,
      france: 85,
      uk: 75,
      belgium: 95,
      usa: 70,
    },
    conspiracyInfluence: {
      geoengineering: 6,
      masonic: 18,
      legal: 22,
    },
  },
  {
    id: "sweden",
    name: "Suecia",
    president: "Ulf Kristersson", // Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 550,
      debt: 40, // 40% del PIB
      resources: ["hierro", "madera", "tecnología", "energía renovable"],
      resourceProduction: {
        hierro: 90,
        madera: 150,
        tecnología: 110,
        "energía renovable": 120,
      },
      resourceReserves: {
        hierro: 1350,
        madera: 2250,
        tecnología: 1650,
        "energía renovable": 1800,
      },
    },
    population: 10500000,
    stability: 92,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 40,
    powerLevel: "regional",
    geopoliticalBlock: "eu",
    alliances: ["norway", "denmark", "germany"],
    neighbors: ["norway", "finland"],
    diplomaticRelations: {
      norway: 95,
      denmark: 90,
      germany: 80,
      finland: 85,
      usa: 75,
    },
    conspiracyInfluence: {
      geoengineering: 3,
      masonic: 12,
      legal: 25,
    },
  },
  {
    id: "norway",
    name: "Noruega",
    president: "Jonas Gahr Støre", // Primer Ministro real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 480,
      debt: 35, // 35% del PIB - muy baja por petróleo
      resources: ["petróleo", "gas natural", "pesca", "energía renovable"],
      resourceProduction: {
        petróleo: 200,
        "gas natural": 180,
        pesca: 100,
        "energía renovable": 140,
      },
      resourceReserves: {
        petróleo: 3000,
        "gas natural": 2700,
        pesca: 1500,
        "energía renovable": 2100,
      },
    },
    population: 5500000,
    stability: 95,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 35,
    powerLevel: "regional",
    geopoliticalBlock: "eu",
    alliances: ["sweden", "denmark", "uk"],
    neighbors: ["sweden", "finland", "russia"],
    diplomaticRelations: {
      sweden: 95,
      denmark: 90,
      uk: 80,
      finland: 85,
      russia: -40, // Tensiones por fronteras árticas
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 8,
      legal: 20,
    },
  },
  // NUEVOS PAÍSES ASIA/OCEANÍA
  {
    id: "indonesia",
    name: "Indonesia",
    president: "Prabowo Subianto", // Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 1400,
      debt: 40, // 40% del PIB
      resources: ["petróleo", "gas natural", "carbón", "palma", "especias"],
      resourceProduction: {
        petróleo: 110,
        "gas natural": 100,
        carbón: 140,
        palma: 200,
        especias: 80,
      },
      resourceReserves: {
        petróleo: 1650,
        "gas natural": 1500,
        carbón: 2100,
        palma: 3000,
        especias: 1200,
      },
    },
    population: 275000000,
    stability: 60,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 50,
    powerLevel: "regional",
    geopoliticalBlock: "neutral",
    alliances: ["australia"],
    neighbors: ["australia", "malaysia", "singapore", "philippines"],
    diplomaticRelations: {
      australia: 70,
      china: 60,
      usa: 55,
      singapore: 80,
      malaysia: 75,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 6,
      legal: 12,
    },
  },
  {
    id: "philippines",
    name: "Filipinas",
    president: "Ferdinand Marcos Jr.", // Presidente real 2025
    ideology: "Capitalismo",
    economy: {
      gdp: 400,
      debt: 65, // 65% del PIB
      resources: ["níquel", "cobre", "oro", "agricultura", "pesca"],
      resourceProduction: {
        níquel: 80,
        cobre: 70,
        oro: 60,
        agricultura: 90,
        pesca: 85,
      },
      resourceReserves: {
        níquel: 1200,
        cobre: 1050,
        oro: 900,
        agricultura: 1350,
        pesca: 1275,
      },
    },
    population: 112000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 35,
    powerLevel: "regional",
    geopoliticalBlock: "neutral",
    alliances: ["usa"],
    neighbors: ["china", "indonesia", "malaysia"],
    diplomaticRelations: {
      usa: 85,
      china: -20, // Disputas en Mar de China Meridional
      indonesia: 65,
      malaysia: 60,
      japan: 70,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 8,
      legal: 10,
    },
  },
  // NUEVOS PAÍSES AÑADIDOS
  {
    id: "greece",
    name: "Grecia",
    president: "Katerina Sakellaropoulou", // Presidenta real 2025
    ideology: "Democracia",
    economy: {
      gdp: 190,
      debt: 180, // 180% del PIB - alta deuda
      resources: ["turismo", "agricultura", "pesca", "mármol"],
      resourceProduction: {
        turismo: 120,
        agricultura: 80,
        pesca: 60,
        mármol: 40,
      },
      resourceReserves: {
        turismo: 1800,
        agricultura: 1200,
        pesca: 900,
        mármol: 600,
      },
    },
    population: 10700000,
    stability: 70,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 40,
    powerLevel: "regional",
    geopoliticalBlock: "eu",
    alliances: ["germany", "france", "italy"],
    neighbors: ["turkey", "bulgaria", "albania"],
    diplomaticRelations: {
      germany: 75,
      france: 70,
      italy: 80,
      turkey: -30, // Tensiones históricas
      bulgaria: 60,
    },
    conspiracyInfluence: {
      geoengineering: 4,
      masonic: 12,
      legal: 18,
    },
  },
  {
    id: "algeria",
    name: "Argelia",
    president: "Abdelmadjid Tebboune", // Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 170,
      debt: 60, // 60% del PIB
      resources: ["petróleo", "gas natural", "hierro", "fosfatos"],
      resourceProduction: {
        petróleo: 140,
        "gas natural": 120,
        hierro: 70,
        fosfatos: 50,
      },
      resourceReserves: {
        petróleo: 2100,
        "gas natural": 1800,
        hierro: 1050,
        fosfatos: 750,
      },
    },
    population: 45000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 45,
    powerLevel: "regional",
    geopoliticalBlock: "africa",
    alliances: ["morocco", "egypt"],
    neighbors: ["morocco", "tunisia", "libya", "niger", "mali"],
    diplomaticRelations: {
      morocco: -20, // Tensiones por Sahara Occidental
      egypt: 60,
      france: 40,
      russia: 50,
      china: 55,
    },
    conspiracyInfluence: {
      geoengineering: 6,
      masonic: 8,
      legal: 12,
    },
  },
  {
    id: "niger",
    name: "Níger",
    president: "Abdourahamane Tchiani", // Líder militar tras golpe 2023
    ideology: "Autoritarismo",
    economy: {
      gdp: 15,
      debt: 45, // 45% del PIB
      resources: ["uranio", "oro", "ganado", "agricultura"],
      resourceProduction: {
        uranio: 80,
        oro: 30,
        ganado: 40,
        agricultura: 35,
      },
      resourceReserves: {
        uranio: 1200,
        oro: 450,
        ganado: 600,
        agricultura: 525,
      },
    },
    population: 26000000,
    stability: 30, // Baja por golpe militar
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["mali", "burkina_faso"],
    neighbors: ["algeria", "libya", "chad", "nigeria", "benin", "burkina_faso", "mali"],
    diplomaticRelations: {
      france: -60, // Tensiones tras golpe
      russia: 40,
      china: 35,
      nigeria: 50,
      algeria: 45,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 3,
      legal: 8,
    },
  },
  {
    id: "syria",
    name: "Siria",
    president: "Ahmed al-Sharaa", // Líder de facto tras caída de Assad 2024
    ideology: "Autoritarismo",
    economy: {
      gdp: 25, // Muy bajo por guerra civil
      debt: 200, // 200% del PIB - devastada por guerra
      resources: ["petróleo", "gas natural", "agricultura", "fosfatos"],
      resourceProduction: {
        petróleo: 20, // Muy reducido por guerra
        "gas natural": 15,
        agricultura: 25,
        fosfatos: 10,
      },
      resourceReserves: {
        petróleo: 300,
        "gas natural": 225,
        agricultura: 375,
        fosfatos: 150,
      },
    },
    population: 22000000, // Reducida por guerra y refugiados
    stability: 25, // Muy baja por transición política
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "minor",
    geopoliticalBlock: "middle_east",
    alliances: [],
    neighbors: ["turkey", "iraq", "jordan", "lebanon", "israel"],
    diplomaticRelations: {
      turkey: 60, // Apoyo en transición
      russia: -30, // Cambio tras caída de Assad
      iran: -50, // Pérdida de influencia
      israel: -40,
      jordan: 40,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 5,
      legal: 10,
    },
  },
  {
    id: "bulgaria",
    name: "Bulgaria",
    president: "Rumen Radev", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 85,
      debt: 25, // 25% del PIB - baja deuda
      resources: ["agricultura", "cobre", "zinc", "turismo"],
      resourceProduction: {
        agricultura: 70,
        cobre: 40,
        zinc: 35,
        turismo: 60,
      },
      resourceReserves: {
        agricultura: 1050,
        cobre: 600,
        zinc: 525,
        turismo: 900,
      },
    },
    population: 6900000,
    stability: 65,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["romania", "greece"],
    neighbors: ["romania", "serbia", "macedonia", "greece", "turkey"],
    diplomaticRelations: {
      romania: 70,
      greece: 60,
      germany: 65,
      russia: -20, // Tensiones por gas
      turkey: 45,
    },
    conspiracyInfluence: {
      geoengineering: 3,
      masonic: 8,
      legal: 15,
    },
  },
  {
    id: "romania",
    name: "Rumanía",
    president: "Klaus Iohannis", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 250,
      debt: 50, // 50% del PIB
      resources: ["petróleo", "gas natural", "agricultura", "madera"],
      resourceProduction: {
        petróleo: 60,
        "gas natural": 50,
        agricultura: 90,
        madera: 70,
      },
      resourceReserves: {
        petróleo: 900,
        "gas natural": 750,
        agricultura: 1350,
        madera: 1050,
      },
    },
    population: 19000000,
    stability: 70,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 35,
    powerLevel: "regional",
    geopoliticalBlock: "eu",
    alliances: ["poland", "bulgaria"],
    neighbors: ["ukraine", "moldova", "bulgaria", "serbia", "hungary"],
    diplomaticRelations: {
      poland: 75,
      bulgaria: 70,
      germany: 70,
      ukraine: 80, // Apoyo fuerte
      russia: -40, // Tensiones por Ucrania
    },
    conspiracyInfluence: {
      geoengineering: 4,
      masonic: 10,
      legal: 16,
    },
  },
  {
    id: "croatia",
    name: "Croacia",
    president: "Zoran Milanović", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 65,
      debt: 80, // 80% del PIB
      resources: ["turismo", "agricultura", "pesca", "madera"],
      resourceProduction: {
        turismo: 100,
        agricultura: 50,
        pesca: 40,
        madera: 35,
      },
      resourceReserves: {
        turismo: 1500,
        agricultura: 750,
        pesca: 600,
        madera: 525,
      },
    },
    population: 3900000,
    stability: 75,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["slovenia", "hungary"],
    neighbors: ["slovenia", "hungary", "serbia", "bosnia", "montenegro"],
    diplomaticRelations: {
      slovenia: 80,
      hungary: 70,
      germany: 75,
      serbia: 40, // Tensiones históricas
      bosnia: 50,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 6,
      legal: 12,
    },
  },
  {
    id: "yemen",
    name: "Yemen",
    president: "Rashad al-Alimi", // Presidente del Consejo de Liderazgo 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 20, // Muy bajo por guerra civil
      debt: 150, // 150% del PIB - devastada por guerra
      resources: ["petróleo", "gas natural", "pesca", "agricultura"],
      resourceProduction: {
        petróleo: 30, // Muy reducido por guerra
        "gas natural": 20,
        pesca: 25,
        agricultura: 15,
      },
      resourceReserves: {
        petróleo: 450,
        "gas natural": 300,
        pesca: 375,
        agricultura: 225,
      },
    },
    population: 30000000,
    stability: 20, // Muy baja por guerra civil
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 15,
    powerLevel: "minor",
    geopoliticalBlock: "middle_east",
    alliances: ["saudi_arabia"],
    neighbors: ["saudi_arabia", "oman"],
    diplomaticRelations: {
      "saudi_arabia": 70, // Apoyo en guerra
      iran: -70, // Guerra proxy
      usa: 50,
      oman: 60,
      egypt: 45,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 3,
      legal: 8,
    },
  },
  {
    id: "afghanistan",
    name: "Afganistán",
    president: "Hibatullah Akhundzada", // Líder Supremo Talibán 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 15, // Muy bajo por sanciones y colapso
      debt: 20, // 20% del PIB - baja por aislamiento
      resources: ["litio", "cobre", "hierro", "agricultura"],
      resourceProduction: {
        litio: 40, // Potencial no explotado
        cobre: 25,
        hierro: 30,
        agricultura: 35,
      },
      resourceReserves: {
        litio: 600, // Grandes reservas
        cobre: 375,
        hierro: 450,
        agricultura: 525,
      },
    },
    population: 40000000,
    stability: 35, // Baja por régimen talibán
    legalSystem: "natural", // Sharia
    isSovereign: false,
    militaryStrength: 30,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: [],
    neighbors: ["pakistan", "iran", "china", "uzbekistan", "tajikistan", "turkmenistan"],
    diplomaticRelations: {
      pakistan: 60,
      iran: 40,
      china: 50, // Interés en litio
      russia: 35,
      usa: -80, // Muy tensas
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 2,
      legal: 5,
    },
  },
  // Kazajistán
  {
    id: "kazakhstan",
    name: "Kazajistán",
    president: "Kassym-Jomart Tokayev", // Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 263, // $262.642 billion USD 2023
      debt: 25, // 25% del PIB - baja deuda
      resources: ["petróleo", "gas natural", "uranio", "oro", "cobre"],
      resourceProduction: {
        petróleo: 85,
        "gas natural": 60,
        uranio: 40,
        oro: 35,
        cobre: 30,
      },
      resourceReserves: {
        petróleo: 1275,
        "gas natural": 900,
        uranio: 600,
        oro: 525,
        cobre: 450,
      },
    },
    population: 20330000,
    stability: 65,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 40,
    powerLevel: "regional",
    geopoliticalBlock: "brics",
    alliances: ["russia", "china"],
    neighbors: ["russia", "china", "uzbekistan", "kyrgyzstan"],
    diplomaticRelations: {
      russia: 80,
      china: 75,
      uzbekistan: 60,
      kyrgyzstan: 55,
      usa: 40,
    },
    conspiracyInfluence: {
      geoengineering: 8,
      masonic: 5,
      legal: 12,
    },
  },
  // Ucrania
  {
    id: "ukraine",
    name: "Ucrania",
    president: "Volodymyr Zelensky", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 179, // $178.757 billion USD 2023
      debt: 90, // 90% del PIB - alta por guerra
      resources: ["trigo", "maíz", "hierro", "carbón", "gas natural"],
      resourceProduction: {
        trigo: 70,
        maíz: 60,
        hierro: 40,
        carbón: 35,
        "gas natural": 25,
      },
      resourceReserves: {
        trigo: 1050,
        maíz: 900,
        hierro: 600,
        carbón: 525,
        "gas natural": 375,
      },
    },
    population: 37733000, // Reducida por guerra y refugiados
    stability: 40, // Baja por guerra
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 60, // Alta por apoyo occidental
    powerLevel: "regional",
    geopoliticalBlock: "eu",
    alliances: ["poland", "romania", "usa", "uk"],
    neighbors: ["poland", "romania", "belarus", "russia", "moldova"],
    diplomaticRelations: {
      poland: 90,
      romania: 85,
      usa: 95,
      uk: 90,
      russia: -95, // Guerra
      belarus: -70,
    },
    conspiracyInfluence: {
      geoengineering: 5,
      masonic: 8,
      legal: 15,
    },
  },
  // Polonia
  {
    id: "poland",
    name: "Polonia",
    president: "Andrzej Duda", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 809, // $809.201 billion USD 2023
      debt: 55, // 55% del PIB
      resources: ["carbón", "cobre", "plata", "agricultura", "madera"],
      resourceProduction: {
        carbón: 90,
        cobre: 50,
        plata: 40,
        agricultura: 80,
        madera: 60,
      },
      resourceReserves: {
        carbón: 1350,
        cobre: 750,
        plata: 600,
        agricultura: 1200,
        madera: 900,
      },
    },
    population: 38763000,
    stability: 75,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 50,
    powerLevel: "regional",
    geopoliticalBlock: "eu",
    alliances: ["ukraine", "romania", "usa", "germany"],
    neighbors: ["germany", "ukraine", "belarus", "lithuania", "slovakia", "czech_republic"],
    diplomaticRelations: {
      ukraine: 90,
      romania: 75,
      usa: 85,
      germany: 70,
      russia: -60, // Tensiones por Ucrania
    },
    conspiracyInfluence: {
      geoengineering: 6,
      masonic: 12,
      legal: 18,
    },
  },
  // Austria
  {
    id: "austria",
    name: "Austria",
    president: "Alexander Van der Bellen", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 512, // $511.685 billion USD 2023
      debt: 80, // 80% del PIB
      resources: ["turismo", "hierro", "madera", "agricultura", "tecnología"],
      resourceProduction: {
        turismo: 120,
        hierro: 45,
        madera: 70,
        agricultura: 60,
        tecnología: 50,
      },
      resourceReserves: {
        turismo: 1800,
        hierro: 675,
        madera: 1050,
        agricultura: 900,
        tecnología: 750,
      },
    },
    population: 9130000,
    stability: 80,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["germany", "switzerland"],
    neighbors: ["germany", "switzerland", "italy", "slovenia", "hungary", "slovakia", "czech_republic"],
    diplomaticRelations: {
      germany: 85,
      switzerland: 80,
      italy: 75,
      ukraine: 70, // Apoyo humanitario
      russia: 30, // Neutralidad pero tensiones
    },
    conspiracyInfluence: {
      geoengineering: 4,
      masonic: 15,
      legal: 20,
    },
  },
  // República del Congo
  {
    id: "congo_drc",
    name: "República Democrática del Congo",
    president: "Félix Tshisekedi", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 65, // Estimado por conflictos
      debt: 25, // 25% del PIB - baja por aislamiento
      resources: ["cobalto", "cobre", "diamantes", "oro", "coltán"],
      resourceProduction: {
        cobalto: 80, // Mayor productor mundial
        cobre: 60,
        diamantes: 45,
        oro: 35,
        coltán: 70,
      },
      resourceReserves: {
        cobalto: 1200, // Enormes reservas
        cobre: 900,
        diamantes: 675,
        oro: 525,
        coltán: 1050,
      },
    },
    population: 102000000,
    stability: 35, // Baja por conflictos
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "regional",
    geopoliticalBlock: "africa",
    alliances: ["south_africa", "angola"],
    neighbors: ["angola", "zambia", "tanzania", "uganda", "central_african_republic", "cameroon"],
    diplomaticRelations: {
      south_africa: 60,
      angola: 55,
      china: 70, // Inversión en minería
      usa: 45,
      france: 40,
    },
    conspiracyInfluence: {
      geoengineering: 3,
      masonic: 4,
      legal: 8,
    },
  },
  // Bolivia
  {
    id: "bolivia",
    name: "Bolivia",
    president: "Luis Arce", // Presidente real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 45, // Estimado por crisis económica
      debt: 80, // 80% del PIB - alta deuda
      resources: ["litio", "gas natural", "plata", "zinc", "estaño"],
      resourceProduction: {
        litio: 60, // Grandes reservas
        "gas natural": 40,
        plata: 35,
        zinc: 30,
        estaño: 25,
      },
      resourceReserves: {
        litio: 900, // Mayores reservas mundiales
        "gas natural": 600,
        plata: 525,
        zinc: 450,
        estaño: 375,
      },
    },
    population: 12000000,
    stability: 50, // Media por tensiones políticas
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "latin_america",
    alliances: ["argentina", "venezuela"],
    neighbors: ["brazil", "peru", "chile", "argentina", "paraguay"],
    diplomaticRelations: {
      argentina: 70,
      venezuela: 65,
      brazil: 60,
      chile: 45,
      usa: 30, // Tensiones por ideología
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 3,
      legal: 8,
    },
  },
  // Paraguay
  {
    id: "paraguay",
    name: "Paraguay",
    president: "Santiago Peña", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 42, // Estimado
      debt: 35, // 35% del PIB - deuda moderada
      resources: ["soja", "carne", "algodón", "madera", "energía hidroeléctrica"],
      resourceProduction: {
        soja: 70,
        carne: 50,
        algodón: 40,
        madera: 35,
        "energía hidroeléctrica": 80,
      },
      resourceReserves: {
        soja: 1050,
        carne: 750,
        algodón: 600,
        madera: 525,
        "energía hidroeléctrica": 1200,
      },
    },
    population: 7400000,
    stability: 65,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 15,
    powerLevel: "minor",
    geopoliticalBlock: "latin_america",
    alliances: ["brazil", "argentina"],
    neighbors: ["brazil", "argentina", "bolivia"],
    diplomaticRelations: {
      brazil: 80,
      argentina: 75,
      bolivia: 60,
      usa: 65,
      china: 55,
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 4,
      legal: 10,
    },
  },
  // Cuba
  {
    id: "cuba",
    name: "Cuba",
    president: "Miguel Díaz-Canel", // Presidente real 2025
    ideology: "Socialismo",
    economy: {
      gdp: 107, // $107.351 billion USD 2020 (último dato disponible)
      debt: 40, // 40% del PIB - controlada por estado
      resources: ["azúcar", "tabaco", "níquel", "turismo", "medicinas"],
      resourceProduction: {
        azúcar: 60,
        tabaco: 45,
        níquel: 35,
        turismo: 50,
        medicinas: 40,
      },
      resourceReserves: {
        azúcar: 900,
        tabaco: 675,
        níquel: 525,
        turismo: 750,
        medicinas: 600,
      },
    },
    population: 11300000,
    stability: 60, // Estable pero con tensiones económicas
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 30,
    powerLevel: "minor",
    geopoliticalBlock: "latin_america",
    alliances: ["venezuela", "nicaragua"],
    neighbors: ["usa"], // Proximidad geográfica
    diplomaticRelations: {
      venezuela: 85,
      nicaragua: 80,
      russia: 70,
      china: 65,
      usa: -70, // Embargo
    },
    conspiracyInfluence: {
      geoengineering: 3,
      masonic: 2,
      legal: 5,
    },
  },
  // Mongolia
  {
    id: "mongolia",
    name: "Mongolia",
    president: "Ukhnaa Khurelsukh", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 18, // Estimado
      debt: 70, // 70% del PIB - alta dependencia externa
      resources: ["cobre", "oro", "carbón", "carne", "lana"],
      resourceProduction: {
        cobre: 50,
        oro: 30,
        carbón: 40,
        carne: 35,
        lana: 25,
      },
      resourceReserves: {
        cobre: 750,
        oro: 450,
        carbón: 600,
        carne: 525,
        lana: 375,
      },
    },
    population: 3400000,
    stability: 70,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 10,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: ["kazakhstan"],
    neighbors: ["china", "russia", "kazakhstan"],
    diplomaticRelations: {
      china: 75, // Principal socio comercial
      russia: 70,
      kazakhstan: 65,
      usa: 50,
      japan: 60,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 3,
      legal: 6,
    },
  },

  // Nuevos países añadidos
  {
    id: "libya",
    name: "Libia",
    president: "Mohamed al-Menfi", // Presidente del Consejo Presidencial
    ideology: "Democracia",
    economy: {
      gdp: 25, // Estimado por conflictos
      debt: 155, // Alta deuda por guerra
      resources: ["petróleo", "gas natural", "hierro", "sal"],
      resourceProduction: {
        petróleo: 60,
        "gas natural": 40,
        hierro: 15,
        sal: 10,
      },
      resourceReserves: {
        petróleo: 900,
        "gas natural": 600,
        hierro: 225,
        sal: 150,
      },
    },
    population: 7000000,
    stability: 25, // Muy baja por conflictos
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "middle_east",
    alliances: ["egypt", "tunisia"],
    neighbors: ["egypt", "sudan", "chad", "niger", "algeria", "tunisia"],
    diplomaticRelations: {
      egypt: 60,
      tunisia: 55,
      turkey: 50,
      italy: 45,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 3,
      legal: 4,
    },
  },

  {
    id: "chad",
    name: "Chad",
    president: "Mahamat Déby", // Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 11, // PIB muy bajo
      debt: 50,
      resources: ["petróleo", "algodón", "ganado", "goma arábiga"],
      resourceProduction: {
        petróleo: 25,
        algodón: 15,
        ganado: 20,
        "goma arábiga": 10,
      },
      resourceReserves: {
        petróleo: 375,
        algodón: 225,
        ganado: 300,
        "goma arábiga": 150,
      },
    },
    population: 17700000,
    stability: 35, // Baja por conflictos
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 15,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["cameroon", "niger"],
    neighbors: ["libya", "sudan", "central_african_republic", "cameroon", "nigeria", "niger"],
    diplomaticRelations: {
      cameroon: 50,
      niger: 45,
      france: 60, // Ex-colonia
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 2,
      legal: 3,
    },
  },

  {
    id: "tunisia",
    name: "Túnez",
    president: "Kaïs Saied", // Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 47, // Estimado
      debt: 90, // Alta deuda
      resources: ["fosfatos", "petróleo", "turismo", "oliva"],
      resourceProduction: {
        fosfatos: 30,
        petróleo: 20,
        turismo: 40,
        oliva: 25,
      },
      resourceReserves: {
        fosfatos: 450,
        petróleo: 300,
        turismo: 600,
        oliva: 375,
      },
    },
    population: 12000000,
    stability: 45, // Media-baja por crisis política
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "middle_east",
    alliances: ["algeria", "libya"],
    neighbors: ["algeria", "libya"],
    diplomaticRelations: {
      algeria: 65,
      libya: 55,
      france: 50,
      italy: 60,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 4,
      legal: 8,
    },
  },

  {
    id: "mali",
    name: "Malí",
    president: "Assimi Goita", // Presidente interino (junta militar)
    ideology: "Autoritarismo",
    economy: {
      gdp: 19, // PIB bajo
      debt: 40,
      resources: ["oro", "algodón", "ganado", "sal"],
      resourceProduction: {
        oro: 35,
        algodón: 25,
        ganado: 30,
        sal: 15,
      },
      resourceReserves: {
        oro: 525,
        algodón: 375,
        ganado: 450,
        sal: 225,
      },
    },
    population: 22000000,
    stability: 25, // Muy baja por conflictos
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["niger", "burkina_faso"],
    neighbors: ["algeria", "niger", "burkina_faso", "ivory_coast", "guinea", "senegal", "mauritania"],
    diplomaticRelations: {
      niger: 70,
      burkina_faso: 65,
      france: -50, // Tensiones post-golpe
      russia: 65,
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 2,
      legal: 3,
    },
  },

  {
    id: "sudan",
    name: "Sudán",
    president: "Abdel Fattah Abdelrahman Burhan", // Líder del Consejo Militar
    ideology: "Autoritarismo",
    economy: {
      gdp: 35, // Estimado por conflictos
      debt: 200, // Deuda externa muy alta
      resources: ["petróleo", "oro", "algodón", "ganado"],
      resourceProduction: {
        petróleo: 30,
        oro: 25,
        algodón: 20,
        ganado: 35,
      },
      resourceReserves: {
        petróleo: 450,
        oro: 375,
        algodón: 300,
        ganado: 525,
      },
    },
    population: 47000000,
    stability: 20, // Muy baja por guerra civil
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "minor",
    geopoliticalBlock: "middle_east",
    alliances: ["egypt", "saudi_arabia"],
    neighbors: ["egypt", "libya", "chad", "central_african_republic", "south_sudan", "ethiopia", "eritrea"],
    diplomaticRelations: {
      egypt: 60,
      saudi_arabia: 55,
      ethiopia: 40,
      usa: 30,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 3,
      legal: 5,
    },
  },

  {
    id: "gabon",
    name: "Gabón",
    president: "Brice Oligui Nguema", // Presidente de transición
    ideology: "Autoritarismo",
    economy: {
      gdp: 20, // Estimado
      debt: 65,
      resources: ["petróleo", "manganeso", "madera", "uranio"],
      resourceProduction: {
        petróleo: 40,
        manganeso: 30,
        madera: 25,
        uranio: 15,
      },
      resourceReserves: {
        petróleo: 600,
        manganeso: 450,
        madera: 375,
        uranio: 225,
      },
    },
    population: 2400000,
    stability: 40, // Media-baja por golpe
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 12,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["cameroon", "congo"],
    neighbors: ["cameroon", "equatorial_guinea", "congo"],
    diplomaticRelations: {
      cameroon: 55,
      congo: 50,
      france: 45, // Ex-colonia
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 3,
      legal: 5,
    },
  },

  {
    id: "mauritania",
    name: "Mauritania",
    president: "Mohamed Ould Ghazouani", // Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 8, // PIB muy bajo
      debt: 75,
      resources: ["hierro", "oro", "cobre", "pescado"],
      resourceProduction: {
        hierro: 25,
        oro: 15,
        cobre: 10,
        pescado: 30,
      },
      resourceReserves: {
        hierro: 375,
        oro: 225,
        cobre: 150,
        pescado: 450,
      },
    },
    population: 4900000,
    stability: 50,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 10,
    powerLevel: "minor",
    geopoliticalBlock: "africa",
    alliances: ["morocco", "senegal"],
    neighbors: ["morocco", "algeria", "mali", "senegal"],
    diplomaticRelations: {
      morocco: 60,
      senegal: 55,
      algeria: 50,
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 2,
      legal: 4,
    },
  },

  {
    id: "uzbekistan",
    name: "Uzbekistán",
    president: "Shavkat Mirziyoyev", // Presidente real 2025
    ideology: "Autoritarismo",
    economy: {
      gdp: 80, // Estimado
      debt: 35,
      resources: ["gas natural", "oro", "algodón", "uranio"],
      resourceProduction: {
        "gas natural": 50,
        oro: 35,
        algodón: 40,
        uranio: 25,
      },
      resourceReserves: {
        "gas natural": 750,
        oro: 525,
        algodón: 600,
        uranio: 375,
      },
    },
    population: 35000000,
    stability: 65,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 25,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: ["kazakhstan", "kyrgyzstan"],
    neighbors: ["kazakhstan", "kyrgyzstan", "tajikistan", "afghanistan", "turkmenistan"],
    diplomaticRelations: {
      kazakhstan: 70,
      kyrgyzstan: 65,
      russia: 60,
      china: 65,
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 3,
      legal: 6,
    },
  },

  {
    id: "tajikistan",
    name: "Tayikistán",
    president: "Emomali Rahmon", // Presidente de larga data
    ideology: "Autoritarismo",
    economy: {
      gdp: 9, // PIB muy bajo
      debt: 50,
      resources: ["aluminio", "algodón", "energía hidroeléctrica", "oro"],
      resourceProduction: {
        aluminio: 20,
        algodón: 15,
        "energía hidroeléctrica": 30,
        oro: 10,
      },
      resourceReserves: {
        aluminio: 300,
        algodón: 225,
        "energía hidroeléctrica": 450,
        oro: 150,
      },
    },
    population: 10000000,
    stability: 55,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 15,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: ["uzbekistan", "kyrgyzstan"],
    neighbors: ["uzbekistan", "kyrgyzstan", "china", "afghanistan"],
    diplomaticRelations: {
      uzbekistan: 60,
      kyrgyzstan: 55,
      russia: 70,
      china: 65,
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 2,
      legal: 4,
    },
  },

  {
    id: "kyrgyzstan",
    name: "Kirguistán",
    president: "Sadyr Japarov", // Presidente actual
    ideology: "Autoritarismo",
    economy: {
      gdp: 9, // PIB muy bajo
      debt: 60,
      resources: ["oro", "energía hidroeléctrica", "algodón", "antimonio"],
      resourceProduction: {
        oro: 25,
        "energía hidroeléctrica": 20,
        algodón: 15,
        antimonio: 10,
      },
      resourceReserves: {
        oro: 375,
        "energía hidroeléctrica": 300,
        algodón: 225,
        antimonio: 150,
      },
    },
    population: 7000000,
    stability: 50, // Media por inestabilidad política
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 12,
    powerLevel: "minor",
    geopoliticalBlock: "neutral",
    alliances: ["uzbekistan", "tajikistan"],
    neighbors: ["uzbekistan", "tajikistan", "china", "kazakhstan"],
    diplomaticRelations: {
      uzbekistan: 65,
      tajikistan: 55,
      russia: 65,
      china: 60,
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 2,
      legal: 3,
    },
  },

  {
    id: "moldova",
    name: "Moldavia",
    president: "Maia Sandu", // Presidenta real 2025
    ideology: "Democracia",
    economy: {
      gdp: 14, // PIB bajo
      debt: 35,
      resources: ["vino", "agricultura", "textiles", "maquinaria"],
      resourceProduction: {
        vino: 30,
        agricultura: 25,
        textiles: 15,
        maquinaria: 10,
      },
      resourceReserves: {
        vino: 450,
        agricultura: 375,
        textiles: 225,
        maquinaria: 150,
      },
    },
    population: 2600000,
    stability: 55, // Media por tensiones con Transnistria
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 8,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["romania", "ukraine"],
    neighbors: ["romania", "ukraine"],
    diplomaticRelations: {
      romania: 80,
      ukraine: 75,
      russia: -30, // Tensiones por Transnistria
      eu: 70,
    },
    conspiracyInfluence: {
      geoengineering: 1,
      masonic: 3,
      legal: 8,
    },
  },

  {
    id: "estonia",
    name: "Estonia",
    president: "Alar Karis", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 38, // Estimado
      debt: 20, // Baja deuda
      resources: ["tecnología", "madera", "turismo", "energía renovable"],
      resourceProduction: {
        tecnología: 40,
        madera: 25,
        turismo: 20,
        "energía renovable": 15,
      },
      resourceReserves: {
        tecnología: 600,
        madera: 375,
        turismo: 300,
        "energía renovable": 225,
      },
    },
    population: 1300000,
    stability: 85, // Alta estabilidad
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 15,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["latvia", "lithuania", "finland"],
    neighbors: ["latvia", "russia"],
    diplomaticRelations: {
      latvia: 90,
      lithuania: 85,
      finland: 80,
      russia: -60, // Tensiones históricas
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 8,
      legal: 15,
    },
  },

  {
    id: "latvia",
    name: "Letonia",
    president: "Edgars Rinkēvičs", // Presidente actual 2025
    ideology: "Democracia",
    economy: {
      gdp: 40, // Estimado
      debt: 45,
      resources: ["madera", "agricultura", "tecnología", "turismo"],
      resourceProduction: {
        madera: 30,
        agricultura: 25,
        tecnología: 20,
        turismo: 15,
      },
      resourceReserves: {
        madera: 450,
        agricultura: 375,
        tecnología: 300,
        turismo: 225,
      },
    },
    population: 1900000,
    stability: 80,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 18,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["estonia", "lithuania", "poland"],
    neighbors: ["estonia", "lithuania", "russia", "belarus"],
    diplomaticRelations: {
      estonia: 90,
      lithuania: 85,
      poland: 75,
      russia: -65, // Tensiones históricas
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 8,
      legal: 12,
    },
  },

  {
    id: "lithuania",
    name: "Lituania",
    president: "Gitanas Nausėda", // Presidente real 2025
    ideology: "Democracia",
    economy: {
      gdp: 70, // Estimado
      debt: 40,
      resources: ["agricultura", "tecnología", "madera", "turismo"],
      resourceProduction: {
        agricultura: 35,
        tecnología: 30,
        madera: 25,
        turismo: 20,
      },
      resourceReserves: {
        agricultura: 525,
        tecnología: 450,
        madera: 375,
        turismo: 300,
      },
    },
    population: 2800000,
    stability: 80,
    legalSystem: "positiva",
    isSovereign: false,
    militaryStrength: 20,
    powerLevel: "minor",
    geopoliticalBlock: "eu",
    alliances: ["estonia", "latvia", "poland"],
    neighbors: ["latvia", "poland", "belarus", "russia"],
    diplomaticRelations: {
      estonia: 85,
      latvia: 85,
      poland: 80,
      russia: -70, // Tensiones por Kaliningrado
    },
    conspiracyInfluence: {
      geoengineering: 2,
      masonic: 10,
      legal: 15,
    },
  },
]

// Definición de bloques geopolíticos
export const geopoliticalBlocks = {
  nato: {
    id: "nato",
    name: "OTAN/Occidente",
    members: ["usa", "uk", "canada", "australia", "new_zealand", "japan", "south_korea", "israel"],
    leader: "usa",
    mutualDefense: true,
    economicCooperation: true,
    description: "Alianza militar occidental liderada por Estados Unidos",
  },
  eu: {
    id: "eu",
    name: "Unión Europea",
    members: ["germany", "france", "italy", "spain", "portugal", "netherlands", "sweden", "norway", "greece", "bulgaria", "romania", "croatia", "poland", "austria", "moldova", "estonia", "latvia", "lithuania"],
    leader: "germany",
    mutualDefense: true,
    economicCooperation: true,
    description: "Unión política y económica europea",
  },
  brics: {
    id: "brics",
    name: "BRICS+",
    members: ["china", "russia", "india", "brazil", "south_africa", "iran", "north_korea"],
    leader: "china",
    mutualDefense: false,
    economicCooperation: true,
    description: "Alianza económica de economías emergentes",
  },
  africa: {
    id: "africa",
    name: "Unión Africana",
    members: ["nigeria", "south_africa", "ghana", "kenya", "morocco", "ethiopia", "algeria", "niger", "libya", "chad", "tunisia", "mali", "sudan", "gabon", "mauritania"],
    leader: "south_africa",
    mutualDefense: false,
    economicCooperation: true,
    description: "Cooperación africana para desarrollo económico",
  },
  latin_america: {
    id: "latin_america",
    name: "América Latina",
    members: ["mexico", "brazil", "argentina", "chile", "colombia", "peru"],
    leader: "brazil",
    mutualDefense: false,
    economicCooperation: true,
    description: "Cooperación latinoamericana",
  },
  middle_east: {
    id: "middle_east",
    name: "Oriente Medio",
    members: ["saudi_arabia", "egypt", "turkey", "syria", "yemen"],
    leader: "saudi_arabia",
    mutualDefense: false,
    economicCooperation: true,
    description: "Cooperación en Oriente Medio",
  },
  neutral: {
    id: "neutral",
    name: "Países Neutrales",
    members: ["iceland", "liechtenstein", "switzerland", "greenland", "indonesia", "philippines", "afghanistan", "uzbekistan", "tajikistan", "kyrgyzstan"],
    leader: undefined,
    mutualDefense: false,
    economicCooperation: false,
    description: "Estados soberanos neutrales",
  },
}
