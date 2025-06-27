"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, MapPin, ThumbsUp } from "lucide-react";
import { formatTweetTime } from "@/lib/date-utils";
import { apiService, Category, Tweet } from '@/lib/api';

// Composants réutilisables pour réduire la duplication de code
interface CategoryBadgeProps {
  category: Category;
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
    // Charger les tweets depuis l'API
    const loadTweets = async () => {
      setLoading(true);
      try {
        const apiTweets = await apiService.getTweets();
        setTweets(apiTweets);
      } catch (error) {
        console.error("Error loading tweets:", error);
        // Fallback avec quelques tweets d'exemple en cas d'erreur
        setTweets([
          {
            id: "1",
            text: "API connection failed - showing demo data",
            timestamp: new Date().toISOString(),
            username: "SystemAlert",
            category: "uncategorized",
            urgency: "high",
            location: "System",
            coordinates: { lat: 34.052, lng: -118.243 },
            verified: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTweets();

    // Rafraîchir les données périodiquement
    const interval = setInterval(() => {
      loadTweets();
    }, 30000); // Toutes les 30 secondes

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
    (tweet) => tweet.category === "uncategorized",
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
          <TabsTrigger value="uncategorized" className="flex-1">
            <div className="relative">
              Uncategorized
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
          <TabsContent value="uncategorized" className="m-0 p-0 space-y-2">
            {renderTweets(alertTweets)}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
