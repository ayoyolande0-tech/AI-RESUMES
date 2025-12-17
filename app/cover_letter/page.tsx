// src/app/cover_letter/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/HeaderHome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CoverLetter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    job_title: "",
    company: "",
  });

  const [generatedText, setGeneratedText] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.linkedInProfile || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl">Connexion...</div>;
  }

  const generatePreview = async () => {
    if (!form.job_title || !form.company) {
      toast.error("Remplis le poste et l'entreprise");
      return;
    }

    setGenerating(true);
    setGeneratedText("");

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token manquant");
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/ai-generation/api/generate-cover-letter-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          job_title: form.job_title,
          company: form.company,
          experiences: JSON.parse(localStorage.getItem("lastResume") || "{}").experiences || [],
          skills: JSON.parse(localStorage.getItem("lastResume") || "{}").skills || []
        }),
      });

      if (res.ok) {
        const { text } = await res.json();
        setGeneratedText(text);
        toast.success("Aperçu généré !");
      } else {
        toast.error("Erreur génération");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setGenerating(false);
  };

  const downloadPDF = async () => {
    if (!generatedText) {
      toast.error("Génère l'aperçu d'abord");
      return;
    }

    setGenerating(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token manquant");
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/ai-generation/api/generate-cover-letter-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          job_title: form.job_title,
          company: form.company,
          experiences: JSON.parse(localStorage.getItem("lastResume") || "{}").experiences || [],
          skills: JSON.parse(localStorage.getItem("lastResume") || "{}").skills || []
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Lettre_Motivation_${form.full_name.replace(/\s+/g, "_")}_${form.company}.pdf`;
        a.click();
        toast.success("PDF téléchargé !");
      } else {
        toast.error("Erreur PDF");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Génère ta lettre de motivation parfaite
        </h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div className="bg-white p-10 rounded-2xl shadow-2xl space-y-8">
            <Input placeholder="Nom complet" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Poste visé" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} />
            <Input placeholder="Entreprise" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />

            <div className="flex gap-4">
              <Button
                onClick={generatePreview}
                disabled={generating}
                className="flex-1 bg-orange-600 hover:bg-orange-700 py-8 text-xl font-bold shadow-lg"
              >
                {generating ? "Génération..." : "Générer Aperçu"}
              </Button>
              <Button
                onClick={downloadPDF}
                disabled={generating || !generatedText}
                className="flex-1 bg-green-600 hover:bg-green-700 py-8 text-xl font-bold shadow-lg"
              >
                Télécharger PDF
              </Button>
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-white p-16 rounded-2xl shadow-2xl font-serif text-sm leading-relaxed border overflow-y-auto max-h-screen">
            <div className="text-left mb-16">
              <p className="font-bold text-lg">{form.full_name || "Ton nom"}</p>
              <p>{form.email || "email"}</p>
              <p>{form.phone || "téléphone"}</p>
            </div>

            <div className="text-right mb-12">
              <p className="font-bold text-lg">{form.company || "Entreprise"}</p>
              <p>À l'attention du Responsable Recrutement</p>
            </div>

          
            <p className="text-center font-bold text-lg mb-12">
              Objet : {form.job_title || "Poste visé"}
            </p>

            {generatedText ? (
              <div className="text-justify space-y-5" dangerouslySetInnerHTML={{ __html: generatedText.replace(/\n/g, "<br />") }} />
            ) : (
              <p className="italic text-gray-500 text-center">
                Clique "Générer Aperçu" pour voir la lettre personnalisée.
              </p>
            )}

          

            <p className="text-center text-xs text-gray-500 mt-24">
              AI RESUME BUILDER
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}