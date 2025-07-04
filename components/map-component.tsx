"use client";

import React from "react";
import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, Maximize2, Plus, Minus } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Define types for vendor-prefixed fullscreen API
interface FullscreenAPI {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface MapComponentProps {
  regions: Region[];
  mapType: "standard" | "satellite";
  setMapType: (type: "standard" | "satellite") => void;
  innerMapRef?: (map: L.Map) => void;
}

function MapComponent({
  regions,
  mapType,
  setMapType,
  innerMapRef,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Fonction pour créer le contenu du popup
  const createPopupContent = useCallback((region: Region) => {
    const container = document.createElement("div");
    container.className = "min-w-[180px]";

    const title = document.createElement("h3");
    title.className = "font-medium text-base mb-2";
    title.textContent = region.name;
    container.appendChild(title);

    // Ajouter les besoins
    if (region.needs.length > 0) {
      const needsContainer = document.createElement("div");
      needsContainer.className = "mb-3";

      const needsTitle = document.createElement("h4");
      needsTitle.className = "text-sm font-medium mb-1";
      needsTitle.textContent = "Needs";
      needsContainer.appendChild(needsTitle);

      const needsList = document.createElement("ul");
      needsList.className = "text-sm space-y-1";

      region.needs.forEach((need) => {
        const needItem = document.createElement("li");
        needItem.className = "flex items-center justify-between";

        const nameSpan = document.createElement("span");
        nameSpan.className = "capitalize";
        nameSpan.textContent = need.type;

        const countSpan = document.createElement("span");
        const urgencyClass =
          need.urgency === "high"
            ? "bg-red-100 text-red-700"
            : need.urgency === "medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-blue-100 text-blue-700";
        countSpan.className = `px-1.5 py-0.5 rounded text-xs ${urgencyClass}`;
        countSpan.textContent = need.count.toString();

        needItem.appendChild(nameSpan);
        needItem.appendChild(countSpan);
        needsList.appendChild(needItem);
      });

      needsContainer.appendChild(needsList);
      container.appendChild(needsContainer);
    }

    // Ajouter les ressources
    if (region.resources.length > 0) {
      const resourcesContainer = document.createElement("div");

      const resourcesTitle = document.createElement("h4");
      resourcesTitle.className = "text-sm font-medium mb-1";
      resourcesTitle.textContent = "Resources";
      resourcesContainer.appendChild(resourcesTitle);

      const resourcesList = document.createElement("ul");
      resourcesList.className = "text-sm space-y-1";

      region.resources.forEach((resource) => {
        const resourceItem = document.createElement("li");
        resourceItem.className = "flex items-center justify-between";

        const nameSpan = document.createElement("span");
        nameSpan.className = "capitalize";
        nameSpan.textContent = resource.type;

        const countSpan = document.createElement("span");
        const urgencyClass =
          resource.urgency === "high"
            ? "bg-red-100 text-red-700"
            : resource.urgency === "medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-blue-100 text-blue-700";
        countSpan.className = `px-1.5 py-0.5 rounded text-xs ${urgencyClass}`;
        countSpan.textContent = resource.count.toString();

        resourceItem.appendChild(nameSpan);
        resourceItem.appendChild(countSpan);
        resourcesList.appendChild(resourceItem);
      });

      resourcesContainer.appendChild(resourcesList);
      container.appendChild(resourcesContainer);
    }

    return container;
  }, []);

  // Mettre à jour les marqueurs
  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    regions.forEach((region) => {
      const hasHighUrgencyNeeds = region.needs.some(
        (n) => n.urgency === "high",
      );
      const markerColor = hasHighUrgencyNeeds ? "#ef4444" : "#2563eb";

      const marker = L.circleMarker(region.position, {
        radius: 18,
        color: markerColor,
        fillOpacity: 0.6,
      });

      // Ajouter le popup
      const popup = createPopupContent(region);
      marker.bindPopup(popup);

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [regions, createPopupContent]);

  // Initialiser la carte avec Leaflet natif
  useEffect(() => {
    // Si la carte existe déjà, ne pas la recréer
    if (mapRef.current) return;

    // Ne rien faire tant que le conteneur n'est pas prêt
    if (!mapContainerRef.current) return;

    // Création de la carte Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [48.8566, 2.3522],
      zoom: 13,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    // Ajouter le layer de tuiles
    const tileUrl =
      mapType === "standard"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: "© OpenStreetMap contributors",
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    if (innerMapRef) {
      innerMapRef(map);
    }

    // Ajouter les marqueurs
    updateMarkers();

    // Nettoyage à la démonter du composant
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
        markersRef.current = [];
      }
    };
  }, [mapType, regions, updateMarkers, innerMapRef]);

  // Mettre à jour les marqueurs quand les régions changent
  useEffect(() => {
    if (!mapRef.current) return;
    updateMarkers();
  }, [regions, updateMarkers]);

  // Mettre à jour le type de carte
  useEffect(() => {
    if (!mapRef.current) return;

    const tileUrl =
      mapType === "standard"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    // Supprimer l'ancien layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    // Ajouter le nouveau layer
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);
  }, [mapType]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleFullscreen = () => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current as HTMLDivElement & FullscreenAPI;
    const doc = document as Document & {
      exitFullscreen?: () => Promise<void>;
      webkitExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
      fullscreenElement?: Element;
    };

    if (!doc.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
        style={{ borderRadius: "0 0 1rem 1rem" }}
      />
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
            <DropdownMenuItem onClick={() => setMapType("standard")}>
              Standard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMapType("satellite")}>
              Satellite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

export { MapComponent };
