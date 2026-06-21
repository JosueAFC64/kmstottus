import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Button, Avatar, Icon } from "@/components/ui";

const stats = [
  {
    title: "Total de Artículos",
    value: "0",
    description: "Artículos en el repositorio",
    icon: <Icon.Document className="w-6 h-6" />,
    color: "green" as const,
  },
  {
    title: "Vistas Totales",
    value: "0",
    description: "En los últimos 30 días",
    icon: <Icon.Eye className="w-6 h-6" />,
    color: "blue" as const,
  },
  {
    title: "Usuarios Activos",
    value: "0",
    description: "Registrados en el sistema",
    icon: <Icon.Users className="w-6 h-6" />,
    color: "orange" as const,
  },
  {
    title: "Pendientes de Revisar",
    value: "0",
    description: "Requieren aprobación",
    icon: <Icon.Clock className="w-6 h-6" />,
    color: "gray" as const,
  },
];

const quickActions = [
  { label: "Nuevo Artículo", href: "/dashboard/repository/new", icon: <Icon.Plus className="w-5 h-5" />, color: "green" as const },
  { label: "Ver FAQs", href: "/dashboard/faqs", icon: <Icon.Question className="w-5 h-5" />, color: "orange" as const },
  { label: "Buscar Experto", href: "/dashboard/experts", icon: <Icon.UserCircle className="w-5 h-5" />, color: "purple" as const },
  { label: "Lecciones Aprendidas", href: "/dashboard/lessons", icon: <Icon.Lightbulb className="w-5 h-5" />, color: "blue" as const },
];

const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
  green: { bg: "bg-[#d4edda]", text: "text-[#1a472a]", ring: "ring-[#1a472a]/20" },
  blue: { bg: "bg-[#d1ecf1]", text: "text-[#0077b6]", ring: "ring-[#0077b6]/20" },
  orange: { bg: "bg-[#fff3cd]", text: "text-[#fd7e14]", ring: "ring-[#fd7e14]/20" },
  purple: { bg: "bg-[#e2d9f3]", text: "text-[#6f42c1]", ring: "ring-[#6f42c1]/20" },
  gray: { bg: "bg-[#e9ecef]", text: "text-[#868e96]", ring: "ring-[#868e96]/20" },
  red: { bg: "bg-[#f8d7da]", text: "text-[#e31837]", ring: "ring-[#e31837]/20" },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Centro: Mensaje de bienvenida */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#1a472a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon.Document className="w-8 h-8 text-[#1a472a]" />
              </div>
              <h2 className="text-xl font-bold text-[#212529] mb-2">
                Bienvenido al Centro de Conocimiento
              </h2>
              <p className="text-[#868e96] mb-6 max-w-md mx-auto">
                Aquí encontrarás manuales, políticas, procedimientos y guías de Papa Johns Perú.
                Comienza explorando el repositorio o creando nuevo contenido.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/dashboard/repository">
                  <Button variant="primary" size="sm" className="gap-2">
                    <Icon.Repository className="w-4 h-4" />
                    Explorar Repositorio
                  </Button>
                </Link>
                <Link href="/dashboard/repository/new">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon.Plus className="w-4 h-4" />
                    Crear Artículo
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Materiales disponibles */}
          <Card padding="none" className="mt-4 sm:mt-6">
            <CardHeader className="p-4 sm:p-6 border-b border-[#dee2e6]">
              <CardTitle className="text-base sm:text-lg">Materiales Disponibles</CardTitle>
            </CardHeader>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-[#dee2e6] rounded-lg text-center">
                  <div className="w-10 h-10 bg-[#e31837]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon.Cog className="w-5 h-5 text-[#e31837]" />
                  </div>
                  <h4 className="font-medium text-[#495057] mb-1">Videos de Capacitación</h4>
                  <p className="text-xs text-[#868e96]">BPM, inducción, seguridad y más</p>
                </div>
                <div className="p-4 border border-[#dee2e6] rounded-lg text-center">
                  <div className="w-10 h-10 bg-[#ffb500]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon.Document className="w-5 h-5 text-[#fd7e14]" />
                  </div>
                  <h4 className="font-medium text-[#495057] mb-1">Documentos PDF</h4>
                  <p className="text-xs text-[#868e96]">Reglamento interno y manuales</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-5">
          {/* Quick Actions */}
          <Card padding="none">
            <CardHeader className="p-4 border-b border-[#dee2e6]">
              <CardTitle className="text-base">Acciones Rápidas</CardTitle>
            </CardHeader>
            <div className="p-2 sm:p-3 space-y-1">
              {quickActions.map((action) => {
                const c = colorClasses[action.color];
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-[#f8f9fa] transition-colors group"
                  >
                    <span className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      {action.icon}
                    </span>
                    <span className="font-medium text-sm text-[#495057] truncate">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Info */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-[#212529] mb-3 flex items-center gap-2">
              <Icon.Question className="w-4 h-4 text-[#868e96]" />
              Sobre el Sistema
            </h3>
            <p className="text-xs text-[#868e96] leading-relaxed">
              Este centro de conocimiento está diseñado para gestionar y compartir información
              de Papa Johns Perú de forma centralizada y accesible para todos los colaboradores.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
