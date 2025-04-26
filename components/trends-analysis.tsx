"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
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

// Helper function to generate formatted data for mini charts
function generateTimeData(values: number[]) {
  return values.map((value, index) => {
    // Create labels like 'Day 1', 'Day 2', etc.
    return {
      name: `Day ${index + 1}`,
      value,
    };
  });
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

export function TrendsAnalysis() {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [date, setDate] = useState<Date | undefined>(new Date());

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Needs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last week
            </p>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={generateTimeData([10, 15, 8, 12, 9, 14, 20, 16, 18, 15, 12, 22, 30, 28])}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    fill="url(#colorNeeds)"
                    strokeWidth={2}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                  <Tooltip content={SimpleTooltip} />
                  <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Available Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last week
            </p>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={generateTimeData([8, 10, 12, 15, 14, 16, 18, 15, 17, 19, 18, 20, 22, 24])}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                  <Tooltip content={SimpleTooltip} />
                  <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resource Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">428</div>
            <p className="text-xs text-muted-foreground">
              -2.3% from last week
            </p>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={generateTimeData([20, 18, 15, 12, 10, 8, 10, 12, 15, 13, 10, 8, 6, 4])} 
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <Bar
                    dataKey="value"
                    fill="#f59e0b"
                    radius={[2, 2, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                  <Tooltip content={SimpleTooltip} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Trend Over Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <TrendChart />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <RegionalHeatmap onRegionClick={() => {}} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resource Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="needs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="needs">Needs</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              <TabsContent value="needs" className="mt-4">
                <div className="space-y-4">
                  <ResourceCategoryBar
                    label="Medical Supplies"
                    value={75}
                    color="#ef4444"
                  />
                  <ResourceCategoryBar
                    label="Food & Water"
                    value={60}
                    color="#f59e0b"
                  />
                  <ResourceCategoryBar
                    label="Shelter"
                    value={45}
                    color="#3b82f6"
                  />
                  <ResourceCategoryBar
                    label="Transportation"
                    value={30}
                    color="#8b5cf6"
                  />
                  <ResourceCategoryBar
                    label="Power & Energy"
                    value={25}
                    color="#ec4899"
                  />
                  <ResourceCategoryBar
                    label="Communication"
                    value={20}
                    color="#14b8a6"
                  />
                </div>
              </TabsContent>
              <TabsContent value="resources" className="mt-4">
                <div className="space-y-4">
                  <ResourceCategoryBar
                    label="Volunteers"
                    value={65}
                    color="#22c55e"
                  />
                  <ResourceCategoryBar
                    label="Food & Water"
                    value={55}
                    color="#f59e0b"
                  />
                  <ResourceCategoryBar
                    label="Medical Supplies"
                    value={40}
                    color="#ef4444"
                  />
                  <ResourceCategoryBar
                    label="Shelter Space"
                    value={35}
                    color="#3b82f6"
                  />
                  <ResourceCategoryBar
                    label="Vehicles"
                    value={25}
                    color="#8b5cf6"
                  />
                  <ResourceCategoryBar
                    label="Power Generators"
                    value={15}
                    color="#ec4899"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ResourceCategoryBarProps {
  label: string;
  value: number;
  color: string;
}

function ResourceCategoryBar({
  label,
  value,
  color,
}: ResourceCategoryBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}
