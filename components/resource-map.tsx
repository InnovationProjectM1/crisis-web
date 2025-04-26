"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, Maximize2, Minimize2, Plus, Minus } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import type { MapContainerProps, TileLayerProps, CircleMarkerProps } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

interface Region {
  id: string;
  name: string;
  position: [number, number]; // [lat, lng]
  needs: { type: string; count: number; urgency: string }[];
  resources: { type: string; count: number; urgency: string }[];
}

export function ResourceMap() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading map data
    setLoading(true);
    setTimeout(() => {
      setRegions([
        {
          id: "downtown",
          name: "Downtown",
          position: [48.8566, 2.3522], // Paris (example)
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
    }, 1200);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement de la carte...</div>;
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-background rounded-xl shadow-lg border border-border overflow-hidden" style={{height:'calc(100vh - 80px)', marginTop:16, marginBottom:16, minWidth:320}}>
      <div className="flex-1 relative min-h-0">
        <MapContainer
          {...({
            center: [48.8566, 2.3522],
            zoom: 13,
            style: { height: "100%", width: "100%", zIndex: 1, borderRadius: '0 0 1rem 1rem' },
            scrollWheelZoom: true,
            className: "z-0 min-h-0 h-full w-full"
          } as any)}
        >
          <TileLayer
            {...({
              attribution: "© OpenStreetMap contributors",
              url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            } as any)}
          />
          {regions.map((region) => (
            <CircleMarker
              key={region.id}
              center={region.position as LatLngExpression}
              {...({ radius: 18 } as any)}
              pathOptions={{ color: region.needs.some(n => n.urgency === "high") ? "#ef4444" : "#2563eb", fillOpacity: 0.6 }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-bold text-base mb-1 text-primary">{region.name}</div>
                  <div className="mt-2">
                    <div className="font-semibold text-xs mb-1 text-muted-foreground">Besoins :</div>
                    <ul className="mb-2">
                      {region.needs.map((n, i) => (
                        <li key={i} className="text-xs flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full" style={{background:n.urgency==='high'?'#ef4444':n.urgency==='medium'?'#f59e42':'#2563eb'}}></span>
                          {n.type}: <span className="font-bold">{n.count}</span> <span className="text-[10px] text-muted-foreground">{n.urgency}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="font-semibold text-xs mb-1 text-muted-foreground">Ressources :</div>
                    <ul>
                      {region.resources.map((r, i) => (
                        <li key={i} className="text-xs flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full" style={{background:r.urgency==='high'?'#22c55e':r.urgency==='medium'?'#f59e42':'#2563eb'}}></span>
                          {r.type}: <span className="font-bold">{r.count}</span> <span className="text-[10px] text-muted-foreground">{r.urgency}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
