"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowUpDown,
  Clock,
  Filter,
  MapPin,
  ThumbsUp,
} from "lucide-react";

interface TweetFeedProps {
  onAlertClick: (data: any) => void;
}

export function TweetFeed({ onAlertClick }: TweetFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);
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

    if (paused) return;
    // Simulate receiving new tweets periodically
    const interval = setInterval(() => {
      const categories = ["need", "resource", "alert"] as const;
      const urgencies = ["low", "medium", "high"] as const;
      const newTweet = {
        id: Math.random().toString(36).substring(2, 9),
        text: `${Math.random() > 0.5 ? "Need" : "Offering"} ${
          ["water", "food", "shelter", "medical aid", "volunteers"][
            Math.floor(Math.random() * 5)
          ]
        } at ${["North", "South", "East", "West"][Math.floor(Math.random() * 4)]} district. #CrisisResponse`,
        timestamp: new Date().toISOString(),
        username: `User${Math.floor(Math.random() * 1000)}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        location: `${["North", "South", "East", "West"][Math.floor(Math.random() * 4)]} District`,
        coordinates: {
          lat: 34.05 + (Math.random() - 0.5) * 0.02,
          lng: -118.25 + (Math.random() - 0.5) * 0.02,
        },
        verified: Math.random() > 0.3,
      };
      setTweets((prev) => [newTweet, ...prev.slice(0, 19)]);
    }, 15000);
    return () => clearInterval(interval);
  }, [paused]);

  // Filtrage par recherche
  const filteredTweets = tweets.filter((t) =>
    search ? t.text.toLowerCase().includes(search.toLowerCase()) : true
  );

  // Comptage par catégorie
  const countAll = filteredTweets.length;
  const countNeeds = filteredTweets.filter((t) => t.category === "need").length;
  const countResources = filteredTweets.filter((t) => t.category === "resource").length;
  const countAlerts = filteredTweets.filter((t) => t.category === "alert").length;

  const handleTweetClick = (tweet: Tweet) => {
    onAlertClick({
      type: "tweet",
      data: tweet,
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Tweet Feed</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring w-32"
          />
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setPaused(p => !p)}>
            {paused ? (
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full"></span>Paused</span>
            ) : (
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>Live</span>
            )}
          </Button>
        </div>
      </div>
      <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="all">All <span className="ml-1 text-xs bg-muted px-1 rounded">{countAll}</span></TabsTrigger>
          <TabsTrigger value="needs">Needs <span className="ml-1 text-xs bg-muted px-1 rounded">{countNeeds}</span></TabsTrigger>
          <TabsTrigger value="resources">Resources <span className="ml-1 text-xs bg-muted px-1 rounded">{countResources}</span></TabsTrigger>
          <TabsTrigger value="alerts">Alerts <span className="ml-1 text-xs bg-muted px-1 rounded">{countAlerts}</span></TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="flex-1 mt-0 min-h-0">
          <TweetList
            tweets={filteredTweets}
            loading={loading}
            onTweetClick={handleTweetClick}
          />
        </TabsContent>
        <TabsContent value="needs" className="flex-1 mt-0 min-h-0">
          <TweetList
            tweets={filteredTweets.filter((t) => t.category === "need")}
            loading={loading}
            onTweetClick={handleTweetClick}
          />
        </TabsContent>
        <TabsContent value="resources" className="flex-1 mt-0 min-h-0">
          <TweetList
            tweets={filteredTweets.filter((t) => t.category === "resource")}
            loading={loading}
            onTweetClick={handleTweetClick}
          />
        </TabsContent>
        <TabsContent value="alerts" className="flex-1 mt-0 min-h-0">
          <TweetList
            tweets={filteredTweets.filter((t) => t.category === "alert")}
            loading={loading}
            onTweetClick={handleTweetClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

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

interface TweetListProps {
  tweets: Tweet[];
  loading: boolean;
  onTweetClick: (tweet: Tweet) => void;
}

function TweetList({ tweets, loading, onTweetClick }: TweetListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No tweets found
      </div>
    );
  }

  return (
    <ScrollArea className="h-full max-h-full min-h-0">
      <div className="space-y-3 pr-3">
        {tweets.map((tweet) => {
          const isNew = Date.now() - new Date(tweet.timestamp).getTime() < 60000;
          return (
            <div
              key={tweet.id}
              className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors relative"
              onClick={() => onTweetClick(tweet)}
            >
              {isNew && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">New</span>
              )}
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
                  <Badge
                    variant={
                      tweet.category === "need"
                        ? "destructive"
                        : tweet.category === "resource"
                          ? "default"
                          : "outline"
                    }
                    className="text-xs px-1.5 py-0 h-5"
                  >
                    {tweet.category.charAt(0).toUpperCase() +
                      tweet.category.slice(1)}
                  </Badge>

                  {tweet.urgency === "high" && (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 border-red-500/20 text-xs px-1.5 py-0 h-5"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}

                  {tweet.verified && (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20 text-xs px-1.5 py-0 h-5"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {tweet.location}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}
