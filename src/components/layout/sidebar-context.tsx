"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("wedora_sidebar_toggle", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("wedora_sidebar_toggle", callback);
  };
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem("wedora_sidebar_collapsed") === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleSidebar = useCallback(() => {
    try {
      const current = localStorage.getItem("wedora_sidebar_collapsed") === "true";
      localStorage.setItem("wedora_sidebar_collapsed", String(!current));
      window.dispatchEvent(new Event("wedora_sidebar_toggle"));
    } catch {
      // Abaikan
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
