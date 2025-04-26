"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, MapPin, ThumbsUp } from "lucide-react";
import { formatTweetTime } from "@/lib/date-utils";

// Composants réutilisables pour réduire la duplication de code
interface CategoryBadgeProps {
  category: "need" | "resource" | "alert";
  className?: string;
}

function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const variant =
    category === "need"
      ? "destructive"
      : category === "resource"
        ? "default"
        : "outline";

  return (
    <Badge variant={variant} className={`text-xs px-1.5 py-0 h-5 ${className}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}

interface UrgencyBadgeProps {
  isUrgent: boolean;
  className?: string;
}

function UrgencyBadge({ isUrgent, className = "" }: UrgencyBadgeProps) {
  if (!isUrgent) return null;

  return (
    <Badge
      variant="outline"
      className={`bg-red-500/10 text-red-500 border-red-500/20 text-xs px-1.5 py-0 h-5 ${className}`}
    >
      <AlertTriangle className="h-3 w-3 mr-1" />
      Urgent
    </Badge>
  );
}

interface VerifiedBadgeProps {
  isVerified: boolean;
  className?: string;
}

function VerifiedBadge({ isVerified, className = "" }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  return (
    <Badge
      variant="outline"
      className={`bg-green-500/10 text-green-500 border-green-500/20 text-xs px-1.5 py-0 h-5 ${className}`}
    >
      <ThumbsUp className="h-3 w-3 mr-1" />
      Verified
    </Badge>
  );
}

interface FeedTweetProps {
  tweet: Tweet;
  onClick?: () => void;
}

function FeedTweet({ tweet, onClick }: FeedTweetProps) {
  return (
    <div
      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium">@{tweet.username}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {formatTweetTime(tweet.timestamp)}
        </div>
      </div>

      <p className="text-sm mb-2">{tweet.text}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CategoryBadge category={tweet.category} />
          <UrgencyBadge isUrgent={tweet.urgency === "high"} />
          <VerifiedBadge isVerified={tweet.verified} />
        </div>

        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          {tweet.location}
        </div>
      </div>
    </div>
  );
}

export function TweetFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading tweets
    const loadTweets = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTweets([
        {
          id: "1",
          text: "Urgent: Need medical supplies at Memorial Hospital. Running low on antibiotics and bandages. #CrisisResponse",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          username: "EmergencyResp",
          category: "need",
          urgency: "high",
          location: "Memorial Hospital, Downtown",
          coordinates: { lat: 34.052, lng: -118.243 },
          verified: true,
        },
        {
          id: "2",
          text: "We have 20 cots and blankets available for distribution at the community center. Can deliver within 5 miles. #Resources",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          username: "CommunityCtr",
          category: "resource",
          urgency: "medium",
          location: "Central Community Center",
          coordinates: { lat: 34.048, lng: -118.258 },
          verified: true,
        },
        {
          id: "3",
          text: "Need volunteers for debris clearing in Westside neighborhood. Tools provided. #Volunteers #CleanUp",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          username: "WestsideHelp",
          category: "need",
          urgency: "medium",
          location: "Westside Neighborhood",
          coordinates: { lat: 34.041, lng: -118.269 },
          verified: false,
        },
        {
          id: "4",
          text: "URGENT: Flooding reported on Main St and 5th Ave. Roads impassable. Seek alternate routes. #FloodAlert",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          username: "CityAlerts",
          category: "alert",
          urgency: "high",
          location: "Main St & 5th Ave",
          coordinates: { lat: 34.056, lng: -118.239 },
          verified: true,
        },
        {
          id: "5",
          text: "Offering free transportation for elderly/disabled from affected areas to shelters. DM for coordination. #Transportation",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          username: "CommunityDrive",
          category: "resource",
          urgency: "medium",
          location: "Citywide",
          coordinates: { lat: 34.05, lng: -118.25 },
          verified: true,
        },
      ]);
      setLoading(false);
    };

    loadTweets();

    // Simulation des tweets périodiques - optimisation avec cleanup
    const interval = setInterval(() => {
      const generateRandomTweet = () => {
        const categories = ["need", "resource", "alert"] as const;
        const urgencies = ["low", "medium", "high"] as const;
        const locations = [
          "North",
          "South",
          "East",
          "West",
          "Central",
          "Downtown",
        ];
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];
        const randomLocation =
          locations[Math.floor(Math.random() * locations.length)];

        const newTweet: Tweet = {
          id: `tweet-${Date.now()}`,
          text: `${randomCategory === "need" ? "Need" : randomCategory === "resource" ? "Offering" : "Alert"}: ${
            [
              "water supplies",
              "medical assistance",
              "shelter",
              "food distribution",
              "transportation",
              "volunteers",
              "power generators",
              "communication devices",
            ][Math.floor(Math.random() * 8)]
          } at ${randomLocation} district.`,
          timestamp: new Date().toISOString(),
          username: `user${Math.floor(Math.random() * 1000)}`,
          category: randomCategory,
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
          location: `${randomLocation} District`,
          coordinates: {
            lat: 34.05 + (Math.random() - 0.5) * 0.1,
            lng: -118.25 + (Math.random() - 0.5) * 0.1,
          },
          verified: Math.random() > 0.7,
        };

        return newTweet;
      };

      // Ajout d'un nouveau tweet en gardant une liste d'une taille raisonnable
      setTweets((prevTweets) => {
        const newTweet = generateRandomTweet();
        const updatedTweets = [newTweet, ...prevTweets].slice(0, 50); // Limite à 50 tweets
        return updatedTweets;
      });

      // Auto-scroll au dernier tweet ajouté
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }, 100);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filtrage des tweets optimisé
  const filteredTweets = tweets.filter(
    (tweet) =>
      search === "" ||
      tweet.text.toLowerCase().includes(search.toLowerCase()) ||
      tweet.location.toLowerCase().includes(search.toLowerCase()) ||
      tweet.username.toLowerCase().includes(search.toLowerCase()),
  );

  // Tweets filtrés par catégorie pour les onglets
  const needTweets = filteredTweets.filter(
    (tweet) => tweet.category === "need",
  );
  const resourceTweets = filteredTweets.filter(
    (tweet) => tweet.category === "resource",
  );
  const alertTweets = filteredTweets.filter(
    (tweet) => tweet.category === "alert",
  );

  // Fonction pour afficher les tweets selon la catégorie
  const renderTweets = (categoryTweets: Tweet[]) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (categoryTweets.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          No tweets to display
        </div>
      );
    }

    return categoryTweets.map((tweet) => (
      <FeedTweet key={tweet.id} tweet={tweet} />
    ));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden border rounded-md">
      <div className="flex items-center gap-2 p-2 border-b">
        <input
          type="text"
          placeholder="Search tweets..."
          className="flex-1 text-sm border rounded-md px-3 py-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="needs" className="flex-1">
            <div className="relative">
              Needs
              {needTweets.length > 0 && (
                <Badge className="absolute -top-3 -right-3 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {needTweets.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex-1">
            <div className="relative">
              Resources
              {resourceTweets.length > 0 && (
                <Badge className="absolute -top-3 -right-3 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {resourceTweets.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex-1">
            <div className="relative">
              Alerts
              {alertTweets.length > 0 && (
                <Badge
                  variant={
                    alertTweets.some((t) => t.urgency === "high")
                      ? "destructive"
                      : "default"
                  }
                  className="absolute -top-3 -right-3 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                >
                  {alertTweets.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-2" ref={scrollRef}>
          <TabsContent value="all" className="m-0 p-0 space-y-2">
            {renderTweets(filteredTweets)}
          </TabsContent>
          <TabsContent value="needs" className="m-0 p-0 space-y-2">
            {renderTweets(needTweets)}
          </TabsContent>
          <TabsContent value="resources" className="m-0 p-0 space-y-2">
            {renderTweets(resourceTweets)}
          </TabsContent>
          <TabsContent value="alerts" className="m-0 p-0 space-y-2">
            {renderTweets(alertTweets)}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// Types et utilitaires
interface Tweet {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  category: "need" | "resource" | "alert";
  urgency: "low" | "medium" | "high";
  location: string;
  coordinates: { lat: number; lng: number };
  verified: boolean;
}
