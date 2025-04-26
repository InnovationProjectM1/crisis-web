"use client";

import React, { useEffect, useState, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, useMapEvents, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

interface RegionalHeatmapProps {
  onRegionClick: (data: any) => void;
}

function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMapEvents({});
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    // @ts-ignore
    const heat = L.heatLayer(points, { radius: 30, blur: 20, max: 1 });
    heat.addTo(map);
    layerRef.current = heat;
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, points]);
  return null;
}

export function RegionalHeatmap({ onRegionClick }: RegionalHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState("needs");
  const [selectedRegion, setSelectedRegion] = useState<null | {
    id: string;
    name: string;
    lat: number;
    lng: number;
    needsIntensity: number;
    resourcesIntensity: number;
  }>(null);

  useEffect(() => {
    // Simulate loading heatmap data
    const loadHeatmapData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHeatmapData({
        regions: [
          { id: "r1", name: "Downtown", lat: 48.8566, lng: 2.3522, needsIntensity: 0.9, resourcesIntensity: 0.4 },
          { id: "r2", name: "North District", lat: 48.8666, lng: 2.3522, needsIntensity: 0.7, resourcesIntensity: 0.3 },
          { id: "r3", name: "East District", lat: 48.8566, lng: 2.3622, needsIntensity: 0.5, resourcesIntensity: 0.6 },
          { id: "r4", name: "South District", lat: 48.8466, lng: 2.3522, needsIntensity: 0.3, resourcesIntensity: 0.8 },
          { id: "r5", name: "West District", lat: 48.8566, lng: 2.3422, needsIntensity: 0.6, resourcesIntensity: 0.5 },
          { id: "r6", name: "Northwest", lat: 48.8666, lng: 2.3422, needsIntensity: 0.4, resourcesIntensity: 0.2 },
          { id: "r7", name: "Northeast", lat: 48.8666, lng: 2.3622, needsIntensity: 0.2, resourcesIntensity: 0.7 },
          { id: "r8", name: "Southeast", lat: 48.8466, lng: 2.3622, needsIntensity: 0.8, resourcesIntensity: 0.3 },
          { id: "r9", name: "Southwest", lat: 48.8466, lng: 2.3422, needsIntensity: 0.5, resourcesIntensity: 0.9 },
        ],
      });
      setLoading(false);
    };
    loadHeatmapData();
  }, []);

  // Prepare heatmap points
  const points: [number, number, number][] = Array.isArray(heatmapData?.regions)
    ? heatmapData!.regions.map(region => [
        region.lat,
        region.lng,
        dataType === "needs" ? region.needsIntensity : region.resourcesIntensity,
      ])
    : [];

  // Click handler for map
  function RegionClickHandler() {
    useMapEvents({
      click(e: any) {
        if (!heatmapData) return;
        let minDist = Infinity;
        let closest = null;
        for (const region of heatmapData.regions) {
          const dist = Math.sqrt(
            Math.pow(region.lat - e.latlng.lat, 2) + Math.pow(region.lng - e.latlng.lng, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            closest = region;
          }
        }
        if (closest && minDist < 0.01) {
          setSelectedRegion(closest);
          onRegionClick(closest);
        } else {
          setSelectedRegion(null);
        }
      },
    });
    return null;
  }

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
            <MapContainer
              {...({
                center: [48.846, 2.3522],
                zoom: 11,
                style: { width: "100%", height: "100%", zIndex: 0 },
                scrollWheelZoom: false,
                children: [
                  <TileLayer
                    key="tile"
                    {...({
                      attribution: "&copy; OpenStreetMap contributors",
                      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    } as any)}
                  />, 
                  <HeatLayer key="heat" points={points} />, 
                  <RegionClickHandler key="click" />, 
                  // Affiche un marker invisible avec popup sur la région sélectionnée
                  selectedRegion && (
                    <Marker
                      key={selectedRegion.id}
                      position={[selectedRegion.lat, selectedRegion.lng]}
                      opacity={0}
                      interactive={false}
                    >
                      <Popup autoPan={false} closeButton={false} className="!p-0">
                        <div className="p-2 min-w-[140px]">
                          <div className="font-semibold text-sm mb-1">{selectedRegion.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {dataType === "needs"
                              ? `Needs Intensity: ${(selectedRegion.needsIntensity * 100).toFixed(0)}%`
                              : `Resources Intensity: ${(selectedRegion.resourcesIntensity * 100).toFixed(0)}%`}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ),
                ],
              } as any)}
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
                {dataType === "needs" ? "Needs Intensity" : "Resources Intensity"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
