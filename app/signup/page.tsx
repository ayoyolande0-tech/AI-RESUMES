// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function SignUpPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    linkedInProfile: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  try {
    await register(form);
    await login({ email: form.email, password: form.password });

    const pendingTemplate = localStorage.getItem("pendingTemplate") || "modern";
    localStorage.removeItem("pendingTemplate");

    router.push(`/builder?template=${pendingTemplate}`);
    toast.success("Compte créé ! Redirection...");
  } catch (err: any) {
    setError(err.message);
  }
};

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Même header */}
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

      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Créer un compte</h2>

          {error && (
            <p className="text-red-600 text-center mb-6 font-medium">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="full_name"
              placeholder="Nom complet"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              name="linkedInProfile"
              placeholder="Profil LinkedIn (optionnel)"
              value={form.linkedInProfile}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3.5 text-lg font-medium rounded-lg hover:bg-gray-800 transition"
            >
              S'inscrire
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Déjà inscrit ?{" "}
            <Link href="/signin" className="font-semibold text-orange-600 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function login(arg0: { email: string; password: string; }) {
  throw new Error("Function not implemented.");
}
