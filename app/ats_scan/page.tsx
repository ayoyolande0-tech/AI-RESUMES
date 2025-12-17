// src/app/ats_scan/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/HeaderHome";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface SavedCV {
  id: string;
  name: string;
  template: string;
  created_at: string;
  data: any;
}

interface ATSResult {
  score: number;
  missing_keywords: string[];
  suggestions: string[];
}

export default function ATSScan() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [selectedCV, setSelectedCV] = useState<SavedCV | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/signin");
  }, [user, loading, router]);

  // Charger les CV sauvegardés (localStorage pour MVP)
  useEffect(() => {
    const cvs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("saved_cv_")) {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        cvs.push({
          id: key,
          name: data.full_name || "CV sans nom",
          template: data.template || "modern",
          created_at: data.saved_at || new Date().toISOString(),
          data
        });
      }
    }
    setSavedCVs(cvs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    if (cvs.length > 0 && !selectedCV) setSelectedCV(cvs[0]);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setSelectedCV(null);
      toast.success("CV PDF chargé !");
    } else {
      toast.error("Veuillez uploader un fichier PDF");
    }
  };

  const scanATS = async () => {
    if (!jobDescription.trim()) return toast.error("Colle l'offre d'emploi");
    if (!selectedCV && !uploadedFile) return toast.error("Choisis ou uploade un CV");

    setScanning(true);
    const token = localStorage.getItem("token");

    let cvText = "";

    if (uploadedFile) {
      // Pour MVP : on lit le texte du PDF côté client (limité)
      // En prod : on enverrait le PDF au backend → extraction avec PyPDF2
      toast.info("Extraction du texte en cours...");
      cvText = "Texte extrait du PDF (à implémenter côté backend)";
    } else if (selectedCV) {
      const data = selectedCV.data;
      cvText = `
        ${data.full_name || ""}
        ${data.email || ""} ${data.phone || ""}
        ${data.experiences?.map((e: any) => e.description).join(" ") || ""}
        ${data.skills?.join(" ") || ""}
        ${data.education?.map((e: any) => e.diplome + " " + e.etablissement).join(" ") || ""}
      `.trim();
    }

    try {
      const res = await fetch("http://localhost:8000/ai-generation/api/ats-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_description: jobDescription
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success(`Score ATS : ${data.score}/100`);
      } else {
        toast.error("Erreur scan");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setScanning(false);
  };

  const score = result?.score || 0;
  const getScoreColor = () => score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";

  if (loading || !user) return <div className="min-h-screen flex-center">Connexion...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">ATS Scan Pro</h1>
          <p className="text-xl text-gray-600">Analyse ton CV contre n'importe quelle offre</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* GAUCHE : CHOIX DU CV + OFFRE */}
          <div className="space-y-8">
            {/* CHOISIR UN CV SAUVEGARDÉ */}
            {savedCVs.length > 0 && (
              <div className="bg-white p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Mes CVs sauvegardés</h2>
                <div className="space-y-3">
                  {savedCVs.map(cv => (
                    <button
                      key={cv.id}
                      onClick={() => { setSelectedCV(cv); setUploadedFile(null); }}
                      className={`w-full text-left p-5 rounded-xl border-2 transition ${
                        selectedCV?.id === cv.id ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">{cv.name}</p>
                          <p className="text-sm text-gray-600">Modèle {cv.template} • {new Date(cv.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        {selectedCV?.id === cv.id && <CheckCircle2 className="w-6 h-6 text-orange-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OU UPLOAD PDF */}
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <label className="text-2xl font-bold mb-6 block">
                <Upload className="w-8 h-8 inline mr-3" />
                Importer un CV existant
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
              />
              {uploadedFile && (
                <p className="mt-4 text-green-600 font-medium">
                  <CheckCircle2 className="inline w-5 h-5 mr-2" />
                  {uploadedFile.name} chargé
                </p>
              )}
            </div>

            {/* OFFRE D'EMPLOI */}
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Colle l'offre d'emploi</h2>
              <Textarea
                placeholder="Ex: Nous recherchons un Développeur Full Stack maîtrisant React, Node.js, PostgreSQL..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="min-h-64 text-lg"
              />

              <Button
                onClick={scanATS}
                disabled={scanning || !jobDescription}
                className="w-full mt-8 bg-black hover:bg-gray-800 py-8 text-xl font-bold"
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Scanner mon CV"
                )}
              </Button>
            </div>
          </div>

          {/* DROITE : RÉSULTAT */}
          <div>
            {result ? (
              <div className="space-y-8">
                <div className="bg-white p-12 rounded-3xl shadow-2xl text-center">
                  <h2 className="text-3xl font-bold mb-8">Score ATS</h2>
                  <div className={`text-9xl font-bold ${getScoreColor()}`}>
                    {Math.round(score)}
                  </div>
                  <p className="text-3xl mt-6 font-bold">
                    {score >= 80 ? "Excellent" : score >= 60 ? "Bon" : "À améliorer"}
                  </p>
                </div>

                {result.missing_keywords.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-300 p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold text-red-800 mb-6 flex items-center gap-3">
                      <XCircle className="w-8 h-8" />
                      Mots-clés manquants ({result.missing_keywords.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {result.missing_keywords.slice(0, 10).map((kw, i) => (
                        <span key={i} className="bg-red-200 text-red-800 px-5 py-3 rounded-full font-bold">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-300 p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold text-blue-800 mb-6">
                      Suggestions IA
                    </h3>
                    <ul className="space-y-4">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg">
                          <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => router.push("/builder")}
                  className="w-full bg-orange-600 hover:bg-orange-700 py-8 text-xl font-bold"
                >
                  Améliorer ce CV maintenant
                </Button>
              </div>
            ) : (
              <div className="bg-white p-20 rounded-3xl shadow-2xl text-center text-gray-500">
                <FileText className="w-32 h-32 mx-auto mb-8 text-gray-300" />
                <p className="text-3xl font-bold">Prêt à scanner ?</p>
                <p className="text-xl mt-4">Choisis un CV + colle l'offre → résultat instantané</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}