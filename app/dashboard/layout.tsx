/**
 * Layout del Dashboard
 * Protegido por middleware - solo accesible para usuarios autenticados
 *
 * Estructura:
 *   <SidebarProvider>      ← client component que provee el contexto
 *     <Sidebar />          ← drawer en móvil, fijo en desktop
 *     <Header />           ← incluye botón hamburguesa
 *     <main>{children}</main>
 *   </SidebarProvider>
 */

import React from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { getSession } from "@/lib/services/auth.service";

// Este layout requiere sesión activa
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#f8f9fa]">
        <Sidebar user={user} />
        <Header user={user} />
        <main className="lg:ml-[260px] pt-16 min-h-screen">
          <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
