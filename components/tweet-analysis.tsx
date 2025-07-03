"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  ChartBarStacked,
  Clock,
  MapPin,
  Quote,
  Search,
  SearchCheck,
  ShieldAlert,
  ThumbsUp,
} from "lucide-react";
import { apiService, Category, Tweet } from "@/lib/api";
import { formatTime } from "@/lib/date-utils";

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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TweetAnalysis() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les tweets depuis l'API
    const loadTweets = async () => {
      setLoading(true);
      try {
        const apiTweets = await apiService.getTweets();
        setTweets(apiTweets);
        if (apiTweets.length > 0) {
          setSelectedTweet(apiTweets[0]);
        }
      } catch (error) {
        console.error("Error loading tweets:", error);
        // Fallback avec quelques tweets d'exemple en cas d'erreur
        const fallbackTweets: Tweet[] = [
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
        ];
        setTweets(fallbackTweets);
        setSelectedTweet(fallbackTweets[0]);
      } finally {
        setLoading(false);
      }
    };

    loadTweets();
  }, []);

  const filteredTweets = tweets
    .filter((tweet) =>
      searchTerm
        ? tweet.text.toLowerCase().includes(searchTerm.toLowerCase())
        : true,
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const handleTweetClick = (tweet: Tweet) => {
    setSelectedTweet(tweet);
  };

  // Generate analytics data based on filtered tweets
  const categoryData = [
    {
      name: "Need",
      value: filteredTweets.filter((tweet) => tweet.category === "need").length,
    },
    {
      name: "Resource",
      value: filteredTweets.filter((tweet) => tweet.category === "resource")
        .length,
    },
    {
      name: "Uncategorized",
      value: filteredTweets.filter(
        (tweet) => tweet.category === "uncategorized",
      ).length,
    },
  ];

  const urgencyData = [
    {
      name: "High",
      value: filteredTweets.filter((tweet) => tweet.urgency === "high").length,
    },
    {
      name: "Medium",
      value: filteredTweets.filter((tweet) => tweet.urgency === "medium")
        .length,
    },
    {
      name: "Low",
      value: filteredTweets.filter((tweet) => tweet.urgency === "low").length,
    },
  ];

  const locationData = Object.entries(
    filteredTweets.reduce(
      (acc, tweet) => {
        acc[tweet.location] = (acc[tweet.location] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([location, count]) => ({
    name: location,
    value: count,
  }));

  const verificationData = [
    {
      name: "Verified",
      value: filteredTweets.filter((tweet) => tweet.verified).length,
    },
    {
      name: "Unverified",
      value: filteredTweets.filter((tweet) => !tweet.verified).length,
    },
  ];

  const categoryColors = ["#ef4444", "#22c55e", "#f59e0b"];
  const urgencyColors = ["#dc2626", "#f59e0b", "#10b981"];
  const locationColors = [
    "#3b82f6",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
  ];
  const verificationColors = ["#22c55e", "#ef4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Tweet List */}
      <Card className="w-80 flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tweet Analysis feed</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tweets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-250px)] px-4">
            <div className="space-y-2 pb-4">
              {filteredTweets.map((tweet) => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  isSelected={selectedTweet?.id === tweet.id}
                  onClick={() => handleTweetClick(tweet)}
                />
              ))}
              {filteredTweets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tweets found
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Details and Analytics */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Tweet Details */}
        {selectedTweet && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    @{selectedTweet.username}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(selectedTweet.timestamp)} •{" "}
                    {selectedTweet.location}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CategoryBadge category={selectedTweet.category} />
                  <UrgencyBadge isUrgent={selectedTweet.urgency === "high"} />
                  <VerifiedBadge isVerified={selectedTweet.verified} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="relative mb-4">
              <Quote className="h-4 w-4 text-muted-foreground absolute -top-2 left-0 rotate-180" />
              <p className="text-sm italic text-gray-500 border-l pl-3 ml-2">
                {selectedTweet.text}
              </p>
              <Quote className="h-4 w-4 text-muted-foreground absolute -bottom-2 right-0" />
            </div>

              <h2 className="text-lg font-medium mb-2">Analysis</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <ChartBarStacked className="h-4 w-4$" />
                  <span className="font-medium">Category:</span>{" "}
                  {selectedTweet.category}
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4" />
                    Urgency Level: {selectedTweet.classifier?.severity ??
                      "N/A"}{" "}
                    ({selectedTweet.urgency})
                  </h4>

                  <div className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full relative">
                    <div
                      className="h-4 w-1 bg-black rounded-full absolute -top-1"
                      style={{
                        marginLeft: `${((Number(selectedTweet.classifier?.severity ?? 3) - 1) / 4) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location:</span>{" "}
                  {selectedTweet.location}
                </div>
                <div className="flex items-center gap-1">
                  <SearchCheck className="h-4 w-4" />
                  <span className="font-medium">Verified:</span>{" "}
                  {selectedTweet.verified ? "Yes" : "No"}
                </div>
              </div>

              {selectedTweet.classifier && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">
                    Classification Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Group:</span>{" "}
                      {selectedTweet.classifier.classified_group}
                    </div>
                    <div>
                      <span className="font-medium">Sub-group:</span>{" "}
                      {selectedTweet.classifier.classified_sub_group}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Severity:</span>{" "}
                      {selectedTweet.classifier.severity}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analytics */}
        <Tabs defaultValue="category" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="urgency">Urgency</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="flex-1">
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-base">
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ChartContainer
                  barData={categoryData}
                  pieData={categoryData}
                  barDataKey="value"
                  colors={categoryColors}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="urgency" className="flex-1">
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-base">Urgency Levels</CardTitle>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ChartContainer
                  barData={urgencyData}
                  pieData={urgencyData}
                  barDataKey="value"
                  colors={urgencyColors}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="flex-1">
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-base">Location Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ChartContainer
                  barData={locationData}
                  pieData={locationData}
                  barDataKey="value"
                  colors={locationColors}
                  vertical={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="flex-1">
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-base">Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ChartContainer
                  barData={verificationData}
                  pieData={verificationData}
                  barDataKey="value"
                  colors={verificationColors}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
