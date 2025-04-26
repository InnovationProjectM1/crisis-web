"use client";

import type React from "react";

import { useEffect, useState, useMemo, useRef } from "react";
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
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import type { MapContainerProps, TileLayerProps, CircleMarkerProps } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

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

// Composant réutilisable pour afficher les besoins et ressources
interface ResourceListProps {
  items: Resource[];
  title: string;
  className?: string;
}

function ResourceList({ items, title, className = "" }: ResourceListProps) {
  if (items.length === 0) return null;
  
  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <ul className="text-sm space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center justify-between">
            <span className="capitalize">{item.type}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              item.urgency === "high" 
                ? "bg-red-100 text-red-700" 
                : item.urgency === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
            }`}>
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Composant pour les marqueurs sur la carte
interface RegionMarkerProps {
  region: Region;
}

function RegionMarker({ region }: RegionMarkerProps) {
  // Déterminer la couleur en fonction de l'urgence
  const hasHighUrgencyNeeds = region.needs.some(n => n.urgency === "high");
  const markerColor = hasHighUrgencyNeeds ? "#ef4444" : "#2563eb";
  
  return (
    <CircleMarker
      {...({
        center: region.position,
        radius: 18,
        pathOptions: { 
          color: markerColor, 
          fillOpacity: 0.6 
        }
      } as any)}
    >
      <Popup>
        <div className="min-w-[180px]">
          <h3 className="font-medium text-base mb-2">{region.name}</h3>
          <ResourceList 
            items={region.needs} 
            title="Needs" 
            className="mb-3" 
          />
          <ResourceList 
            items={region.resources} 
            title="Resources" 
          />
        </div>
      </Popup>
    </CircleMarker>
  );
}

export function ResourceMap() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  useEffect(() => {
    // Simulation du chargement des données de la carte
    const loadMapData = async () => {
      setLoading(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
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

  // Séparation des contrôles de carte dans un composant pour mieux organiser le code
  // Composant qui utilise useMap pour interagir avec la carte Leaflet
  function MapControlsInner({ onChangeMapType }: { onChangeMapType: (type: "standard" | "satellite") => void }) {
    const map = useMap();

    const handleZoomIn = () => {
      map.zoomIn();
    };

    const handleZoomOut = () => {
      map.zoomOut();
    };

    const handleFullscreen = () => {
      // Implémentation simple du plein écran
      const container = map.getContainer();
      
      if (!document.fullscreenElement) {
        container.requestFullscreen?.() || 
        (container as any).webkitRequestFullscreen?.() || 
        (container as any).mozRequestFullScreen?.() ||
        (container as any).msRequestFullscreen?.();
      } else {
        document.exitFullscreen?.() ||
        (document as any).webkitExitFullscreen?.() ||
        (document as any).mozCancelFullScreen?.() ||
        (document as any).msExitFullscreen?.();
      }
    };

    return (
      <div className="absolute right-4 top-4 z-[400] flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 shadow-md">
              <Layers className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Map Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChangeMapType("standard")}>
              Standard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeMapType("satellite")}>
              Satellite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" className="h-8 w-8 shadow-md" onClick={handleFullscreen}>
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 shadow-md" onClick={handleZoomIn}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 shadow-md" onClick={handleZoomOut}>
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col h-full w-full bg-background rounded-xl shadow-lg border border-border overflow-hidden" 
         style={{height:'calc(100vh - 80px)', marginTop:16, marginBottom:16, minWidth:320}}>
      <div className="flex-1 relative min-h-0">          <MapContainer
          {...({
            center: [48.8566, 2.3522],
            zoom: 13,
            style: { height: "100%", width: "100%", zIndex: 1, borderRadius: '0 0 1rem 1rem' },
            scrollWheelZoom: true,
            className: "z-0 min-h-0 h-full w-full",
            zoomControl: false, // Désactiver les contrôles de zoom natifs
            attributionControl: true // Garder l'attribution mais on pourrait la désactiver aussi
          } as any)}
        >
          <TileLayer
            {...({
              attribution: "© OpenStreetMap contributors",
              url: mapType === "standard" 
                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            } as any)}          />
          <MapControlsInner onChangeMapType={setMapType} />
          {regions.map((region) => (
            <RegionMarker key={region.id} region={region} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
