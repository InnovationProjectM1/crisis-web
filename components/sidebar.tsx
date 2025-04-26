"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  AlertTriangle,
  BarChart4,
  Bell,
  Filter,
  Home,
  MapPin,
  MessageSquare,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

// Update the SidebarProps interface to include currentPage
interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentPage?: string;
}

export function Sidebar({ open, setOpen, currentPage }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="hidden sm:inline bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">Crisis Monitor</span>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="px-2 py-4 space-y-1">
            <NavItems currentPage={currentPage} />
          </nav>
        </ScrollArea>
        <div className="p-4 border-t">
          <FilterSection />
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Crisis Monitor</span>
            </div>
          </div>
          <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
            <nav className="px-2 py-4 space-y-1">
              <NavItems currentPage={currentPage} />
            </nav>
          </ScrollArea>
          <div className="p-4 border-t">
            <FilterSection />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface NavItemsProps {
  currentPage?: string;
}

function NavItems({ currentPage }: NavItemsProps) {
  return (
    <>
      <NavItem
        icon={<Home />}
        label="Dashboard"
        href="/"
        active={!currentPage || currentPage === "Dashboard"}
      />      
      <NavItem
        icon={<MessageSquare />}
        label="Tweet Analysis"
        href="/tweet-analysis"
        active={currentPage === "Tweet Analysis"}
      />
      <NavItem
        icon={<MapPin />}
        label="Resource Map"
        href="/resource-map"
        active={currentPage === "Resource Map"}
      />
      <NavItem
        icon={<BarChart4 />}
        label="Trends"
        href="/trends"
        active={currentPage === "Trends"}
      />
      <NavItem
        icon={<Settings />}
        label="Settings"
        href="/settings"
        active={currentPage === "Settings"}
      />
    </>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function NavItem({ icon, label, href, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function FilterSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </Button>

      {expanded && (
        <div className="space-y-2 pt-2 pl-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="needs" className="rounded" />
            <label htmlFor="needs" className="text-sm">
              Needs
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="resources" className="rounded" />
            <label htmlFor="resources" className="text-sm">
              Resources
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="urgent" className="rounded" />
            <label htmlFor="urgent" className="text-sm">
              Urgent
            </label>
          </div>
        </div>
      )}

      <Button variant="outline" className="w-full justify-start gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Advanced Filters</span>
      </Button>
    </div>
  );
}
