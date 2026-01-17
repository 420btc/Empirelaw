export const COUNTRY_FLAGS: Record<string, string> = {
    // Superpotencias y Majors
    usa: "🇺🇸",
    china: "🇨🇳",
    russia: "🇷🇺",
    uk: "🇬🇧",
    germany: "🇩🇪",
    france: "🇫🇷",
    japan: "🇯🇵",
    india: "🇮🇳",
    brazil: "🇧🇷",
    israel: "🇮🇱",
    canada: "🇨🇦",
    south_korea: "🇰🇷",
    australia: "🇦🇺",
    italy: "🇮🇹",
    spain: "🇪🇸",
    turkey: "🇹🇷",
    indonesia: "🇮🇩",
    saudi_arabia: "🇸🇦",
    mexico: "🇲🇽",

    // Europa
    ukraine: "🇺🇦",
    poland: "🇵🇱",
    sweden: "🇸🇪",
    norway: "🇳🇴",
    finland: "🇫🇮",
    netherlands: "🇳🇱",
    belgium: "🇧🇪",
    switzerland: "🇨🇭",
    ireland: "🇮🇪",
    austria: "🇦🇹",
    portugal: "🇵🇹",
    greece: "🇬🇷",

    // Asia
    north_korea: "🇰🇵",
    iran: "🇮🇷",
    pakistan: "🇵🇰",
    vietnam: "🇻🇳",
    thailand: "🇹🇭",
    philippines: "🇵🇭",
    malaysia: "🇲🇾",
    singapore: "🇸🇬",
    taiwan: "🇹🇼",

    // América Latina
    argentina: "🇦🇷",
    colombia: "🇨🇴",
    chile: "🇨🇱",
    peru: "🇵🇪",
    venezuela: "🇻🇪",
    cuba: "🇨🇺",
    bolivia: "🇧🇴",
    ecuador: "🇪🇨",
    uruguay: "🇺🇾",
    paraguay: "🇵🇾",

    // África
    south_africa: "🇿🇦",
    egypt: "🇪🇬",
    nigeria: "🇳🇬",
    kenya: "🇰🇪",
    ethiopia: "🇪🇹",
    morocco: "🇲🇦",
    algeria: "🇩🇿",
    ghana: "🇬🇭",
    congo: "🇨🇩",

    // Otros
    new_zealand: "🇳🇿",

}

export function getCountryFlag(countryId: string): string {
    return COUNTRY_FLAGS[countryId.toLowerCase()] || "🏳️"
}
