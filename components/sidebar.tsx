"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useHeavyAnimation } from "@/hooks/use-heavy-animation";
import { Component as EtherealShadow } from "@/components/ui/etheral-shadow";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "scheduler", label: "Scheduler", icon: Calendar, href: "/scheduler" },
  { id: "chat", label: "Study Groups", icon: MessageSquare, href: "/chat" },
];

// Export a wrapper that can be used in layout.tsx to get the sidebar and content area
// Shared selected/idle vocabulary so nav + footer read the same brand accent
const ACTIVE_ITEM =
  "bg-indigo-500/15 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] border border-indigo-400/30 backdrop-blur-md";
const IDLE_ITEM =
  "hover:bg-white/5 hover:text-white text-white/60 hover:backdrop-blur-sm";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const animateShadow = useHeavyAnimation();

  // Close the off-canvas sheet after navigating on mobile
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return <main className="h-screen w-full bg-background overflow-auto">{children}</main>;
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Ethereal shadow background — drifts behind the whole app shell */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {animateShadow && (
          <EtherealShadow
            color="rgba(99, 102, 241, 1)"
            animation={{ scale: 100, speed: 75 }}
            noise={{ opacity: 0.45, scale: 1.2 }}
            sizing="fill"
          />
        )}
        {/* Scrim keeps dense dashboard content legible over the moving shadow */}
        <div className="absolute inset-0 bg-[#030712]/55" />
      </div>

      <Sidebar collapsible="icon" className="border-r-0 glass-sidebar z-20">
        <SidebarHeader className="transition-all duration-300 group-data-[collapsible=icon]:px-0 py-6">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-between w-full px-2 transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <SidebarMenuButton size="lg" asChild className="transition-all duration-300 ease-in-out hover:bg-white/10 group-data-[collapsible=icon]:hidden w-auto mr-2">
                  <Link href="/dashboard" className="flex items-center gap-4">
                    <Image
                      src="/logo.png"
                      alt="Saku"
                      width={40}
                      height={40}
                      className="aspect-square size-10 shrink-0 rounded-xl shadow-lg shadow-indigo-500/20"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                      <span className="truncate font-bold text-xl liquid-text max-w-[200px]">Saku</span>
                      <span className="truncate text-xs text-white/50 max-w-[200px]">Academic Dashboard</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
                <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-all h-10 w-10" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="px-4 py-4 transition-all duration-300 group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        size="lg"
                        className={`
                          transition-all duration-300 ease-out rounded-xl
                          group-data-[collapsible=icon]:!rounded-full group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!p-2.5 group-data-[collapsible=icon]:mx-auto
                          ${isActive ? ACTIVE_ITEM : IDLE_ITEM}
                        `}
                      >
                        <Link href={item.href} onClick={closeOnMobile} className="flex items-center gap-4 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                          <Icon className={`${isActive ? "text-white" : "text-white/60 group-hover:text-white"} h-5 w-5 shrink-0 transition-colors`} />
                          <span className="font-medium text-base whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0 max-w-[200px]">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-white/5 transition-all duration-300 group-data-[collapsible=icon]:px-0 bg-black/10 backdrop-blur-sm">
          <SidebarMenu className="gap-2">
            {user && (
              <SidebarMenuItem>
                <div className="flex items-center gap-4 px-2 py-2 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-10 w-10 shrink-0 border-2 border-white/10 shadow-lg">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-xs">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0">
                    <span className="truncate font-semibold text-white">{user.name}</span>
                    <span className="truncate text-xs text-white/50">{user.email}</span>
                  </div>
                </div>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Settings"
                isActive={pathname === '/settings'}
                size="lg"
                className={`rounded-xl transition-all duration-300 group-data-[collapsible=icon]:!rounded-full group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!p-2.5 group-data-[collapsible=icon]:mx-auto ${pathname === '/settings' ? ACTIVE_ITEM : IDLE_ITEM}`}
              >
                <Link href="/settings" onClick={closeOnMobile} className="flex items-center gap-4 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                  <Settings className="h-5 w-5 shrink-0" />
                  <span className="font-medium text-base whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0 max-w-[200px]">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Logout"
                size="lg"
                onClick={logout}
                className="rounded-xl hover:bg-red-500/10 hover:text-red-400 text-white/60 transition-all duration-300 group-data-[collapsible=icon]:!rounded-full group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!p-2.5 group-data-[collapsible=icon]:mx-auto"
              >
                <div className="flex items-center gap-4 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center w-full">
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span className="font-medium text-base whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0 max-w-[200px]">Logout</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-transparent z-10">
        {/* Mobile-only floating toggle — the only way to reach the off-canvas nav on small screens */}
        <SidebarTrigger
          aria-label="Open navigation"
          className="md:hidden fixed left-6 top-[max(1rem,env(safe-area-inset-top))] z-30 h-10 w-10 rounded-xl glass-button text-white/80 hover:text-white"
        />
        <div className="flex-1 overflow-auto scroll-smooth">
          <div className="p-6 pt-20 md:p-10 max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}