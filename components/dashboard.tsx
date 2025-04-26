"use client";

import { useState } from "react";
import { TweetFeed } from "./tweet-feed";
import { ResourceMap } from "./resource-map";
import { TrendChart } from "./trend-chart";
import { RegionalHeatmap } from "./regional-heatmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function Dashboard() {
  const [alertData, setAlertData] = useState<any>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleAlert = (data: any) => {
    setAlertData(data);
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-4">
      {/* Main area: TweetFeed (left), ResourceMap (right) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4" style={{height: '0'}}> {/* height:0 for flexbox min-h-0 to work */}
        {/* TweetFeed */}
        <Card className="flex flex-col flex-1 min-h-0 max-h-full lg:max-w-[420px] lg:flex-[0_0_380px]">
          <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
            <TweetFeed onAlertClick={handleAlert} />
          </CardContent>
        </Card>
        {/* ResourceMap */}
        <Card className="flex flex-col flex-1 min-h-0 max-h-full">
          <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
            <ResourceMap onRegionClick={handleAlert} />
          </CardContent>
        </Card>
      </div>

      {/* Analytics area: Tabs for TrendChart and RegionalHeatmap */}
      <div className="flex flex-col flex-1 min-h-0">
        <Tabs defaultValue="trends" className="flex-1 flex flex-col min-h-0 w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="heatmap">Regional Heatmap</TabsTrigger>
          </TabsList>
          <TabsContent value="trends" className="flex-1 min-h-0 mt-4">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
                <TrendChart />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="heatmap" className="flex-1 min-h-0 mt-4">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
                <RegionalHeatmap onRegionClick={handleAlert} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
