"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

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

interface HeatMapComponentProps {
  heatmapData: HeatmapData | null;
  dataType: string;
  selectedRegion: RegionType | null;
  setSelectedRegion: (region: RegionType | null) => void;
}

function HeatMapComponent({
  heatmapData,
  dataType,
  selectedRegion,
  setSelectedRegion,
}: HeatMapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const popupRef = useRef<L.Popup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialisation de la carte
  useEffect(() => {
    // Ne pas initialiser la carte si le conteneur n'est pas prêt ou si les données ne sont pas disponibles
    if (!mapContainerRef.current || !heatmapData) return;

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
      scrollWheelZoom: false,
    });

    // Ajouter la couche de tuiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Stocker la référence à la carte
    mapRef.current = map;

    // Gérer les clics sur la carte
    map.on("click", (e) => {
      if (!heatmapData) return;

      let minDist = Infinity;
      let closest = null;

      for (const region of heatmapData.regions) {
        const dist = Math.sqrt(
          Math.pow(region.lat - e.latlng.lat, 2) +
            Math.pow(region.lng - e.latlng.lng, 2),
        );
        if (dist < minDist) {
          minDist = dist;
          closest = region;
        }
      }

      if (closest && minDist < 0.01) {
        setSelectedRegion(closest);
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
  }, [heatmapData, setSelectedRegion]);

  // Préparer les points pour la heatmap
  useEffect(() => {
    if (!mapRef.current || !heatmapData?.regions) return;

    // Supprimer la couche de chaleur existante si elle existe
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Créer les points pour la heatmap
    const points = heatmapData.regions.map(
      (region) =>
        [
          region.lat,
          region.lng,
          dataType === "needs"
            ? region.needsIntensity
            : region.resourcesIntensity,
        ] as [number, number, number],
    );

    // Créer et ajouter la couche de chaleur
    // @ts-expect-error - L'extension leaflet.heat n'a pas de types TS corrects
    const heatLayer = L.heatLayer(points, { radius: 30, blur: 20, max: 1 });
    heatLayer.addTo(mapRef.current);

    // Stocker la référence à la couche de chaleur
    heatLayerRef.current = heatLayer;
  }, [heatmapData, dataType]);

  // Cette section gère les changements de région sélectionnée
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

    // Le code pour afficher le tooltip a été supprimé comme demandé
  }, [selectedRegion]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

export { HeatMapComponent };
