"use client";

import { TweetFeed } from "./tweet-feed";
import { ResourceMap, ResourceMapHandle } from "./resource-map";
import { TrendChart } from "./trend-chart";
import { RegionalHeatmap } from "./regional-heatmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";

export default function Dashboard() {
  const resourceMapRef = useRef<ResourceMapHandle>(null);

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-4">
      {/* Main area: TweetFeed (left), ResourceMap (right) */}
      <div
        className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4"
        style={{ height: "0" }}
      >
        {" "}
        {/* height:0 for flexbox min-h-0 to work */}
        {/* TweetFeed */}
        <Card className="flex flex-col flex-1 min-h-0 max-h-full lg:max-w-[420px] lg:flex-[0_0_380px]">
          <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
            <TweetFeed
              onTweetLocationClick={(lat, lng) => {
                resourceMapRef.current?.focusOnCoordinates(lat, lng);
              }}
            />
          </CardContent>
        </Card>
        {/* ResourceMap */}
        <Card className="flex flex-col flex-1 min-h-0 max-h-full">
          <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
            <ResourceMap ref={resourceMapRef} />
          </CardContent>
        </Card>
      </div>

      {/* Analytics area: Tabs for TrendChart and RegionalHeatmap */}
      <div className="flex flex-col flex-1 min-h-0">
        <Tabs
          defaultValue="trends"
          className="flex-1 flex flex-col min-h-0 w-full"
        >
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
                <RegionalHeatmap />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
