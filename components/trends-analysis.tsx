"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { formatDate, DATE_FORMATS } from "@/lib/date-utils";
import { TrendChart } from "./trend-chart";
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
const SimpleTooltip = ({ active, payload }: { active?: boolean; payload?: Array<any> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded text-xs shadow-sm">
        <p className="font-medium">{payload[0].payload.name}</p>
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

function MiniChart({ data, title, value, change, changeType = "neutral" }: MiniChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${
            changeType === "positive" ? "text-green-500" : 
            changeType === "negative" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
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
                      changeType === "positive" ? "#22C55E" : 
                      changeType === "negative" ? "#EF4444" : 
                      "#3b82f6"
                    }
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      changeType === "positive" ? "#22C55E" : 
                      changeType === "negative" ? "#EF4444" : 
                      "#3b82f6"
                    }
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={
                  changeType === "positive" ? "#22C55E" : 
                  changeType === "negative" ? "#EF4444" : 
                  "#3b82f6"
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
  
  // Mémoriser les données générées pour éviter les re-calculs inutiles
  const chartData = useMemo(() => {
    // Ces données seraient normalement chargées à partir d'une API
    return {
      needs: generateTimeData([12, 15, 18, 14, 11, 19, 22]),
      resources: generateTimeData([8, 11, 14, 17, 16, 14, 12]),
      alerts: generateTimeData([5, 7, 4, 9, 8, 6, 3]),
      responseTime: generateTimeData([45, 40, 38, 42, 36, 33, 30])
    };
  }, []);

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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MiniChart 
          data={chartData.needs}
          title="Reported Needs"
          value="128"
          change="+14% from last period"
          changeType="positive"
        />
        <MiniChart 
          data={chartData.resources}
          title="Available Resources"
          value="85"
          change="-5% from last period"
          changeType="negative"
        />
        <MiniChart 
          data={chartData.alerts}
          title="Active Alerts"
          value="24"
          change="No change from last period"
          changeType="neutral"
        />
        <MiniChart 
          data={chartData.responseTime}
          title="Avg. Response Time (min)"
          value="36"
          change="-12% from last period"
          changeType="positive"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Trend Over Time</CardTitle>
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
            {/* Affichage d'un graphique personnalisé au lieu d'utiliser TrendChart qui a des propriétés incompatibles */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart
                    data={[
                      { name: "Jan", needs: 65, resources: 45, alerts: 12 },
                      { name: "Feb", needs: 59, resources: 48, alerts: 10 },
                      { name: "Mar", needs: 80, resources: 52, alerts: 15 },
                      { name: "Apr", needs: 81, resources: 60, alerts: 14 },
                      { name: "May", needs: 56, resources: 45, alerts: 8 },
                      { name: "Jun", needs: 55, resources: 48, alerts: 9 },
                      { name: "Jul", needs: 72, resources: 62, alerts: 11 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="needs" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="resources" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="alerts" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <BarChart
                    data={[
                      { name: "Jan", needs: 65, resources: 45, alerts: 12 },
                      { name: "Feb", needs: 59, resources: 48, alerts: 10 },
                      { name: "Mar", needs: 80, resources: 52, alerts: 15 },
                      { name: "Apr", needs: 81, resources: 60, alerts: 14 },
                      { name: "May", needs: 56, resources: 45, alerts: 8 },
                      { name: "Jun", needs: 55, resources: 48, alerts: 9 },
                      { name: "Jul", needs: 72, resources: 62, alerts: 11 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="needs" fill="#ef4444" />
                    <Bar dataKey="resources" fill="#3b82f6" />
                    <Bar dataKey="alerts" fill="#f59e0b" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardContent className=" mt-4">
              <RegionalHeatmap/>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Category Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="needs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="needs">Needs</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            <div className="h-[300px] mt-4">
              <TabsContent value="needs" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Medical",
                        value: 65,
                      },
                      {
                        name: "Food",
                        value: 40,
                      },
                      {
                        name: "Shelter",
                        value: 35,
                      },
                      {
                        name: "Water",
                        value: 30,
                      },
                      {
                        name: "Transport",
                        value: 15,
                      },
                      {
                        name: "Clothing",
                        value: 12,
                      },
                    ]}
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
              </TabsContent>
              <TabsContent value="resources" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Volunteers",
                        value: 48,
                      },
                      {
                        name: "Medical",
                        value: 35,
                      },
                      {
                        name: "Food",
                        value: 28,
                      },
                      {
                        name: "Equipment",
                        value: 25,
                      },
                      {
                        name: "Shelter",
                        value: 18,
                      },
                      {
                        name: "Transport",
                        value: 12,
                      },
                    ]}
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
              </TabsContent>
              <TabsContent value="alerts" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Flooding",
                        value: 12,
                      },
                      {
                        name: "Fire",
                        value: 8,
                      },
                      {
                        name: "Power Outage",
                        value: 6,
                      },
                      {
                        name: "Road Closure",
                        value: 5,
                      },
                      {
                        name: "Medical",
                        value: 4,
                      },
                      {
                        name: "Security",
                        value: 2,
                      },
                    ]}
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
