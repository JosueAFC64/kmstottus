"use client";

import React from "react";
import { Input, Icon } from "@/components/ui";
import type { SessionUser } from "@/types/auth";
import { useSidebar } from "./sidebar-context";

interface HeaderProps {
  user: SessionUser;
}

export function Header({ user }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[260px] h-16 bg-white border-b border-[#dee2e6] flex items-center justify-between px-4 sm:px-6 z-30">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Botón hamburguesa solo en móvil */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 text-[#495057] hover:bg-[#f1f3f5] rounded-lg transition-colors flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Icon.Menu className="w-6 h-6" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-[#212529] truncate">Dashboard</h2>
          <p className="text-xs sm:text-sm text-[#868e96] truncate">
            Bienvenido, <span className="font-medium text-[#212529]">{user.firstName}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Search - oculto en móvil muy pequeño */}
        <div className="hidden md:block w-64 lg:w-80">
          <Input
            type="search"
            placeholder="Buscar artículos, expertos..."
            icon={<Icon.Search className="w-5 h-5" />}
          />
        </div>

        {/* Botón de búsqueda para móvil */}
        <button
          className="md:hidden p-2 text-[#868e96] hover:text-[#495057] hover:bg-[#f1f3f5] rounded-lg transition-colors"
          aria-label="Buscar"
        >
          <Icon.Search className="w-6 h-6" />
        </button>

        {/* Help */}
{/*         <button
          className="hidden sm:block p-2 text-[#868e96] hover:text-[#495057] hover:bg-[#f1f3f5] rounded-lg transition-colors"
          aria-label="Ayuda"
        >
          <Icon.Question className="w-6 h-6" />
        </button> */}
      </div>
    </header>
  );
}
