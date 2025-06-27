import { API_CONFIG, buildApiUrl } from "./api-config";


// Interface pour les tweets de l'API
export interface ApiTweet {
  tweet_id: number;
  tweet_text: string;
  timestamp: Date;
  classifier?: ApiClassifier;
}

// Interface pour les classifiers de l'API
export interface ApiClassifier {
  tweet_id: number;
  classified_group: string;
  classified_sub_group: string;
  difficulty: string;
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

export interface DifficultyStatistics {
  difficulty: string;
  count: string;
}

// Interface pour les tweets du frontend (compatible avec l'UI existante)
export interface Tweet {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  category: "need" | "resource" | "alert";
  urgency: "low" | "medium" | "high";
  location: string;
  coordinates: { lat: number; lng: number };
  verified: boolean;
  original_tweet_id?: number;
  classifier?: ApiClassifier;
}

// Mapping des groupes de classification vers les catégories du frontend
const mapClassificationToCategory = (
  classifier?: ApiClassifier,
): "need" | "resource" | "alert" => {
  if (!classifier) return "alert";

  const group = classifier.classified_group.toLowerCase();
  const subGroup = classifier.classified_sub_group.toLowerCase();

  // Logique de mapping - adaptez selon vos données
  if (
    group.includes("need") ||
    subGroup.includes("need") ||
    group.includes("require") ||
    subGroup.includes("require") ||
    group.includes("help") ||
    subGroup.includes("help")
  ) {
    return "need";
  }

  if (
    group.includes("resource") ||
    subGroup.includes("resource") ||
    group.includes("offer") ||
    subGroup.includes("offer") ||
    group.includes("available") ||
    subGroup.includes("available")
  ) {
    return "resource";
  }

  return "alert";
};

// Mapping de la difficulté vers l'urgence
const mapDifficultyToUrgency = (
  difficulty?: string,
): "low" | "medium" | "high" => {
  if (!difficulty) return "medium";

  const diff = difficulty.toLowerCase();
  if (
    diff.includes("high") ||
    diff.includes("urgent") ||
    diff.includes("critical")
  ) {
    return "high";
  }
  if (diff.includes("low") || diff.includes("minor")) {
    return "low";
  }
  return "medium";
};

// Conversion d'un tweet API vers un tweet frontend
const convertApiTweetToFrontendTweet = (apiTweet: ApiTweet): Tweet => {
  const category = mapClassificationToCategory(apiTweet.classifier);
  const urgency = mapDifficultyToUrgency(apiTweet.classifier?.difficulty);

  return {
    id: apiTweet.tweet_id.toString(),
    text: apiTweet.tweet_text,
    timestamp: new Date(apiTweet.timestamp).toISOString(),
    username: `user${apiTweet.tweet_id}`, // Généré car pas dans l'API
    category,
    urgency,
    location: apiTweet.classifier?.classified_sub_group || "Unknown Location",
    coordinates: {
      lat: 34.05 + (Math.random() - 0.5) * 0.1, // Coordonnées aléatoires pour la démo
      lng: -118.25 + (Math.random() - 0.5) * 0.1,
    },
    verified: !!apiTweet.classifier, // Vérifié s'il y a une classification
    original_tweet_id: apiTweet.tweet_id,
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

  async getApiTweets(): Promise<ApiTweet[]> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TWEETS));
    if (!response.ok) {
      throw new Error("Failed to fetch tweets");
    }
    return response.json() as Promise<ApiTweet[]>;
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

  async createTweet(
    tweetId: number,
    tweetText: string,
    timestamp?: Date,
  ): Promise<ApiTweet> {
    const tweetData: Partial<ApiTweet> = {
      tweet_id: tweetId,
      tweet_text: tweetText,
    };

    if (timestamp) {
      tweetData.timestamp = timestamp;
    }

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TWEETS), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetData),
    });
    if (!response.ok) {
      throw new Error("Failed to create tweet");
    }
    return response.json() as Promise<ApiTweet>;
  }

  async updateTweet(id: number, tweetText: string): Promise<ApiTweet> {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.TWEETS}/${id}`),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweet_text: tweetText }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to update tweet ${id}`);
    }
    return response.json() as Promise<ApiTweet>;
  }

  async deleteTweet(id: number): Promise<void> {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.TWEETS}/${id}`),
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to delete tweet ${id}`);
    }
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

  async createClassifier(
    classifier: Omit<ApiClassifier, "tweet">,
  ): Promise<ApiClassifier> {
    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.CLASSIFIERS),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classifier),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to create classifier");
    }
    return response.json() as Promise<ApiClassifier>;
  }

  async updateClassifier(
    tweetId: number,
    classifier: Partial<Omit<ApiClassifier, "tweet_id" | "tweet">>,
  ): Promise<ApiClassifier> {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.CLASSIFIERS}/${tweetId}`),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classifier),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to update classifier for tweet ${tweetId}`);
    }
    return response.json() as Promise<ApiClassifier>;
  }

  async deleteClassifier(tweetId: number): Promise<void> {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.CLASSIFIERS}/${tweetId}`),
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to delete classifier for tweet ${tweetId}`);
    }
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

  async getDifficultyStatistics(): Promise<DifficultyStatistics[]> {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.DIFFICULTY_STATISTICS),
      );
      if (!response.ok) {
        throw new Error("Failed to fetch difficulty statistics");
      }
      return response.json() as Promise<DifficultyStatistics[]>;
    } catch (error) {
      console.error("Error fetching difficulty statistics:", error);
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
