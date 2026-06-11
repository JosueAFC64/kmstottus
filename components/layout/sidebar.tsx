"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, Icon } from "@/components/ui";
import type { SessionUser } from "@/types/auth";
import { hasPermission, type Permission } from "@/lib/constants/roles";
import { useSidebar } from "./sidebar-context";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredPermission?: Permission;
}

interface NavSection {
  title?: string;
  items: MenuItem[];
}

const navigationSections: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <Icon.Dashboard className="w-5 h-5" />,
      },
      {
        label: "Repositorio",
        href: "/dashboard/repository",
        icon: <Icon.Repository className="w-5 h-5" />,
        requiredPermission: "documents.view",
      },
      {
        label: "Onboarding",
        href: "/dashboard/onboarding",
        icon: <Icon.Users className="w-5 h-5" />,
        requiredPermission: "onboarding.view",
      },
      {
        label: "Entrevistas de Salida",
        href: "/dashboard/exit-interviews",
        icon: <Icon.Chat className="w-5 h-5" />,
        requiredPermission: "exit_interviews.view",
      },
    ],
  },
  {
    title: "Gestión",
    items: [
      {
        label: "Lecciones Aprendidas",
        href: "/dashboard/lessons",
        icon: <Icon.Lightbulb className="w-5 h-5" />,
        requiredPermission: "lessons.view",
      },
      {
        label: "FAQs",
        href: "/dashboard/faqs",
        icon: <Icon.Question className="w-5 h-5" />,
        requiredPermission: "faqs.view",
      },
      {
        label: "Directorio de Expertos",
        href: "/dashboard/experts",
        icon: <Icon.UserCircle className="w-5 h-5" />,
        requiredPermission: "experts.view",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        label: "Métricas",
        href: "/dashboard/metrics",
        icon: <Icon.Chart className="w-5 h-5" />,
        requiredPermission: "metrics.view",
      },
      {
        label: "Administración",
        href: "/dashboard/admin",
        icon: <Icon.Cog className="w-5 h-5" />,
        requiredPermission: "admin.full",
      },
    ],
  },
];

interface SidebarProps {
  user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Para rutas padre como /dashboard, también marcar como activo
    // si la URL actual es un hijo directo de esa ruta
    if (href !== "/" && pathname.startsWith(href + "/")) {
      // Verifica que el segmento siguiente sea parte de la jerarquía
      // Esto evita falsos positivos con rutas que tienen nombres similares
      const remainingPath = pathname.slice(href.length);
      return remainingPath.startsWith("/") && !remainingPath.includes("/");
    }
    return false;
  };
  const { isOpen, close } = useSidebar();

  const handleSignOut = async () => {
    close();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const content = (
    <aside className="flex flex-col h-full w-[260px] bg-white border-r border-[#dee2e6]">
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#dee2e6] flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0" onClick={close}>
          <div className="w-10 h-10 bg-none rounded-lg flex items-center justify-center flex-shrink-0">
            <Image src="/tottus.svg" alt="Tottus" width={24} height={24}/>
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-[#212529] text-lg leading-tight truncate">KMS</h1>
            <p className="text-xs text-[#868e96] truncate">Tottus Perú</p>
          </div>
        </Link>
        {/* Botón cerrar solo en móvil */}
        <button
          onClick={close}
          className="lg:hidden p-2 text-[#868e96] hover:text-[#212529] hover:bg-[#f1f3f5] rounded-lg transition-colors flex-shrink-0"
          aria-label="Cerrar menú"
        >
          <Icon.Close className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navigationSections.map((section, sectionIndex) => {
          const visibleItems = section.items.filter((item) => {
            if (!item.requiredPermission) return true;
            return hasPermission(user.role, item.requiredPermission);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={sectionIndex} className="mb-6 last:mb-0">
              {section.title && (
                <p className="px-3 mb-2 text-xs font-semibold text-[#adb5bd] uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "bg-[#00a651] text-white"
                          : "text-[#495057] hover:bg-[#f1f3f5]"
                      }`}
                    >
                      <span className={isActive(item.href) ? "text-white" : "text-[#868e96]"}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#dee2e6] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} size="md" src={user.avatarUrl} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#212529] truncate">{user.fullName}</p>
            <p className="text-xs text-[#868e96] truncate capitalize">
              {user.role.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-[#868e96] hover:text-[#dc3545] hover:bg-[#f8d7da] rounded-lg transition-colors flex-shrink-0"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <Icon.Logout className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Sidebar móvil: drawer con overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={close}
        />
        {/* Panel */}
        <div
          className={`absolute inset-y-0 left-0 max-w-[280px] w-full bg-white shadow-xl transition-transform duration-200 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </div>
      </div>

      {/* Sidebar desktop: fijo */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        {content}
      </div>
    </>
  );
}
