"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  Clock,
  MapPin,
  MessageSquare,
  Search,
  ThumbsUp,
} from "lucide-react";

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

interface TweetCardProps {
  tweet: Tweet;
  isSelected: boolean;
  onClick: () => void;
}

function TweetCard({ tweet, isSelected, onClick }: TweetCardProps) {
  return (
    <div
      className={`p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${isSelected ? "border-primary" : ""}`}
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

interface ChartContainerProps {
  barData: Array<{ name: string; value: number }>;
  pieData: Array<{ name: string; value: number }>;
  barDataKey: string;
  barFill?: string;
  colors: string[];
  vertical?: boolean;
}

function ChartContainer({
  barData,
  pieData,
  barDataKey,
  barFill = "#8884d8",
  colors,
  vertical = false,
}: ChartContainerProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <ResponsiveContainer width="100%" height="100%">
        {vertical ? (
          <BarChart
            layout="vertical"
            data={barData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey={barDataKey} fill={barFill} />
          </BarChart>
        ) : (
          <BarChart
            data={barData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={barDataKey} fill={barFill} />
          </BarChart>
        )}
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TweetAnalysis() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);

  useEffect(() => {
    // Simulate loading tweets
    const loadTweets = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const sampleTweets = Array(50)
        .fill(0)
        .map((_, index) => {
          const categories = ["need", "resource", "alert"];
          const urgencies = ["low", "medium", "high"];
          const category = categories[
            Math.floor(Math.random() * categories.length)
          ] as "need" | "resource" | "alert";
          const urgency = urgencies[
            Math.floor(Math.random() * urgencies.length)
          ] as "low" | "medium" | "high";
          const verified = Math.random() > 0.3;

          return {
            id: `tweet-${index + 1}`,
            text: `${category === "need" ? "Need" : category === "resource" ? "Offering" : "Alert"}: ${
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
            } at ${["North", "South", "East", "West", "Central", "Downtown"][Math.floor(Math.random() * 6)]} district.`,
            timestamp: new Date(
              Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7,
            ).toISOString(),
            username: `user${Math.floor(Math.random() * 1000)}`,
            category,
            urgency,
            location: `${["North", "South", "East", "West", "Central", "Downtown"][Math.floor(Math.random() * 6)]} District`,
            coordinates: {
              lat: 34.05 + (Math.random() - 0.5) * 0.1,
              lng: -118.25 + (Math.random() - 0.5) * 0.1,
            },
            verified,
            sentiment: Math.random() * 2 - 1, // -1 to 1
            keywords: [
              ["water", "supplies", "need", "urgent"],
              ["medical", "assistance", "doctors", "nurses"],
              ["shelter", "housing", "accommodation"],
              ["food", "meals", "hungry", "distribution"],
              ["transportation", "vehicles", "evacuation"],
              ["volunteers", "help", "assistance"],
              ["power", "electricity", "generators"],
              ["communication", "phones", "internet"],
            ][Math.floor(Math.random() * 8)],
          };
        });

      setTweets(sampleTweets);
      setLoading(false);
    };

    loadTweets();
  }, []);

  const filteredTweets = tweets.filter((tweet) =>
    searchTerm
      ? tweet.text.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  const handleTweetClick = (tweet: Tweet) => {
    setSelectedTweet(tweet);
  };

  // Calculer les statistiques une seule fois au lieu de multiples appels filter redondants
  const statistics = {
    needsCount: tweets.filter((t) => t.category === "need").length,
    resourcesCount: tweets.filter((t) => t.category === "resource").length,
    alertsCount: tweets.filter((t) => t.category === "alert").length,
    urgentCount: tweets.filter((t) => t.urgency === "high").length,
    verifiedCount: tweets.filter((t) => t.verified).length,
  };

  const categoryData = [
    { name: "Needs", value: statistics.needsCount },
    { name: "Resources", value: statistics.resourcesCount },
    { name: "Alerts", value: statistics.alertsCount },
  ];

  const urgencyData = [
    { name: "High", value: tweets.filter((t) => t.urgency === "high").length },
    {
      name: "Medium",
      value: tweets.filter((t) => t.urgency === "medium").length,
    },
    { name: "Low", value: tweets.filter((t) => t.urgency === "low").length },
  ];

  // Calcul optimisé pour éviter de filtrer plusieurs fois
  const locationCounts = tweets.reduce(
    (acc, tweet) => {
      const location = tweet.location.split(" ")[0]; // Extraire la partie Nord, Sud, etc.
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const locationData = Object.entries(locationCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tweet Search & Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tweets..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {statistics.needsCount}
                </div>
                <div className="text-xs text-muted-foreground">Needs</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {statistics.resourcesCount}
                </div>
                <div className="text-xs text-muted-foreground">Resources</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {statistics.alertsCount}
                </div>
                <div className="text-xs text-muted-foreground">Alerts</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-500">
                  {statistics.urgentCount}
                </div>
                <div className="text-xs text-muted-foreground">Urgent</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {statistics.verifiedCount}
                </div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredTweets.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No tweets found
                  </div>
                ) : (
                  filteredTweets.map((tweet) => (
                    <TweetCard
                      key={tweet.id}
                      tweet={tweet}
                      isSelected={selectedTweet?.id === tweet.id}
                      onClick={() => handleTweetClick(tweet)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 md:w-[400px]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tweet Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTweet ? (
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium">
                        @{selectedTweet.username}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {formatTime(selectedTweet.timestamp)}
                      </div>
                    </div>

                    <p className="text-sm mb-2">{selectedTweet.text}</p>

                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={selectedTweet.category} />
                      <UrgencyBadge
                        isUrgent={selectedTweet.urgency === "high"}
                      />
                      <VerifiedBadge isVerified={selectedTweet.verified} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTweet.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>ID: {selectedTweet.id}</span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Sentiment Analysis
                      </h4>
                      <div className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
                        <div
                          className="h-4 w-1 bg-black rounded-full relative -top-1"
                          style={{
                            marginLeft: `${((selectedTweet.sentiment + 1) / 2) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Negative</span>
                        <span>Neutral</span>
                        <span>Positive</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedTweet.keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      Verify
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Flag
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Select a tweet to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tweet Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="category">Category</TabsTrigger>
              <TabsTrigger value="urgency">Urgency</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[300px]">
              <TabsContent value="category" className="h-full">
                <ChartContainer
                  barData={categoryData}
                  pieData={categoryData}
                  barDataKey="value"
                  colors={COLORS}
                />
              </TabsContent>

              <TabsContent value="urgency" className="h-full">
                <ChartContainer
                  barData={urgencyData}
                  pieData={urgencyData}
                  barDataKey="value"
                  barFill="#ff8042"
                  colors={COLORS}
                />
              </TabsContent>

              <TabsContent value="location" className="h-full">
                <ChartContainer
                  barData={locationData}
                  pieData={locationData}
                  barDataKey="value"
                  barFill="#00c49f"
                  vertical={true}
                  colors={COLORS}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
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
  sentiment: number;
  keywords: string[];
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
