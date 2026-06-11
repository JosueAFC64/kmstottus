import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Button, Avatar, Icon } from "@/components/ui";

// Mock data for the dashboard
const stats = [
  {
    title: "Total de Artículos",
    value: "156",
    description: "Artículos en el repositorio",
    icon: <Icon.Document className="w-6 h-6" />,
    color: "green" as const,
  },
  {
    title: "Vistas Totales",
    value: "387",
    description: "En los últimos 30 días",
    icon: <Icon.Eye className="w-6 h-6" />,
    color: "blue" as const,
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Usuarios Activos",
    value: "42",
    description: "Conectados ahora",
    icon: <Icon.Users className="w-6 h-6" />,
    color: "orange" as const,
  },
  {
    title: "Pendientes de Revisar",
    value: "8",
    description: "Requieren aprobación",
    icon: <Icon.Clock className="w-6 h-6" />,
    color: "gray" as const,
  },
];

const recentArticles = [
  {
    id: 'doc-001',
    title: 'Manual de Procedimientos - Área de Caja',
    category: 'Manuales Operativos',
    author: 'María García',
    views: 342,
    updatedAt: 'Hace 2 horas',
  },
  {
    id: 'doc-004',
    title: 'Protocolo de Atención al Cliente',
    category: 'Procesos',
    author: 'María García',
    views: 256,
    updatedAt: 'Hace 5 horas',
  },
  {
    id: 'doc-002',
    title: 'Guía de Inventario - Productos Perecibles',
    category: 'Manuales Operativos',
    author: 'Ana Martínez',
    views: 287,
    updatedAt: 'Ayer',
  },
  {
    id: 'doc-005',
    title: 'Procedimiento de Devoluciones y Cambios',
    category: 'Procesos',
    author: 'María García',
    views: 189,
    updatedAt: 'Hace 2 días',
  },
];

const topExperts = [
  { name: "María García", role: "Supervisora de Caja", area: "Operaciones", articles: 23 },
  { name: "Carlos López", role: "Jefe de Recursos Humanos", area: "RRHH", articles: 18 },
  { name: "Ana Martínez", role: "Coordinadora de Inventario", area: "Logística", articles: 15 },
];

const quickActions = [
  { label: "Nuevo Artículo", href: "/dashboard/repository/new", icon: <Icon.Plus className="w-5 h-5" />, color: "green" as const },
  { label: "Programar Entrevista", href: "/dashboard/exit-interviews/new", icon: <Icon.Calendar className="w-5 h-5" />, color: "blue" as const },
  { label: "Ver FAQs", href: "/dashboard/faqs", icon: <Icon.Question className="w-5 h-5" />, color: "orange" as const },
  { label: "Buscar Experto", href: "/dashboard/experts", icon: <Icon.UserCircle className="w-5 h-5" />, color: "purple" as const },
];

const categories = [
  { name: "Operaciones", count: 45, color: "green" as const, icon: <Icon.Cog className="w-4 h-4" /> },
  { name: "RRHH", count: 32, color: "orange" as const, icon: <Icon.Users className="w-4 h-4" /> },
  { name: "Logística", count: 28, color: "blue" as const, icon: <Icon.Folder className="w-4 h-4" /> },
  { name: "Servicio", count: 24, color: "gray" as const, icon: <Icon.Chat className="w-4 h-4" /> },
  { name: "Seguridad", count: 18, color: "red" as const, icon: <Icon.Shield className="w-4 h-4" /> },
];

const recentActivity = [
  {
    type: "create",
    icon: <Icon.Plus className="w-5 h-5" />,
    bgClass: "bg-[#d4edda]",
    textClass: "text-[#00a651]",
    title: "Nuevo artículo publicado",
    subtitle: "Protocolo de Seguridad",
    time: "Hace 30 minutos",
  },
  {
    type: "interview",
    icon: <Icon.Chat className="w-5 h-5" />,
    bgClass: "bg-[#fff3cd]",
    textClass: "text-[#f7941d]",
    title: "Entrevista completada",
    subtitle: "Juan Pérez - Área de Logística",
    time: "Hace 2 horas",
  },
  {
    type: "lesson",
    icon: <Icon.Check className="w-5 h-5" />,
    bgClass: "bg-[#d1ecf1]",
    textClass: "text-[#00b4d8]",
    title: "Lección aprendida aprobada",
    subtitle: "Mejora en gestión de inventario",
    time: "Hace 5 horas",
  },
];

const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
  green: { bg: "bg-[#d4edda]", text: "text-[#00a651]", ring: "ring-[#00a651]/20" },
  blue: { bg: "bg-[#d1ecf1]", text: "text-[#00b4d8]", ring: "ring-[#00b4d8]/20" },
  orange: { bg: "bg-[#fff3cd]", text: "text-[#f7941d]", ring: "ring-[#f7941d]/20" },
  purple: { bg: "bg-[#e2d9f3]", text: "text-[#6610f2]", ring: "ring-[#6610f2]/20" },
  gray: { bg: "bg-[#e9ecef]", text: "text-[#868e96]", ring: "ring-[#868e96]/20" },
  red: { bg: "bg-[#f8d7da]", text: "text-[#dc3545]", ring: "ring-[#dc3545]/20" },
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
            trend={stat.color === "blue" ? { value: 12, isPositive: true } : undefined}
            color={stat.color}
          />
        ))}
      </div>

      {/* Row 1: Artículos Recientes + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Artículos Recientes (2/3) */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader className="p-4 sm:p-6 border-b border-[#dee2e6] flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base sm:text-lg">Artículos Recientes</CardTitle>
              <Link href="/dashboard/repository">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <div className="divide-y divide-[#dee2e6]">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/dashboard/repository/${article.id}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-[#f8f9fa] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#212529] text-sm truncate">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="default" size="sm">{article.category}</Badge>
                      <span className="text-xs text-[#adb5bd]">• {article.author}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm text-[#868e96] flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <Icon.Eye className="w-4 h-4" />
                      {article.views}
                    </span>
                    <span className="text-xs whitespace-nowrap">{article.updatedAt}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card padding="none" className="mt-4 sm:mt-6">
            <CardHeader className="p-4 sm:p-6 border-b border-[#dee2e6]">
              <CardTitle className="text-base sm:text-lg">Actividad Reciente</CardTitle>
            </CardHeader>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                    <div className={`w-9 h-9 ${activity.bgClass} rounded-full flex items-center justify-center ${activity.textClass} flex-shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#212529] text-sm leading-tight">{activity.title}</p>
                      <p className="text-xs text-[#868e96] mt-0.5">{activity.subtitle}</p>
                      <p className="text-xs text-[#adb5bd] mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar (1/3) */}
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

          {/* Top Experts */}
          <Card padding="none">
            <CardHeader className="p-4 border-b border-[#dee2e6] flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Expertos Destacados</CardTitle>
              <Link href="/dashboard/experts">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <div className="p-4 space-y-3">
              {topExperts.map((expert, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar name={expert.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#212529] text-sm truncate">{expert.name}</p>
                    <p className="text-xs text-[#868e96] truncate">{expert.area}</p>
                  </div>
                  <Badge variant="info" size="sm">{expert.articles}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Categories */}
          <Card padding="none">
            <CardHeader className="p-4 border-b border-[#dee2e6]">
              <CardTitle className="text-base">Categorías</CardTitle>
            </CardHeader>
            <div className="p-4 space-y-1">
              {categories.map((cat) => {
                const c = colorClasses[cat.color];
                return (
                  <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`${c.text} flex-shrink-0`}>{cat.icon}</span>
                      <span className="text-sm text-[#495057] truncate">{cat.name}</span>
                    </div>
                    <Badge variant="default" size="sm">{cat.count}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
