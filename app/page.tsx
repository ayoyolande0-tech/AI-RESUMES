
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/HeaderHome";
import TemplatePreview from "@/components/TemplatePreview";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FileText, ScanSearch, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const [selected, setSelected] = useState<"modern" | "minimalistic" | "professional" | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) localStorage.removeItem("pendingTemplate");
  }, [user, loading]);

  const handleContinue = () => {
    if (!selected) return;
    if (!user) {
      localStorage.setItem("pendingTemplate", selected);
      router.push("/signup");
    } else {
      router.push(`/builder?template=${selected}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Ton CV parfait<br />
            <span className="text-orange-600">en 3 minutes seulement</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            ATS-friendly • Lettre de motivation incluse • Conçu pour l'Afrique
          </p>

          {/* Templates Grid */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-10">Choisis ton style</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <TemplatePreview
                template="modern"
                selected={selected === "modern"}
                onClick={() => setSelected("modern")}
              />
              <TemplatePreview
                template="minimalistic"
                selected={selected === "minimalistic"}
                onClick={() => setSelected("minimalistic")}
              />
              <TemplatePreview
                template="professional"
                selected={selected === "professional"}
                onClick={() => setSelected("professional")}
              />
            </div>
          </div>

          <Button
            size="lg"
            disabled={!selected}
            onClick={handleContinue}
            className="mt-12 bg-orange-600 hover:bg-orange-700 text-white px-12 py-7 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all"
          >
            {user ? "Créer mon CV maintenant" : "Commencer gratuitement"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features – Connecté */}
      {user && (
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4">
              Bon retour, {user.full_name?.split(" ")[0] || "Champion"} ! 
            </h2>
            <p className="text-center text-gray-600 mb-12">Tout ce dont tu as besoin est ici</p>

            <div className="grid md:grid-cols-3 gap-8">
              <Link href="/cover_letter" className="group">
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                    <FileText className="w-9 h-9 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Lettre de motivation IA</h3>
                  <p className="text-gray-600">Générée en 10 secondes, adaptée à l'offre</p>
                </div>
              </Link>

              <Link href="/ats_scan" className="group">
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                    <ScanSearch className="w-9 h-9 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Scan ATS gratuit</h3>
                  <p className="text-gray-600">Score + conseils pour passer les robots</p>
                </div>
              </Link>

             
              <Link href="/payment" className="group">
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                  <div className="w-16 h-16 bg-orange-200 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                    <Sparkles className="w-9 h-9 text-orange-700" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-orange-700">Abonnement Premium</h3>
                  <p className="text-gray-700">Accès illimité . Dès 500 FCFA/jour</p>
                  <p className="text-sm text-orange-600 font-semibold mt-3">Choisir mon plan →</p>
                </div>
              </Link>

            <Link href="/my-resumes" className="group">
              <div className="group opacity-70">
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
                    <Sparkles className="w-9 h-9 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mes CVs</h3>
                  <p className="text-gray-500 text-sm">Bientôt disponible</p>
                </div>
              </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA – Non connecté */}
      {!user && (
        <section className="py-20 bg-orange-50">
          <div className="max-w-4xl mx-auto text-center px-6">
            <p className="text-3xl font-bold text-gray-800 mb-4">
              +10 000 candidats africains nous font confiance
            </p>
            <p className="text-xl text-gray-600 mb-10">
              Rejoins-les dès maintenant, c'est gratuit !
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-14 py-8 text-xl font-bold rounded-xl">
                Créer mon compte gratuit
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}