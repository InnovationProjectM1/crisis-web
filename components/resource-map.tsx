"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { apiService } from "@/lib/api";

// Types pour améliorer la maintenabilité
interface Resource {
  type: string;
  count: number;
  urgency: string;
}

interface Region {
  id: string;
  name: string;
  position: [number, number]; // [lat, lng]
  needs: Resource[];
  resources: Resource[];
}

// Import the MapComponent dynamically with no SSR
const MapComponentWithNoSSR = dynamic(
  () => import("./map-component").then((mod) => mod.MapComponent),
  { ssr: false },
);

export function ResourceMap() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  useEffect(() => {
    // Charger les données de la carte depuis l'API
    const loadMapData = async () => {
      setLoading(true);
      try {
        const regionData = await apiService.getRegionData();
        setRegions(regionData);
      } catch (error) {
        console.error('Error loading map data:', error);
        // Fallback avec des données d'exemple en cas d'erreur API
        setRegions([
          {
            id: "downtown",
            name: "API Connection Failed",
            position: [48.8566, 2.3522],
            needs: [
              { type: "medical", count: 1, urgency: "high" },
            ],
            resources: [],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col h-full w-full bg-background rounded-xl shadow-lg border border-border overflow-hidden"
      style={{
        height: "calc(100vh - 80px)",
        marginTop: 16,
        marginBottom: 16,
        minWidth: 320,
      }}
    >
      <div className="flex-1 relative min-h-0">
        <MapComponentWithNoSSR
          regions={regions}
          mapType={mapType}
          setMapType={setMapType}
        />
      </div>
    </div>
  );
}
