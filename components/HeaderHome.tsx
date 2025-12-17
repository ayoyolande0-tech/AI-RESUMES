// src/components/Header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-orange-600">HIREAFRICA</h1>
          </Link>
          <span className="text-gray-700">AI Resume Builder</span>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Bonjour, {user.full_name || user.email}</span>
            <Button onClick={logout} variant="outline" size="sm">
              Déconnexion
            </Button>
          </div>
        ) : (
          <Link href="/signin">
            <Button variant="outline" size="sm">Se connecter</Button>
          </Link>
        )}
      </div>
    </header>
  );
}