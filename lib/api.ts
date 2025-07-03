import { API_CONFIG, buildApiUrl } from "./api-config";

// Interface pour les tweets de l'API
export interface ApiTweet {
  tweet_id: string;
  tweet_text: string;
  timestamp: Date;
  classifier?: ApiClassifier;
}

// Interface pour les classifiers de l'API
export interface ApiClassifier {
  tweet_id: string;
  classified_group: string;
  classified_sub_group: string;
  severity: string;
  tweet?: ApiTweet;
}

// Interfaces pour les statistiques
export interface TweetStatistics {
  total: number;
  classified: number;
  unclassified: number;
}

export interface GroupStatistics {
  group: string;
  count: string;
}

export interface SeverityStatistics {
  severity: string;
  count: string;
}

// Interface pour les tweets du frontend (compatible avec l'UI existante)
export interface Tweet {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  category: Category;
  urgency: "low" | "medium" | "high";
  location: string;
  coordinates: { lat: number; lng: number };
  verified: boolean;
  classifier?: ApiClassifier;
}

export type Category = "need" | "resource" | "uncategorized";

// Mapping des groupes de classification vers les catégories du frontend
const mapClassificationToCategory = (
  classifier?: ApiClassifier,
): "need" | "resource" | "uncategorized" => {
  if (!classifier) return "uncategorized";

  const group = classifier.classified_group.toLowerCase();

  // Logique de mapping - adaptez selon vos données
  if (
    group.includes("need") ||
    group.includes("require") ||
    group.includes("help") ||
    group.includes("request")
  ) {
    return "need";
  }

  if (
    group.includes("resource") ||
    group.includes("offer") ||
    group.includes("available")
  ) {
    return "resource";
  }

  return "uncategorized";
};

// Mapping severity of classifier to urgency
const mapSeverityToUrgency = (severity?: string): "low" | "medium" | "high" => {
  if (!severity) return "medium";

  const normalized = severity.trim().toLowerCase();

  switch (normalized) {
    case "1":
    case "2":
      return "low";
    case "3":
    case "4":
      return "medium";
    case "5":
      return "high";
    default:
      return "medium";
  }
};

// Conversion d'un tweet API vers un tweet frontend
const convertApiTweetToFrontendTweet = (apiTweet: ApiTweet): Tweet => {
  const category = mapClassificationToCategory(apiTweet.classifier);
  const urgency = mapSeverityToUrgency(apiTweet.classifier?.severity);

  return {
    id: apiTweet.tweet_id,
    text: apiTweet.tweet_text,
    timestamp: new Date(apiTweet.timestamp).toISOString(),
    username: `ScrappedUser`,
    category,
    urgency,
    location: "Unknown",
    coordinates: {
      lat: 48.85 + (Math.random() - 0.5) * 0.1,
      lng: 2.34 + (Math.random() - 0.5) * 0.1,
    },
    verified: !!apiTweet.classifier, //=Classified
    classifier: apiTweet.classifier,
  };
};

class ApiService {
  // Tweets endpoints
  async getTweets(): Promise<Tweet[]> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TWEETS));
      if (!response.ok) {
        throw new Error("Failed to fetch tweets");
      }
      const apiTweets: ApiTweet[] = await response.json();
      return apiTweets.map(convertApiTweetToFrontendTweet);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      return [API_CONFIG.FALLBACK_DATA.TWEET];
    }
  }

  async getTweet(id: number): Promise<ApiTweet> {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.TWEETS}/${id}`),
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch tweet ${id}`);
    }
    return response.json() as Promise<ApiTweet>;
  }

  async getTweetStatistics(): Promise<TweetStatistics> {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.TWEET_STATISTICS),
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tweet statistics");
      }
      return response.json() as Promise<TweetStatistics>;
    } catch (error) {
      console.error("Error fetching tweet statistics:", error);
      return { total: 0, classified: 0, unclassified: 0 };
    }
  }

  // Classifiers endpoints
  async getClassifiers(): Promise<ApiClassifier[]> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CLASSIFIERS));
    if (!response.ok) {
      throw new Error("Failed to fetch classifiers");
    }
    return response.json() as Promise<ApiClassifier[]>;
  }

  async getClassifier(tweetId: number): Promise<ApiClassifier> {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.CLASSIFIERS}/${tweetId}`),
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch classifier for tweet ${tweetId}`);
    }
    return response.json() as Promise<ApiClassifier>;
  }

  async getGroupStatistics(): Promise<GroupStatistics[]> {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.GROUP_STATISTICS),
      );
      if (!response.ok) {
        throw new Error("Failed to fetch group statistics");
      }
      return response.json() as Promise<GroupStatistics[]>;
    } catch (error) {
      console.error("Error fetching group statistics:", error);
      return [];
    }
  }

  async getSeverityStatistics(): Promise<SeverityStatistics[]> {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.SEVERITY_STATISTICS),
      );
      if (!response.ok) {
        throw new Error("Failed to fetch severity statistics");
      }
      return response.json() as Promise<SeverityStatistics[]>;
    } catch (error) {
      console.error("Error fetching severity statistics:", error);
      return [];
    }
  }

  // Méthodes pour obtenir des données pour les graphiques basées sur les vraies données
  async getTrendData(timeRange: "24h" | "7d" | "30d" = "24h"): Promise<
    Array<{
      label: string;
      timestamp: Date;
      Needs: number;
      Resources: number;
      Volunteers: number;
      change?: number;
    }>
  > {
    try {
      const [tweets] = await Promise.all([
        this.getTweets(),
        this.getGroupStatistics(),
      ]);

      // Analyser les données par période
      const now = new Date();
      const dataPoints = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30;
      const data: Array<{
        label: string;
        timestamp: Date;
        Needs: number;
        Resources: number;
        Volunteers: number;
        change?: number;
      }> = [];

      for (let i = 0; i < dataPoints; i++) {
        const date =
          timeRange === "24h"
            ? new Date(now.getTime() - (dataPoints - i - 1) * 60 * 60 * 1000)
            : new Date(
                now.getTime() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000,
              );

        // Filtrer les tweets pour cette période
        const periodTweets = tweets.filter((tweet) => {
          const tweetDate = new Date(tweet.timestamp);
          const nextDate =
            timeRange === "24h"
              ? new Date(date.getTime() + 60 * 60 * 1000)
              : new Date(date.getTime() + 24 * 60 * 60 * 1000);
          return tweetDate >= date && tweetDate < nextDate;
        });

        const needs = periodTweets.filter((t) => t.category === "need").length;
        const resources = periodTweets.filter(
          (t) => t.category === "resource",
        ).length;
        const volunteers = periodTweets.filter(
          (t) => t.urgency === "high",
        ).length;

        data.push({
          label:
            timeRange === "24h"
              ? `${date.getHours()}:00`
              : timeRange === "7d"
                ? date.toLocaleDateString("en", { weekday: "short" })
                : date.toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  }),
          timestamp: date,
          Needs: needs,
          Resources: resources,
          Volunteers: volunteers,
          change:
            i > 0
              ? Math.round(
                  ((needs - data[i - 1]?.Needs || 0) /
                    Math.max(data[i - 1]?.Needs || 1, 1)) *
                    100,
                )
              : 0,
        });
      }

      return data;
    } catch (error) {
      console.error("Error fetching trend data:", error);
      return [];
    }
  }

  // Méthodes pour les données géographiques
  async getRegionData(): Promise<
    Array<{
      id: string;
      name: string;
      position: [number, number];
      needs: Array<{ type: string; count: number; urgency: string }>;
      resources: Array<{ type: string; count: number; urgency: string }>;
    }>
  > {
    try {
      const tweets = await this.getTweets();

      // Grouper les tweets par location
      const locationMap = new Map<string, Tweet[]>();

      tweets.forEach((tweet) => {
        const location = tweet.location || "Unknown";
        if (!locationMap.has(location)) {
          locationMap.set(location, []);
        }
        locationMap.get(location)!.push(tweet);
      });

      // Générer les données de région
      const regions = Array.from(locationMap.entries())
        .map(([location, locationTweets], index) => {
          // Utiliser les coordonnées de configuration
          const lat =
            API_CONFIG.DEFAULT_COORDINATES.LAT_BASE[
              index % API_CONFIG.DEFAULT_COORDINATES.LAT_BASE.length
            ] +
            (Math.random() - 0.5) *
              API_CONFIG.DEFAULT_COORDINATES.RANDOM_OFFSET;
          const lng =
            API_CONFIG.DEFAULT_COORDINATES.LNG_BASE[
              index % API_CONFIG.DEFAULT_COORDINATES.LNG_BASE.length
            ] +
            (Math.random() - 0.5) *
              API_CONFIG.DEFAULT_COORDINATES.RANDOM_OFFSET;

          // Analyser les tweets par catégorie et urgence
          const needTweets = locationTweets.filter(
            (t) => t.category === "need",
          );
          const resourceTweets = locationTweets.filter(
            (t) => t.category === "resource",
          );

          const needs = [
            {
              type: "medical",
              count: needTweets.filter(
                (t) =>
                  t.text.toLowerCase().includes("medical") ||
                  t.text.toLowerCase().includes("doctor"),
              ).length,
              urgency: "high",
            },
            {
              type: "food",
              count: needTweets.filter(
                (t) =>
                  t.text.toLowerCase().includes("food") ||
                  t.text.toLowerCase().includes("water"),
              ).length,
              urgency: "medium",
            },
            {
              type: "shelter",
              count: needTweets.filter(
                (t) =>
                  t.text.toLowerCase().includes("shelter") ||
                  t.text.toLowerCase().includes("housing"),
              ).length,
              urgency: "medium",
            },
          ].filter((resource) => resource.count > 0);

          const resources = [
            {
              type: "volunteers",
              count: resourceTweets.filter(
                (t) =>
                  t.text.toLowerCase().includes("volunteer") ||
                  t.text.toLowerCase().includes("help"),
              ).length,
              urgency: "low",
            },
            {
              type: "supplies",
              count: resourceTweets.filter(
                (t) =>
                  t.text.toLowerCase().includes("supply") ||
                  t.text.toLowerCase().includes("available"),
              ).length,
              urgency: "medium",
            },
          ].filter((resource) => resource.count > 0);

          return {
            id: `region-${index}`,
            name: location,
            position: [lat, lng] as [number, number],
            needs,
            resources,
          };
        })
        .filter(
          (region) => region.needs.length > 0 || region.resources.length > 0,
        );

      return regions;
    } catch (error) {
      console.error("Error fetching region data:", error);
      return [API_CONFIG.FALLBACK_DATA.REGION];
    }
  }

  async getHeatmapData(): Promise<{
    regions: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      needsIntensity: number;
      resourcesIntensity: number;
    }>;
  }> {
    try {
      const tweets = await this.getTweets();

      // Grouper les tweets par location et calculer les intensités
      const locationMap = new Map<string, Tweet[]>();

      tweets.forEach((tweet) => {
        const location = tweet.location || "Unknown";
        if (!locationMap.has(location)) {
          locationMap.set(location, []);
        }
        locationMap.get(location)!.push(tweet);
      });

      // Générer les régions avec les données réelles
      const regions = Array.from(locationMap.entries()).map(
        ([location, locationTweets], index) => {
          // Utiliser les coordonnées de configuration
          const lat =
            API_CONFIG.DEFAULT_COORDINATES.LAT_BASE[
              index % API_CONFIG.DEFAULT_COORDINATES.LAT_BASE.length
            ] +
            (Math.random() - 0.5) *
              API_CONFIG.DEFAULT_COORDINATES.RANDOM_OFFSET;
          const lng =
            API_CONFIG.DEFAULT_COORDINATES.LNG_BASE[
              index % API_CONFIG.DEFAULT_COORDINATES.LNG_BASE.length
            ] +
            (Math.random() - 0.5) *
              API_CONFIG.DEFAULT_COORDINATES.RANDOM_OFFSET;

          // Calculer les intensités basées sur les données réelles
          const totalTweets = locationTweets.length;
          const needTweets = locationTweets.filter(
            (t) => t.category === "need",
          ).length;
          const resourceTweets = locationTweets.filter(
            (t) => t.category === "resource",
          ).length;
          const urgentTweets = locationTweets.filter(
            (t) => t.urgency === "high",
          ).length;

          // Normaliser les intensités (0-1)
          const maxTweetsPerLocation = Math.max(
            ...Array.from(locationMap.values()).map((tweets) => tweets.length),
          );
          const needsIntensity =
            totalTweets > 0
              ? Math.min(
                  1,
                  (needTweets + urgentTweets * 0.5) /
                    Math.max(maxTweetsPerLocation, 1),
                )
              : 0;
          const resourcesIntensity =
            totalTweets > 0
              ? Math.min(1, resourceTweets / Math.max(maxTweetsPerLocation, 1))
              : 0;

          return {
            id: `region-${index}`,
            name: location,
            lat,
            lng,
            needsIntensity: Math.max(0.1, needsIntensity), // Min 0.1 pour la visibilité
            resourcesIntensity: Math.max(0.1, resourcesIntensity),
          };
        },
      );

      return { regions };
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
      return { regions: [API_CONFIG.FALLBACK_DATA.HEATMAP_REGION] };
    }
  }
}

export const apiService = new ApiService();
