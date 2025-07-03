"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DATE_FORMATS } from "@/lib/date-utils";
import { RegionalHeatmap } from "./regional-heatmap";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  apiService,
  Tweet,
  GroupStatistics,
  DifficultyStatistics,
  TweetStatistics,
} from "@/lib/api";

// Types pour une meilleure maintenance
interface ChartData {
  name: string;
  value: number;
}

// Helper function to generate formatted data for mini charts
function generateTimeData(values: number[]): ChartData[] {
  return values.map((value, index) => ({
    name: `Day ${index + 1}`,
    value,
  }));
}

// Tooltip component with proper type definition
const SimpleTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<ChartData>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded text-xs shadow-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p>Value: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// Composant réutilisable pour les graphiques miniatures
interface MiniChartProps {
  data: ChartData[];
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function MiniChart({
  data,
  title,
  value,
  change,
  changeType = "neutral",
}: MiniChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={`text-xs ${
              changeType === "positive"
                ? "text-green-500"
                : changeType === "negative"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }`}
          >
            {change}
          </p>
        )}
        <div className="h-[80px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      changeType === "positive"
                        ? "#22C55E"
                        : changeType === "negative"
                          ? "#EF4444"
                          : "#3b82f6"
                    }
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      changeType === "positive"
                        ? "#22C55E"
                        : changeType === "negative"
                          ? "#EF4444"
                          : "#3b82f6"
                    }
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={
                  changeType === "positive"
                    ? "#22C55E"
                    : changeType === "negative"
                      ? "#EF4444"
                      : "#3b82f6"
                }
                fill="url(#colorValue)"
                strokeWidth={2}
              />
              <Tooltip content={<SimpleTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendsAnalysis() {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<{
    tweets: Tweet[];
    groupStats: GroupStatistics[];
    difficultyStats: DifficultyStatistics[];
    tweetStats: TweetStatistics;
  }>({
    tweets: [],
    groupStats: [],
    difficultyStats: [],
    tweetStats: { total: 0, classified: 0, unclassified: 0 },
  });

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tweets, groupStats, difficultyStats, tweetStats] =
          await Promise.all([
            apiService.getTweets(),
            apiService.getGroupStatistics(),
            apiService.getDifficultyStatistics(),
            apiService.getTweetStatistics(),
          ]);

        setApiData({ tweets, groupStats, difficultyStats, tweetStats });
      } catch (error) {
        console.error("Error loading API data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  // Mémoriser les données générées à partir de l'API
  const chartData = useMemo(() => {
    if (loading || !apiData.tweets.length) {
      return {
        needs: generateTimeData([0, 0, 0, 0, 0, 0, 0]),
        resources: generateTimeData([0, 0, 0, 0, 0, 0, 0]),
        uncategorized: generateTimeData([0, 0, 0, 0, 0, 0, 0]),
        responseTime: generateTimeData([0, 0, 0, 0, 0, 0, 0]),
        trendData: [],
        categoryData: {
          needs: [],
          resources: [],
          uncategorized: [],
        },
      };
    }

    // Analyser les tweets par catégorie sur les 7 derniers jours
    const now = new Date();
    const days = 7;
    const needsData = [];
    const resourcesData = [];
    const uncategorizedData = [];
    const responseTimeData = [];
    const trendData = [];

    // Générer les données de tendance basées sur le timeRange sélectionné
    const periods =
      timeRange === "24h"
        ? 24
        : timeRange === "7d"
          ? 7
          : timeRange === "30d"
            ? 30
            : 90;
    const timeUnit = timeRange === "24h" ? "hour" : "day";

    for (let i = 0; i < Math.min(periods, 12); i++) {
      // Limiter à 12 points pour la lisibilité
      const periodIndex = Math.floor((i * periods) / 12);
      let startDate, endDate, name;

      if (timeUnit === "hour") {
        startDate = new Date(
          now.getTime() - (24 - periodIndex) * 60 * 60 * 1000,
        );
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        name = startDate.getHours().toString().padStart(2, "0") + "h";
      } else {
        startDate = new Date(
          now.getTime() - (periods - periodIndex) * 24 * 60 * 60 * 1000,
        );
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        name = startDate.toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        });
      }

      const periodTweets = apiData.tweets.filter((tweet) => {
        const tweetDate = new Date(tweet.timestamp);
        return tweetDate >= startDate && tweetDate < endDate;
      });

      const needsCount = periodTweets.filter(
        (t) => t.category === "need",
      ).length;
      const resourcesCount = periodTweets.filter(
        (t) => t.category === "resource",
      ).length;
      const uncategorizedCount = periodTweets.filter(
        (t) => t.category === "uncategorized",
      ).length;

      trendData.push({
        name,
        needs: needsCount,
        resources: resourcesCount,
        uncategorized: uncategorizedCount,
      });
    }

    // Données pour les mini-charts (derniers 7 jours)
    for (let i = 0; i < days; i++) {
      const startDate = new Date(
        now.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000,
      );
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      const dayTweets = apiData.tweets.filter((tweet) => {
        const tweetDate = new Date(tweet.timestamp);
        return tweetDate >= startDate && tweetDate < endDate;
      });

      needsData.push(dayTweets.filter((t) => t.category === "need").length);
      resourcesData.push(
        dayTweets.filter((t) => t.category === "resource").length,
      );
      uncategorizedData.push(
        dayTweets.filter((t) => t.category === "uncategorized").length,
      );

      // Simuler le temps de réponse basé sur l'urgence
      const urgentTweets = dayTweets.filter((t) => t.urgency === "high").length;
      const avgResponseTime =
        urgentTweets > 0 ? Math.max(20, 60 - urgentTweets * 5) : 45;
      responseTimeData.push(avgResponseTime);
    } // Analyser les sous-catégories pour les graphiques détaillés
    const subcategoryCount = (category: string, subcategory: string) => {
      return apiData.tweets.filter(
        (t) =>
          t.category === category &&
          t.text?.toLowerCase().includes(subcategory.toLowerCase()),
      ).length;
    };

    const categoryData = {
      needs: [
        {
          name: "Medical",
          value:
            subcategoryCount("need", "medical") ||
            subcategoryCount("need", "health") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "need").length * 0.3,
            ),
        },
        {
          name: "Food",
          value:
            subcategoryCount("need", "food") ||
            subcategoryCount("need", "nutrition") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "need").length * 0.25,
            ),
        },
        {
          name: "Shelter",
          value:
            subcategoryCount("need", "shelter") ||
            subcategoryCount("need", "housing") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "need").length * 0.2,
            ),
        },
        {
          name: "Water",
          value:
            subcategoryCount("need", "water") ||
            subcategoryCount("need", "drink") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "need").length * 0.15,
            ),
        },
        {
          name: "Transport",
          value:
            subcategoryCount("need", "transport") ||
            subcategoryCount("need", "travel") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "need").length * 0.1,
            ),
        },
      ].sort((a, b) => b.value - a.value),

      resources: [
        {
          name: "Volunteers",
          value:
            subcategoryCount("resource", "volunteer") ||
            subcategoryCount("resource", "help") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "resource").length *
                0.3,
            ),
        },
        {
          name: "Medical",
          value:
            subcategoryCount("resource", "medical") ||
            subcategoryCount("resource", "health") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "resource").length *
                0.25,
            ),
        },
        {
          name: "Food",
          value:
            subcategoryCount("resource", "food") ||
            subcategoryCount("resource", "nutrition") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "resource").length *
                0.2,
            ),
        },
        {
          name: "Equipment",
          value:
            subcategoryCount("resource", "equipment") ||
            subcategoryCount("resource", "tools") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "resource").length *
                0.15,
            ),
        },
        {
          name: "Shelter",
          value:
            subcategoryCount("resource", "shelter") ||
            subcategoryCount("resource", "housing") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "resource").length *
                0.1,
            ),
        },
      ].sort((a, b) => b.value - a.value),

      uncategorized: [
        {
          name: "Emergency",
          value:
            subcategoryCount("uncategorized", "emergency") ||
            subcategoryCount("uncategorized", "urgent") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "uncategorized")
                .length * 0.3,
            ),
        },
        {
          name: "Weather",
          value:
            subcategoryCount("uncategorized", "weather") ||
            subcategoryCount("uncategorized", "storm") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "uncategorized")
                .length * 0.25,
            ),
        },
        {
          name: "Infrastructure",
          value:
            subcategoryCount("uncategorized", "power") ||
            subcategoryCount("uncategorized", "road") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "uncategorized")
                .length * 0.2,
            ),
        },
        {
          name: "Safety",
          value:
            subcategoryCount("uncategorized", "safety") ||
            subcategoryCount("uncategorized", "danger") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "uncategorized")
                .length * 0.15,
            ),
        },
        {
          name: "Health",
          value:
            subcategoryCount("uncategorized", "health") ||
            subcategoryCount("uncategorized", "medical") ||
            Math.floor(
              apiData.tweets.filter((t) => t.category === "uncategorized")
                .length * 0.1,
            ),
        },
      ].sort((a, b) => b.value - a.value),
    };

    return {
      needs: generateTimeData(needsData),
      resources: generateTimeData(resourcesData),
      uncategorized: generateTimeData(uncategorizedData),
      responseTime: generateTimeData(responseTimeData),
      trendData,
      categoryData,
    };
  }, [apiData, loading, timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trend Analysis</h1>
          <p className="text-muted-foreground">
            Analyze patterns and trends in crisis data over time to improve
            response efforts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DatePicker
            date={date}
            onDateChange={setDate}
            format={DATE_FORMATS.long}
            placeholder="Pick a date"
            className="w-[240px]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {" "}
        <MiniChart
          data={chartData.needs}
          title="Reported Needs"
          value={
            loading
              ? "..."
              : apiData.tweets
                  .filter((t) => t.category === "need")
                  .length.toString()
          }
          change={loading ? "..." : `${apiData.tweetStats.total} total tweets`}
          changeType="neutral"
        />
        <MiniChart
          data={chartData.resources}
          title="Available Resources"
          value={
            loading
              ? "..."
              : apiData.tweets
                  .filter((t) => t.category === "resource")
                  .length.toString()
          }
          change={
            loading
              ? "..."
              : `${Math.round((apiData.tweets.filter((t) => t.category === "resource").length / Math.max(apiData.tweets.length, 1)) * 100)}% of total`
          }
          changeType="positive"
        />
        <MiniChart
          data={chartData.uncategorized}
          title="Active Uncategorized"
          value={
            loading
              ? "..."
              : apiData.tweets
                  .filter((t) => t.category === "uncategorized")
                  .length.toString()
          }
          change={
            loading
              ? "..."
              : `${apiData.tweets.filter((t) => t.urgency === "high").length} high priority`
          }
          changeType="negative"
        />
        <MiniChart
          data={chartData.responseTime}
          title="Classified Tweets"
          value={loading ? "..." : apiData.tweetStats.classified.toString()}
          change={
            loading
              ? "..."
              : `${Math.round((apiData.tweetStats.classified / Math.max(apiData.tweetStats.total, 1)) * 100)}% classified`
          }
          changeType="positive"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">
              Trend Over Time
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                defaultValue={timeRange}
                onValueChange={(value) => setTimeRange(value)}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select
                defaultValue={chartType}
                onValueChange={(value) => setChartType(value as "line" | "bar")}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {" "}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart
                    data={chartData.trendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="needs"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Needs"
                    />
                    <Line
                      type="monotone"
                      dataKey="resources"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Resources"
                    />
                    <Line
                      type="monotone"
                      dataKey="uncategorized"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Uncategorized"
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={chartData.trendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="needs" fill="#ef4444" name="Needs" />
                    <Bar dataKey="resources" fill="#3b82f6" name="Resources" />
                    <Bar
                      dataKey="uncategorized"
                      fill="#f59e0b"
                      name="Uncategorized"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardContent className=" mt-4">
            <RegionalHeatmap />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Category Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="needs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="needs">Needs</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="uncategorized">Uncategorized</TabsTrigger>
            </TabsList>
            <div className="h-[300px] mt-4">
              {" "}
              <TabsContent value="needs" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.categoryData.needs}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#000" />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>{" "}
              <TabsContent value="resources" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.categoryData.resources}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#000" />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>{" "}
              <TabsContent value="uncategorized" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.categoryData.uncategorized}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#000" />
                    <Bar dataKey="value" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
