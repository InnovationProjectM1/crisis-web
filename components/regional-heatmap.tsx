"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

interface RegionalHeatmapProps {
  onRegionClick: (data: any) => void;
}

export function RegionalHeatmap({ onRegionClick }: RegionalHeatmapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const popupRef = useRef<L.Popup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
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

  // Initialisation de la carte
  useEffect(() => {
    // Ne pas initialiser la carte si le conteneur n'est pas prêt ou si les données chargent
    if (!mapContainerRef.current || loading) return;
    
    // Nettoyer la carte existante si elle existe
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      heatLayerRef.current = null;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
    
    // Créer une nouvelle carte
    const map = L.map(mapContainerRef.current, {
      center: [48.846, 2.3522],
      zoom: 11,
      scrollWheelZoom: false
    });
    
    // Ajouter la couche de tuiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    // Stocker la référence à la carte
    mapRef.current = map;
    
    // Gérer les clics sur la carte
    map.on('click', (e) => {
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
    });
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, heatmapData, onRegionClick]);
  
  // Préparer les points pour la heatmap
  useEffect(() => {
    if (!mapRef.current || !heatmapData?.regions || loading) return;
    
    // Supprimer la couche de chaleur existante si elle existe
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    
    // Créer les points pour la heatmap
    const points = heatmapData.regions.map(region => [
      region.lat,
      region.lng,
      dataType === "needs" ? region.needsIntensity : region.resourcesIntensity
    ] as [number, number, number]);
    
    // Créer et ajouter la couche de chaleur
    // @ts-ignore - L'extension leaflet.heat n'a pas de types TS corrects
    const heatLayer = L.heatLayer(points, { radius: 30, blur: 20, max: 1 });
    heatLayer.addTo(mapRef.current);
    
    // Stocker la référence à la couche de chaleur
    heatLayerRef.current = heatLayer;
  }, [heatmapData, dataType, loading]);
  
  // Gérer la région sélectionnée
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Supprimer le marker et le popup existant
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    
    // Si une région est sélectionnée, afficher un popup
    if (selectedRegion) {
      // Créer le contenu du popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 min-w-[140px]';
      
      const nameElement = document.createElement('div');
      nameElement.className = 'font-semibold text-sm mb-1';
      nameElement.textContent = selectedRegion.name;
      popupContent.appendChild(nameElement);
      
      const infoElement = document.createElement('div');
      infoElement.className = 'text-xs text-muted-foreground';
      infoElement.textContent = dataType === "needs"
        ? `Needs Intensity: ${(selectedRegion.needsIntensity * 100).toFixed(0)}%`
        : `Resources Intensity: ${(selectedRegion.resourcesIntensity * 100).toFixed(0)}%`;
      popupContent.appendChild(infoElement);
      
      // Créer et ajouter le popup
      const popup = L.popup({
        autoPan: false,
        closeButton: false,
        className: '!p-0'
      })
        .setLatLng([selectedRegion.lat, selectedRegion.lng])
        .setContent(popupContent)
        .openOn(mapRef.current);
      
      popupRef.current = popup;
    }
  }, [selectedRegion, dataType]);

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
            <div 
              ref={mapContainerRef}
              className="w-full h-full"
              style={{ zIndex: 0 }}
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
