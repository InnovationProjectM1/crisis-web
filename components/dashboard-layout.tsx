"use client";

import type React from "react";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        currentPage={title}
      />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
