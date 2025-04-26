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
  ArrowUpDown,
  Clock,
  Download,
  Filter,
  MapPin,
  MessageSquare,
  Search,
  ThumbsUp,
} from "lucide-react";

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

  // Calculate statistics
  const needsCount = tweets.filter((t) => t.category === "need").length;
  const resourcesCount = tweets.filter((t) => t.category === "resource").length;
  const alertsCount = tweets.filter((t) => t.category === "alert").length;

  const urgentCount = tweets.filter((t) => t.urgency === "high").length;
  const verifiedCount = tweets.filter((t) => t.verified).length;

  const categoryData = [
    { name: "Needs", value: needsCount },
    { name: "Resources", value: resourcesCount },
    { name: "Alerts", value: alertsCount },
  ];

  const urgencyData = [
    { name: "High", value: tweets.filter((t) => t.urgency === "high").length },
    {
      name: "Medium",
      value: tweets.filter((t) => t.urgency === "medium").length,
    },
    { name: "Low", value: tweets.filter((t) => t.urgency === "low").length },
  ];

  const locationData = [
    {
      name: "North",
      value: tweets.filter((t) => t.location.includes("North")).length,
    },
    {
      name: "South",
      value: tweets.filter((t) => t.location.includes("South")).length,
    },
    {
      name: "East",
      value: tweets.filter((t) => t.location.includes("East")).length,
    },
    {
      name: "West",
      value: tweets.filter((t) => t.location.includes("West")).length,
    },
    {
      name: "Central",
      value: tweets.filter((t) => t.location.includes("Central")).length,
    },
    {
      name: "Downtown",
      value: tweets.filter((t) => t.location.includes("Downtown")).length,
    },
  ].sort((a, b) => b.value - a.value);

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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{needsCount}</div>
                <div className="text-xs text-muted-foreground">Needs</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{resourcesCount}</div>
                <div className="text-xs text-muted-foreground">Resources</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{alertsCount}</div>
                <div className="text-xs text-muted-foreground">Alerts</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-500">
                  {urgentCount}
                </div>
                <div className="text-xs text-muted-foreground">Urgent</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {verifiedCount}
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
                    <div
                      key={tweet.id}
                      className={`p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedTweet?.id === tweet.id ? "border-primary" : ""
                      }`}
                      onClick={() => handleTweetClick(tweet)}
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
                      <Badge
                        variant={
                          selectedTweet.category === "need"
                            ? "destructive"
                            : selectedTweet.category === "resource"
                              ? "default"
                              : "outline"
                        }
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        {selectedTweet.category.charAt(0).toUpperCase() +
                          selectedTweet.category.slice(1)}
                      </Badge>

                      {selectedTweet.urgency === "high" && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-500 border-red-500/20 text-xs px-1.5 py-0 h-5"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}

                      {selectedTweet.verified && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-500/20 text-xs px-1.5 py-0 h-5"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
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
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="urgency" className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={urgencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#ff8042" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={urgencyData}
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
                        {urgencyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="location" className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#00c49f" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationData}
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
                        {locationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
