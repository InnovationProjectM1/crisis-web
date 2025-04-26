"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Bell,
  Download,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  title?: string;
}

export function Header({ setSidebarOpen, title }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isLive, setIsLive] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Branding & Sidebar Toggle */}
      <div className="flex items-center gap-4 min-w-0">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        {title && (
          <span className="ml-4 truncate text-xl font-semibold text-ellipsis max-w-[180px] md:max-w-xs" title={title}>{title}</span>
        )}
      </div>
      {/* Search bar only */}
      <div className="flex-1 flex items-center justify-center gap-4 min-w-0">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tweets, locations, resources..."
            className="pl-8 pr-4 w-full rounded-md shadow-sm"
          />
        </div>
      </div>
      {/* Right: Dark mode + User menu */}
      <div className="flex items-center gap-4 min-w-0">
        <Toggle
          aria-label="Activer/désactiver le mode sombre"
          pressed={theme === "dark"}
          onPressedChange={checked => setTheme(checked ? "dark" : "light")}
          className={
            cn(
              "relative flex items-center justify-center w-10 h-10 rounded-full border border-border bg-muted transition-colors duration-200 shadow hover:bg-accent group",
              theme === "dark" ? "ring-2 ring-yellow-400" : "ring-0"
            )
          }
        >
          <span className="sr-only">Toggle dark mode</span>
          <Sun
            className={
              cn(
                "absolute transition-all duration-300 h-5 w-5 text-orange-400 scale-100 group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0",
                theme === "dark" && "scale-0 opacity-0"
              )
            }
          />
          <Moon
            className={
              cn(
                "absolute transition-all duration-300 h-5 w-5 text-yellow-400 scale-0 opacity-0 group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100",
                theme === "dark" && "scale-100 opacity-100"
              )
            }
          />
        </Toggle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <span className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                {/* Status dot */}
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background bg-green-500" />
              </span>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
                <span className="text-xs text-green-600 font-semibold">Online</span>
                <span className="text-xs text-muted-foreground">Operator</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
