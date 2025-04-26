"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
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

export function ResourceMapFull() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );

  useEffect(() => {
    // Simulate loading map data
    const loadMapData = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMapData({
        regions: [
          {
            id: "downtown",
            name: "Downtown",
            coordinates: { x: 150, y: 150, radius: 40 },
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
            coordinates: { x: 150, y: 70, radius: 30 },
            needs: [
              { type: "water", count: 25, urgency: "high" },
              { type: "power", count: 18, urgency: "high" },
            ],
            resources: [
              { type: "medical", count: 5, urgency: "medium" },
              { type: "food", count: 10, urgency: "low" },
            ],
          },
          {
            id: "east",
            name: "East District",
            coordinates: { x: 230, y: 150, radius: 35 },
            needs: [
              { type: "shelter", count: 30, urgency: "high" },
              { type: "medical", count: 15, urgency: "medium" },
            ],
            resources: [{ type: "volunteers", count: 12, urgency: "medium" }],
          },
          {
            id: "south",
            name: "South District",
            coordinates: { x: 150, y: 230, radius: 35 },
            needs: [
              { type: "food", count: 20, urgency: "medium" },
              { type: "water", count: 15, urgency: "low" },
            ],
            resources: [
              { type: "shelter", count: 8, urgency: "medium" },
              { type: "medical", count: 5, urgency: "low" },
            ],
          },
          {
            id: "west",
            name: "West District",
            coordinates: { x: 70, y: 150, radius: 30 },
            needs: [
              { type: "volunteers", count: 15, urgency: "medium" },
              { type: "power", count: 10, urgency: "high" },
            ],
            resources: [
              { type: "food", count: 25, urgency: "low" },
              { type: "water", count: 20, urgency: "low" },
            ],
          },
        ],
        incidents: [
          {
            id: "flood1",
            type: "flood",
            coordinates: { x: 180, y: 120 },
            severity: "high",
          },
          {
            id: "fire1",
            type: "fire",
            coordinates: { x: 100, y: 200 },
            severity: "medium",
          },
          {
            id: "road1",
            type: "road_closure",
            coordinates: { x: 220, y: 180 },
            severity: "medium",
          },
          {
            id: "power_outage1",
            type: "power_outage",
            coordinates: { x: 50, y: 50 },
            severity: "high",
          },
          {
            id: "medical_emergency1",
            type: "medical_emergency",
            coordinates: { x: 250, y: 250 },
            severity: "medium",
          },
        ],
      });
      setLoading(false);
    };

    loadMapData();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !mapData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base map
    drawMap(ctx, canvas.width, canvas.height);

    // Draw regions
    mapData.regions.forEach((region) => {
      drawRegion(ctx, region, zoom, selectedRegion?.id === region.id);
    });

    // Draw incidents
    mapData.incidents.forEach((incident) => {
      drawIncident(ctx, incident, zoom, selectedIncident?.id === incident.id);
    });
  }, [mapData, zoom, selectedRegion, selectedIncident]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !mapData) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Check if click is within any region
    for (const region of mapData.regions) {
      const { coordinates } = region;
      const distance = Math.sqrt(
        Math.pow(x - coordinates.x, 2) + Math.pow(y - coordinates.y, 2),
      );

      if (distance <= coordinates.radius) {
        setSelectedRegion(region);
        setSelectedIncident(null);
        return;
      }
    }

    // Check if click is within any incident
    for (const incident of mapData.incidents) {
      const { coordinates } = incident;
      const distance = Math.sqrt(
        Math.pow(x - coordinates.x, 2) + Math.pow(y - coordinates.y, 2),
      );

      if (distance <= 10) {
        setSelectedIncident(incident);
        setSelectedRegion(null);
        return;
      }
    }

    setSelectedRegion(null);
    setSelectedIncident(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  return (
    <div
      className={`h-[600px] flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Resource & Needs Map</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Layers className="h-4 w-4 mr-2" />
                Layers
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Map Layers</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="needs-layer"
                    className="mr-2"
                    defaultChecked
                  />
                  <label htmlFor="needs-layer">Needs</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="resources-layer"
                    className="mr-2"
                    defaultChecked
                  />
                  <label htmlFor="resources-layer">Resources</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="incidents-layer"
                    className="mr-2"
                    defaultChecked
                  />
                  <label htmlFor="incidents-layer">Incidents</label>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="relative flex-1 border rounded-lg overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-full cursor-pointer"
              onClick={handleCanvasClick}
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            />

            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={zoomIn}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={zoomOut}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>High Need</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>Available Resource</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>Incident</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface MapData {
  regions: Region[];
  incidents: Incident[];
}

interface Region {
  id: string;
  name: string;
  coordinates: { x: number; y: number; radius: number };
  needs: ResourceItem[];
  resources: ResourceItem[];
}

interface ResourceItem {
  type: string;
  count: number;
  urgency: "low" | "medium" | "high";
}

interface Incident {
  id: string;
  type: string;
  coordinates: { x: number; y: number };
  severity: "low" | "medium" | "high";
}

function drawMap(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Draw background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  // Draw grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 0.5;

  for (let i = 0; i < width; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }

  for (let i = 0; i < height; i += 30) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Draw main roads
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3;

  // Horizontal main road
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Vertical main road
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
}

function drawRegion(
  ctx: CanvasRenderingContext2D,
  region: Region,
  zoom: number,
  isSelected = false,
) {
  const { coordinates, needs, resources } = region;
  const { x, y, radius } = coordinates;

  // Draw region circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = isSelected
    ? "rgba(59, 130, 246, 0.3)"
    : "rgba(203, 213, 225, 0.3)";
  ctx.fill();
  ctx.strokeStyle = isSelected ? "#3b82f6" : "#94a3b8";
  ctx.lineWidth = isSelected ? 2 : 1;
  ctx.stroke();

  // Draw region name
  ctx.fillStyle = "#334155";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(region.name, x, y - radius - 5);

  // Draw needs indicators
  const highNeedsCount = needs.filter((n) => n.urgency === "high").length;
  if (highNeedsCount > 0) {
    ctx.beginPath();
    ctx.arc(x - radius / 2, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(highNeedsCount.toString(), x - radius / 2, y);
  }

  // Draw resources indicators
  const resourcesCount = resources.length;
  if (resourcesCount > 0) {
    ctx.beginPath();
    ctx.arc(x + radius / 2, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(resourcesCount.toString(), x + radius / 2, y);
  }
}

// Fix the error in the drawIncident function
function drawIncident(
  ctx: CanvasRenderingContext2D,
  incident: Incident,
  zoom: number,
  isSelected = false,
) {
  const { coordinates, type, severity } = incident;
  const { x, y } = coordinates;

  // Draw incident marker
  ctx.beginPath();
  ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);

  if (severity === "high") {
    ctx.fillStyle = "#ef4444";
  } else if (severity === "medium") {
    ctx.fillStyle = "#f59e0b";
  } else {
    ctx.fillStyle = "#eab308";
  }

  ctx.fill();
  ctx.strokeStyle = isSelected ? "#3b82f6" : "#ffffff";
  ctx.lineWidth = isSelected ? 2 : 1;
  ctx.stroke();

  // Draw incident type indicator
  let symbol = "!";
  if (type === "flood") symbol = "~";
  else if (type === "fire") symbol = "🔥";
  else if (type === "road_closure") symbol = "X";
  else if (type === "power_outage") symbol = "⚡";
  else if (type === "medical_emergency") symbol = "+";

  ctx.fillStyle = "#ffffff";
  ctx.font = "8px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, x, y);
}
