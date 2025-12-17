// src/app/layout.tsx
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";  // ❌ cause erreur Turbopack
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

// Utilisation d'une police standard pour éviter l'erreur
const geistSans = {
  variable: "--font-geist-sans",
  fontFamily: "Arial, sans-serif",
};

// Si tu veux vraiment Geist Mono plus tard, tu peux le charger via <link> dans le head
// ou attendre que le support Turbopack soit stable.

export const metadata: Metadata = {
  title: "HireAfrica AI Resume Builder",
  description: "Build professional CVs with AI for African job seekers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
