"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { apiService } from "@/lib/api";

// Types
interface HeatmapData {
  regions: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    needsIntensity: number;
    resourcesIntensity: number;
  }>;
}

interface RegionType {
  id: string;
  name: string;
  lat: number;
  lng: number;
  needsIntensity: number;
  resourcesIntensity: number;
}

// Import HeatMapComponent dynamically with no SSR
const HeatMapComponentWithNoSSR = dynamic(
  () => import("./heatmap-component").then((mod) => mod.HeatMapComponent),
  { ssr: false },
);

export function RegionalHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState("needs");
  const [selectedRegion, setSelectedRegion] = useState<RegionType | null>(null);
  useEffect(() => {
    // Charger les données de heatmap depuis l'API
    const loadHeatmapData = async () => {
      setLoading(true);
      try {
        const heatmapDataResult = await apiService.getHeatmapData();
        setHeatmapData(heatmapDataResult);
      } catch (error) {
        console.error("Error loading heatmap data:", error);
        // Fallback avec des données d'exemple en cas d'erreur API
        setHeatmapData({
          regions: [
            {
              id: "fallback",
              name: "API Connection Failed",
              lat: 48.8566,
              lng: 2.3522,
              needsIntensity: 0.5,
              resourcesIntensity: 0.3,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadHeatmapData();
  }, []);

  return (
    <div className="h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Regional Heatmap</h2>
        <Select value={dataType} onValueChange={setDataType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Data Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="needs">Needs Intensity</SelectItem>
            <SelectItem value="resources">Resources Intensity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="relative flex-1 border rounded-lg overflow-hidden bg-background">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <HeatMapComponentWithNoSSR
              heatmapData={heatmapData}
              dataType={dataType}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
            {/* Légende Heatmap, animée */}
            <div className="absolute left-4 bottom-4 z-[1000] flex flex-col items-start gap-1 bg-background/80 backdrop-blur-sm p-2 rounded-md shadow text-xs pointer-events-auto animate-fade-in">
              <div className="mb-1 font-medium text-foreground">Intensity</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Low</span>
                <div
                  className="h-3 w-32 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #38bdf8 0%, #22c55e 40%, #fde047 70%, #ef4444 100%)",
                  }}
                ></div>
                <span className="text-muted-foreground">High</span>
              </div>
              <div className="text-muted-foreground mt-1">
                {dataType === "needs"
                  ? "Needs Intensity"
                  : "Resources Intensity"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
