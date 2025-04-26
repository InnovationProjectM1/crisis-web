"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, MessageSquare, ThumbsUp } from "lucide-react";

interface TweetData {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  location: string;
  category: string;
  urgency: string;
  verified: boolean;
}

interface Resource {
  type: string;
  urgency: string;
  count: number;
}

// Using Resource type as Need since they have the same structure
type Need = Resource;

interface RegionData {
  name: string;
  needs: Need[];
  resources: Resource[];
}

interface IncidentData {
  id: string;
  type: string;
  severity: string;
  coordinates: {
    x: number;
    y: number;
  };
}

interface HeatmapRegionData {
  name: string;
  intensity: number;
}

interface AlertData {
  type: "tweet" | "region" | "incident" | "heatmap_region";
  data: TweetData | RegionData | IncidentData | HeatmapRegionData;
}

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AlertData | null;
}

export function AlertModal({ open, onOpenChange, data }: AlertModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {data.type === "tweet" && "Tweet Details"}
            {data.type === "region" &&
              `${(data.data as RegionData).name} Details`}
            {data.type === "incident" && "Incident Details"}
            {data.type === "heatmap_region" &&
              `${(data.data as HeatmapRegionData).name} Intensity`}
          </DialogTitle>
          <DialogDescription>
            {data.type === "tweet" && "Detailed information about this tweet"}
            {data.type === "region" &&
              "Resource and needs information for this region"}
            {data.type === "incident" && "Details about this incident"}
            {data.type === "heatmap_region" &&
              `${(data.data as HeatmapRegionData).intensity * 100}% intensity in this region`}
          </DialogDescription>
        </DialogHeader>

        {data.type === "tweet" && (
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              {" "}
              <div className="flex items-start justify-between mb-1">
                <div className="font-medium">
                  @{(data.data as TweetData).username}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {formatTime((data.data as TweetData).timestamp)}
                </div>
              </div>
              <p className="text-sm mb-2">{(data.data as TweetData).text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={
                      (data.data as TweetData).category === "need"
                        ? "destructive"
                        : (data.data as TweetData).category === "resource"
                          ? "default"
                          : "outline"
                    }
                    className="text-xs px-1.5 py-0 h-5"
                  >
                    {(data.data as TweetData).category.charAt(0).toUpperCase() +
                      (data.data as TweetData).category.slice(1)}
                  </Badge>

                  {(data.data as TweetData).urgency === "high" && (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 border-red-500/20 text-xs px-1.5 py-0 h-5"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}

                  {(data.data as TweetData).verified && (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20 text-xs px-1.5 py-0 h-5"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{(data.data as TweetData).location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>ID: {(data.data as TweetData).id}</span>
              </div>
            </div>
          </div>
        )}

        {data.type === "region" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Needs</h3>
              <div className="space-y-2">
                {(data.data as RegionData).needs.map(
                  (need: Need, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            need.urgency === "high" ? "destructive" : "outline"
                          }
                          className="text-xs"
                        >
                          {need.urgency}
                        </Badge>
                        <span>{need.type}</span>
                      </div>
                      <span className="font-medium">{need.count}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Resources</h3>
              <div className="space-y-2">
                {(data.data as RegionData).resources.map(
                  (resource: Resource, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          {resource.urgency}
                        </Badge>
                        <span>{resource.type}</span>
                      </div>
                      <span className="font-medium">{resource.count}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {data.type === "incident" && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">
                  {(data.data as IncidentData).type
                    .split("_")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1),
                    )
                    .join(" ")}
                </h3>
                <Badge
                  variant={
                    (data.data as IncidentData).severity === "high"
                      ? "destructive"
                      : (data.data as IncidentData).severity === "medium"
                        ? "default"
                        : "outline"
                  }
                >
                  {(data.data as IncidentData).severity}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{(data.data as IncidentData).id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span>
                    X: {(data.data as IncidentData).coordinates.x}, Y:{" "}
                    {(data.data as IncidentData).coordinates.y}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.type === "heatmap_region" && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{data.data.name}</h3>
                <Badge>
                  {Math.round(data.data.intensity * 100)}% Intensity
                </Badge>
              </div>

              <div className="w-full h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full mb-2">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: "4px",
                    marginLeft: `calc(${data.data.intensity * 100}% - 2px)`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>Take Action</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}
