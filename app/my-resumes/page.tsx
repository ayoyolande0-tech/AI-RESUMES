"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/HeaderHome";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, Edit3, Trash2, Plus } from "lucide-react";

interface Resume {
  id: number;
  title: string;
  template: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string;
  job_title?: string;
  company?: string;
  total_experiences: number;
  skills_count: number;
}

export default function MyResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/signin");
      return;
    }

    fetch("http://localhost:8000/resume/api/my-resumes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setResumes(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erreur de chargement des CVs");
        setLoading(false);
      });
  }, [token, router]);

  const deleteResume = async (id: number) => {
    if (!confirm("Supprimer ce CV définitivement ?")) return;

    const res = await fetch(`http://localhost:8000/resume/api/resume/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success("CV supprimé");
    } else {
      toast.error("Erreur suppression");
    }
  };

  const downloadPdf = (id: number) => {
    window.open(`http://localhost:8000/resume/api/resume/${id}/pdf`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Chargement de vos CVs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900">Mes CVs</h1>
          <Button
            onClick={() => router.push("/tempo")}
            className="bg-orange-600 hover:bg-orange-700 py-6 px-10 text-xl font-semibold"
          >
            <Plus className="w-6 h-6 mr-3" />
            Nouveau CV
          </Button>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl">
            <FileText className="w-32 h-32 mx-auto mb-8 text-orange-200" />
            <p className="text-3xl font-bold text-gray-700 mb-8">Aucun CV sauvegardé</p>
            <Button
              onClick={() => router.push("/builder")}
              className="bg-black hover:bg-gray-900 text-white px-12 py-8 text-xl"
            >
              Créer mon premier CV HireAfrica
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resumes.map((cv) => (
              <div
                key={cv.id}
                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="h-3 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{cv.full_name}</h3>
                      {cv.job_title && (
                        <p className="text-lg font-semibold text-orange-600 mt-1">
                          {cv.job_title} • {cv.company}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {cv.template.charAt(0).toUpperCase() + cv.template.slice(1)} •{" "}
                        • {new Date(cv.updated_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteResume(cv.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-8">
                    <p>{cv.total_experiences} expérience{cv.total_experiences > 1 ? "s" : ""}</p>
                    <p>{cv.skills_count} compétence{cv.skills_count > 1 ? "s" : ""}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push(`/builder?edit=${cv.id}`)}
                      className="flex-1 bg-black hover:bg-gray-900"
                    >
                      <Edit3 className="w-5 h-5 mr-2" />
                      Éditer
                    </Button>

                    <Button
                      onClick={() => downloadPdf(cv.id)}
                      variant="outline"
                      className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}