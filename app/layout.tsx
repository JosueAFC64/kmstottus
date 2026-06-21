/**
 * Root Layout
 * Estructura HTML base de toda la aplicación
 * Envuelve con AuthProvider para tener acceso a la sesión en cualquier parte
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/use-auth";
import { getSession } from "@/lib/services/auth.service";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KMS Papa Johns Perú - Sistema de Gestión del Conocimiento",
  description: "Centro de conocimiento organizacional para Papa Johns Perú.",
  icons: {
    icon: "/papajohns.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}