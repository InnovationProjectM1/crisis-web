"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  TooltipProps,
  ComposedChart,
  Brush,
  Scatter,
} from "recharts";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
} from "lucide-react";
import { format, subHours, subDays } from "date-fns";
import { apiService } from "@/lib/api";

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <p className="text-sm">
              <span className="font-medium">{entry.name}: </span>
              <span>{entry.value}</span>
              {entry.payload && entry.payload.change && (
                <span
                  className={`ml-2 ${entry.payload.change > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {entry.payload.change > 0 ? "+" : ""}
                  {entry.payload.change}%
                  {entry.payload.change > 0 ? (
                    <ArrowUpIcon className="inline h-3 w-3 ml-1" />
                  ) : (
                    <ArrowDownIcon className="inline h-3 w-3 ml-1" />
                  )}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart() {
  const [chartData, setChartData] = useState<
    {
      label: string;
      timestamp: Date;
      Needs: number;
      Resources: number;
      Volunteers: number;
      change?: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [chartType, setChartType] = useState<
    "line" | "bar" | "area" | "composed"
  >("line");

  // Base values for generating data
  const baseNeeds = 50;
  const baseResources = 80;
  const baseVolunteers = 30;
  useEffect(() => {
    setLoading(true);

    const loadTrendData = async () => {
      try {
        const data = await apiService.getTrendData(timeRange);
        setChartData(data);
      } catch (error) {
        console.error("Error loading trend data:", error);

        // Fallback avec des données générées en cas d'erreur API
        const now = new Date();
        const dataPoints =
          timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30;
        const fallbackData: Array<{
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
              ? subHours(now, dataPoints - i - 1)
              : timeRange === "7d"
                ? subDays(now, dataPoints - i - 1)
                : subDays(now, dataPoints - i - 1);

          const dayFactor =
            1 + Math.sin((i / (dataPoints / 2)) * Math.PI) * 0.3;
          const randomFactor = 1 + (Math.random() * 0.4 - 0.2);
          const spikeFactor = i === Math.floor(dataPoints / 2) ? 1.8 : 1;

          const needsValue = Math.floor(
            50 * dayFactor * randomFactor * spikeFactor,
          );
          const resourcesValue = Math.floor(
            80 * (1.1 - dayFactor * 0.2) * randomFactor,
          );
          const volunteersValue = Math.floor(
            30 * (dayFactor * 0.7 + 0.5) * randomFactor,
          );

          const change =
            i > 0
              ? Math.round(
                  ((needsValue - fallbackData[i - 1].Needs) /
                    fallbackData[i - 1].Needs) *
                    100,
                )
              : 0;

          fallbackData.push({
            label:
              timeRange === "24h"
                ? format(date, "HH:00")
                : timeRange === "7d"
                  ? format(date, "EEE")
                  : format(date, "MMM d"),
            timestamp: date,
            Needs: needsValue,
            Resources: resourcesValue,
            Volunteers: volunteersValue,
            change,
          });
        }

        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadTrendData();
  }, [timeRange]);

  return (
    <div className="h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Trend Analysis</h2>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) =>
              setTimeRange(value as "24h" | "7d" | "30d")
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Tabs
            value={chartType}
            onValueChange={(v) =>
              setChartType(v as "line" | "bar" | "area" | "composed")
            }
            className="w-[240px]"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="line"
                className="flex items-center gap-1 px-2"
              >
                <LineChartIcon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:inline-block">
                  Line
                </span>
              </TabsTrigger>
              <TabsTrigger value="bar" className="flex items-center gap-1 px-2">
                <BarChart3 className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:inline-block">
                  Bar
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="area"
                className="flex items-center gap-1 px-2"
              >
                <AreaChartIcon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:inline-block">
                  Area
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="composed"
                className="flex items-center gap-1 px-2"
              >
                <BarChart3 className="h-4 w-4" />
                <LineChartIcon className="h-4 w-4 -ml-2" />
                <span className="sr-only sm:not-sr-only sm:inline-block">
                  Mixed
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="relative flex-1 border rounded-lg overflow-hidden bg-background">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={40} stroke="#ff6b6b" strokeDasharray="3 3">
                  <Label
                    value="Critical Need"
                    position="insideRight"
                    fill="#ff6b6b"
                  />
                </ReferenceLine>
                <Line
                  type="monotone"
                  dataKey="Needs"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{
                    stroke: "#ef4444",
                    strokeWidth: 1,
                    fill: "#fff",
                    r: 3,
                  }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="Resources"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{
                    stroke: "#22c55e",
                    strokeWidth: 1,
                    fill: "#fff",
                    r: 3,
                  }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="Volunteers"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    fill: "#fff",
                    r: 3,
                  }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
                {timeRange === "24h" && (
                  <Brush
                    dataKey="label"
                    height={20}
                    stroke="#8884d8"
                    startIndex={16}
                  />
                )}
              </LineChart>
            ) : chartType === "bar" ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={40} stroke="#ff6b6b" strokeDasharray="3 3">
                  <Label
                    value="Critical Need"
                    position="insideRight"
                    fill="#ff6b6b"
                  />
                </ReferenceLine>
                <Bar
                  dataKey="Needs"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="Resources"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="Volunteers"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            ) : chartType === "area" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorResources"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorVolunteers"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={40} stroke="#ff6b6b" strokeDasharray="3 3">
                  <Label
                    value="Critical Need"
                    position="insideRight"
                    fill="#ff6b6b"
                  />
                </ReferenceLine>
                <Area
                  type="monotone"
                  dataKey="Needs"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorNeeds)"
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="Resources"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorResources)"
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="Volunteers"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorVolunteers)"
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              </AreaChart>
            ) : (
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={40} stroke="#ff6b6b" strokeDasharray="3 3">
                  <Label
                    value="Critical Need"
                    position="insideRight"
                    fill="#ff6b6b"
                  />
                </ReferenceLine>
                <Bar
                  dataKey="Needs"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="Resources"
                  stroke="#22c55e"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="Volunteers"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  stroke="#3b82f6"
                  animationDuration={1000}
                />
                <Scatter dataKey="Needs" fill="#ef4444" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
