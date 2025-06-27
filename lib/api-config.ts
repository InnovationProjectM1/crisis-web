// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  ENDPOINTS: {
    TWEETS: "/tweets",
    CLASSIFIERS: "/classifiers",
    TWEET_STATISTICS: "/tweets/statistics",
    GROUP_STATISTICS: "/classifiers/statistics/groups",
    DIFFICULTY_STATISTICS: "/classifiers/statistics/difficulty",
  },
  // Configuration pour les données géographiques par défaut
  DEFAULT_COORDINATES: {
    LAT_BASE: [
      48.8566, 48.8666, 48.8466, 48.8766, 48.8366, 48.8266, 48.8966, 48.8166,
      48.8866,
    ],
    LNG_BASE: [
      2.3522, 2.3622, 2.3422, 2.3722, 2.3322, 2.3222, 2.3822, 2.3122, 2.3922,
    ],
    RANDOM_OFFSET: 0.01,
  },
  // Configuration pour les intervalles de rafraîchissement
  REFRESH_INTERVALS: {
    TWEETS: 30000, // 30 secondes
    STATISTICS: 60000, // 1 minute
    TRENDS: 120000, // 2 minutes
  },
  // Configuration pour les fallback en cas d'erreur
  FALLBACK_DATA: {
    TWEET: {
      id: "1",
      text: "API connection failed - showing demo data",
      timestamp: new Date().toISOString(),
      username: "SystemAlert",
      category: "uncategorized" as const,
      urgency: "high" as const,
      location: "System",
      coordinates: { lat: 48.8566, lng: 2.3522 },
      verified: false,
    },
    REGION: {
      id: "fallback",
      name: "API Connection Failed",
      position: [48.8566, 2.3522] as [number, number],
      needs: [{ type: "medical", count: 1, urgency: "high" }],
      resources: [],
    },
    HEATMAP_REGION: {
      id: "fallback",
      name: "API Connection Failed",
      lat: 48.8566,
      lng: 2.3522,
      needsIntensity: 0.5,
      resourcesIntensity: 0.3,
    },
  },
};

// Helpers pour construire les URLs de l'API
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const buildApiUrlWithParams = (
  endpoint: string,
  params: Record<string, string>,
): string => {
  const url = new URL(buildApiUrl(endpoint));
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};
