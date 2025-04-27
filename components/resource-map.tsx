"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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
    // Simulation du chargement des données de la carte
    const loadMapData = async () => {
      setLoading(true);
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setRegions([
        {
          id: "downtown",
          name: "Downtown",
          position: [48.8566, 2.3522], // Paris (exemple)
          needs: [
            { type: "medical", count: 12, urgency: "high" },
            { type: "food", count: 8, urgency: "medium" },
            { type: "shelter", count: 5, urgency: "medium" },
          ],
          resources: [
            { type: "volunteers", count: 20, urgency: "low" },
            { type: "water", count: 15, urgency: "medium" },
          ],
        },
        {
          id: "north",
          name: "North District",
          position: [48.8666, 2.3622],
          needs: [
            { type: "water", count: 25, urgency: "high" },
            { type: "power", count: 18, urgency: "high" },
          ],
          resources: [
            { type: "medical", count: 5, urgency: "medium" },
            { type: "food", count: 10, urgency: "low" },
          ],
        },
      ]);
      setLoading(false);
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
