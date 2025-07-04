"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, MapPin, ThumbsUp } from "lucide-react";
import { formatTime } from "@/lib/date-utils";
import { apiService, Category, Tweet } from "@/lib/api";

interface TweetFeedProps {
  onTweetLocationClick?: (lat: number, lng: number) => void;
}

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
          {formatTime(tweet.timestamp)}
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

export function TweetFeed({ onTweetLocationClick }: TweetFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
  }, []);

  // Tweets filtering and sorting, display only limited time tweets
  const DAYS_LIMIT = 14;
  const filteredTweets = tweets
    .filter((tweet) => {
      const tweetDate = new Date(tweet.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DAYS_LIMIT);

      const matchesSearch =
        search === "" ||
        tweet.text.toLowerCase().includes(search.toLowerCase()) ||
        tweet.location.toLowerCase().includes(search.toLowerCase()) ||
        tweet.username.toLowerCase().includes(search.toLowerCase());

      return matchesSearch && tweetDate >= thirtyDaysAgo;
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "need" | "resource" | "uncategorized"
  >("all");
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>("all");

  const filterBySubGroup = (tweets: Tweet[]) => {
    if (selectedSubGroup === "all") return tweets;
    return tweets.filter(
      (t) => t.classifier?.classified_sub_group === selectedSubGroup,
    );
  };

  const subGroups = useMemo(() => {
    return Array.from(
      new Set(
        filteredTweets
          .filter((t) => t.category === selectedCategory)
          .map((t) => t.classifier?.classified_sub_group)
          .filter(Boolean),
      ),
    );
  }, [filteredTweets, selectedCategory]);

  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      selectedCategory !== "uncategorized" &&
      subGroups.length > 0
    ) {
      setSelectedSubGroup(subGroups[0]!);
    } else {
      setSelectedSubGroup("all");
    }
  }, [selectedCategory, subGroups.join("|")]);

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
      <FeedTweet
        key={tweet.id}
        tweet={tweet}
        onClick={() =>
          onTweetLocationClick?.(tweet.coordinates.lat, tweet.coordinates.lng)
        }
      />
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

      <Tabs
        defaultValue="all"
        value={selectedCategory}
        onValueChange={(val) => {
          setSelectedCategory(val as typeof selectedCategory);
          setSelectedSubGroup("all");
        }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="need" className="flex-1">
            <div className="relative">
              Needs
              {needTweets.length > 0 && (
                <Badge className="absolute -top-4 -right-6 min-w-[5px] h-5 p-1 flex items-center justify-center text-xs rounded-full">
                  {needTweets.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="resource" className="flex-1">
            <div className="relative">
              Resources
              {resourceTweets.length > 0 && (
                <Badge className="absolute -top-4 -right-6 min-w-[5px] h-5 p-1 flex items-center justify-center text-xs rounded-full">
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
                  className="absolute -top-4 -right-6 min-w-[5px] h-5 p-1 flex items-center justify-center text-xs rounded-full"
                >
                  {alertTweets.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        {subGroups.length > 0 &&
          selectedCategory !== "all" &&
          selectedCategory !== "uncategorized" && (
            <Tabs
              value={selectedSubGroup}
              onValueChange={(val) => setSelectedSubGroup(val)}
              className="mx-2 mt-2"
            >
              <TabsList className="h-8 min-h-8 whitespace-nowrap">
                {subGroups.map((subGroup) => (
                  <TabsTrigger
                    key={subGroup}
                    value={subGroup!}
                    className="flex-none h-7 px-2 text-xs whitespace-nowrap"
                  >
                    {subGroup}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-2">
            <TabsContent value="all" className="m-0 p-0 space-y-2">
              {renderTweets(filteredTweets)}
            </TabsContent>
            <TabsContent value="need" className="m-0 p-0 space-y-2">
              {renderTweets(filterBySubGroup(needTweets))}
            </TabsContent>
            <TabsContent value="resource" className="m-0 p-0 space-y-2">
              {renderTweets(filterBySubGroup(resourceTweets))}
            </TabsContent>
            <TabsContent value="uncategorized" className="m-0 p-0 space-y-2">
              {renderTweets(alertTweets)}
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
