// src/app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function SignInPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  try {
    const response = await login(form);

    console.log("TOKEN REÇU → COPIE ÇA DANS SWAGGER :", response.access_token);
    toast.success("Connexion réussie !");

    const pendingTemplate = localStorage.getItem("pendingTemplate");
    localStorage.removeItem("pendingTemplate");

    if (pendingTemplate) {
      router.push(`/builder?template=${pendingTemplate}`);
    } else {
      router.push("/"); 
    }
  } catch (err: any) {
    setError(err.message || "Erreur de connexion");
    toast.error("Échec connexion");
  }
};

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-orange-600">HIREAFRICA</h1>
            </Link>
            <span className="text-gray-700">AI Resume Builder</span>
          </div>
          
        </div>
      </header>

      {/* Formulaire centré */}
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Sign into your account</h2>

          {error && (
            <p className="text-red-600 text-center mb-6 font-medium">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="votre.email@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="Votre mot de passe"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3.5 text-lg font-medium rounded-lg hover:bg-gray-800 transition"
            >
              Se connecter
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-semibold text-orange-600 hover:underline">
              Inscrivez-vous ici
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}