"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Header from "@/components/HeaderHome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type Template = "modern" | "minimalistic" | "professional";

export default function Builder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const template = (searchParams.get("template") as Template) || "modern";

  // Redirection si pas connecté
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem("pendingTemplate", template);
      router.push("/signin");
    }
  }, [user, authLoading, router, template]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl">Vérification de la connexion...</p>
      </div>
    );
  }

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    experiences: [{ job_title: "", company: "", start_date: "", end_date: "", description: "" }],
    education: [{ etablissement: "", diplome: "", start_date: "", end_date: "" }],
    projects: [{ description: "", annee: "" }],
    certifications: [{ name: "", issuer: "", year: "" }],
    activities: [{ name: "", description: "" }],
    languages: [{ name: "", level: "" }],
    skills: [""],
  });

  const [enhanced, setEnhanced] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const enhance = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/resume/api/enhance-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, template }),
      });
      const data = await res.json();
      if (data.success) {
        setEnhanced({ ...form, enhanced_experiences: data.enhanced_experiences });
        toast.success("Expériences améliorées !");
      }
    } catch {
      toast.error("Erreur IA");
    }
    setLoading(false);
  };

  const download = async () => {
    const payload = enhanced ? { ...form, enhanced_experiences: enhanced.enhanced_experiences } : form;
    const res = await fetch("http://localhost:8000/resume/api/generate-pdf", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.full_name || "CV"}_HireAfrica_${template}.pdf`;
      a.click();
      toast.success("PDF téléchargé !");
    }
  };

  const addItem = (key: keyof typeof form) => {
    setForm({
      ...form,
      [key]: [...form[key], 
        key === "skills" ? "" : 
        key === "languages" ? { name: "", level: "" } :
        key === "experiences" ? { job_title: "", company: "", start_date: "", end_date: "", description: "" } :
        key === "education" ? { etablissement: "", diplome: "", start_date: "", end_date: "" } :
        key === "projects" ? { description: "", annee: "" } :
        key === "certifications" ? { name: "", issuer: "", year: "" } :
        { name: "", description: "" }
      ]
    });
  };

  const removeItem = (key: keyof typeof form, index: number) => {
    if ((form[key] as any[]).length === 1) return toast.error("Au moins un élément requis");
    setForm({ ...form, [key]: (form[key] as any[]).filter((_, i) => i !== index) });
  };

  const data = enhanced || form;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-2 gap-10">
        {/* FORMULAIRE À GAUCHE */}
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-8 overflow-y-auto max-h-screen">
          <h2 className="text-2xl font-bold">Remplis ton CV ({template})</h2>

          <Input placeholder="Nom complet" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

          {/* EXPÉRIENCES */}
          <div>
            <Label>Expériences professionnelles</Label>
            {form.experiences.map((exp, i) => (
              <div key={i} className="mt-4 p-4 border rounded space-y-3">
                <Input placeholder="Poste" value={exp.job_title} onChange={e => {
                  const exps = [...form.experiences]; exps[i].job_title = e.target.value; setForm({ ...form, experiences: exps });
                }} />
                <Input placeholder="Entreprise" value={exp.company} onChange={e => {
                  const exps = [...form.experiences]; exps[i].company = e.target.value; setForm({ ...form, experiences: exps });
                }} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Début (ex: 2023)" value={exp.start_date} onChange={e => {
                    const exps = [...form.experiences]; exps[i].start_date = e.target.value; setForm({ ...form, experiences: exps });
                  }} />
                  <Input placeholder="Fin (vide = actuel)" value={exp.end_date} onChange={e => {
                    const exps = [...form.experiences]; exps[i].end_date = e.target.value; setForm({ ...form, experiences: exps });
                  }} />
                </div>
                <Textarea placeholder="Décris ce que tu as fait..." value={exp.description} onChange={e => {
                  const exps = [...form.experiences]; exps[i].description = e.target.value; setForm({ ...form, experiences: exps });
                }} />
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => addItem("experiences")}><Plus className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeItem("experiences", i)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
              </div>
              
            ))}
          </div>

          {/* ÉDUCATION */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Formation</Label>
            </div>
            {form.education.map((edu, i) => (
              <div key={i} className="p-4 border rounded mb-4 space-y-3">
                <Input placeholder="Établissement" value={edu.etablissement} onChange={e => {
                  const eds = [...form.education]; eds[i].etablissement = e.target.value; setForm({...form, education: eds});
                }} />
                <Input placeholder="Diplôme" value={edu.diplome} onChange={e => {
                  const eds = [...form.education]; eds[i].diplome = e.target.value; setForm({...form, education: eds});
                }} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Début" value={edu.start_date} onChange={e => {
                    const eds = [...form.education]; eds[i].start_date = e.target.value; setForm({...form, education: eds});
                  }} />
                  <Input placeholder="Fin" value={edu.end_date} onChange={e => {
                    const eds = [...form.education]; eds[i].end_date = e.target.value; setForm({...form, education: eds});
                  }} />
                  <div className="flex justify-end">
                  <Button size="sm" onClick={() => addItem("education")}><Plus className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="float-left" onClick={() => removeItem("education", i)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
                </div>
              </div>
            ))}
          </div>

          {/* PROJETS */}
          {(template === "minimalistic" || template === "professional") && (
            <div>
              <Label>Projets</Label>
              {form.projects.map((p, i) => (
                <div key={i} className="mt-4 space-y-3">
                  <Textarea placeholder="Description du projet" value={p.description} onChange={e => {
                    const ps = [...form.projects]; ps[i].description = e.target.value; setForm({ ...form, projects: ps });
                  }} />
                  <Input placeholder="Année (ex: 2023)" value={p.annee} onChange={e => {
                    const ps = [...form.projects]; ps[i].annee = e.target.value; setForm({ ...form, projects: ps });
                  }} />
                  <div className="flex justify-end">
                  <Button size="sm" onClick={() => addItem("projects")}><Plus className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeItem("projects", i)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
                </div>
              ))}
            </div>
          )}

          {/* CERTIFICATIONS */}
          {(template === "minimalistic" || template === "professional") && (
            <div>
              <Label>Certifications</Label>
              {form.certifications.map((c, i) => (
                <div key={i} className="mt-4 space-y-3">
                  <Input placeholder="Nom de la certification" value={c.name} onChange={e => {
                    const cs = [...form.certifications]; cs[i].name = e.target.value; setForm({ ...form, certifications: cs });
                  }} />
                  <Input placeholder="Organisme (optionnel)" value={c.issuer} onChange={e => {
                    const cs = [...form.certifications]; cs[i].issuer = e.target.value; setForm({ ...form, certifications: cs });
                  }} />
                  <Input placeholder="Année" value={c.year} onChange={e => {
                    const cs = [...form.certifications]; cs[i].year = e.target.value; setForm({ ...form, certifications: cs });
                  }} />
                  <div className="flex justify-end">
                  <Button size="sm" onClick={() => addItem("certifications")}><Plus className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeItem("certifications", i)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVITÉS (uniquement minimalistic) */}
          {template === "minimalistic" && (
            <div>
              <Label>Activités extrascolaires</Label>
              {form.activities.map((a, i) => (
                <div key={i} className="mt-4 space-y-3">
                  <Input placeholder="Nom de l'activité" value={a.name} onChange={e => {
                    const acts = [...form.activities]; acts[i].name = e.target.value; setForm({ ...form, activities: acts });
                  }} />
                  <Textarea placeholder="Description (optionnel)" value={a.description} onChange={e => {
                    const acts = [...form.activities]; acts[i].description = e.target.value; setForm({ ...form, activities: acts });
                  }} />
                  <div className="flex justify-end">
                  <Button size="sm" onClick={() => addItem("activities")}><Plus className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeItem("activities", i)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
                </div>
              ))}
            </div>
          )}

          {/* LANGUES & COMPÉTENCES (tous les templates) */}
          <div>
            <Label>Langues</Label>
            {form.languages.map((l, i) => (
              <div key={i} className="flex gap-3 mt-3">
                <Input placeholder="Langue" value={l.name} onChange={e => {
                  const langs = [...form.languages]; langs[i].name = e.target.value; setForm({ ...form, languages: langs });
                }} />
                <Input placeholder="Niveau (B1, C2...)" value={l.level} onChange={e => {
                  const langs = [...form.languages]; langs[i].level = e.target.value; setForm({ ...form, languages: langs });
                }} />
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => addItem("languages")}><Plus className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeItem("languages", i)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Compétences</Label>
            </div>
            {form.skills.map((s, i) => (
              <div key={i} className="flex gap-3 mt-3">
                <Input placeholder="Compétence" value={s} onChange={e => {
                  const skills = [...form.skills]; skills[i] = e.target.value; setForm({...form, skills});
                }} />
                <Button size="sm" onClick={() => addItem("skills")}><Plus className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => removeItem("skills", i)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
              </div>
            ))}
          </div>

          <Button onClick={enhance} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 py-6 text-lg">
            {loading ? "Amélioration..." : "Améliorer mes expériences avec l'IA"}
          </Button>
        </div>

        {/* PREVIEW IDENTIQUE AU PDF */}
        <div className="bg-white p-10 rounded-2xl shadow-xl font-sans text-sm">
          <h1 className="text-3xl font-bold text-center">{data.full_name || "Ton nom"}</h1>
          <p className="text-center text-gray-600">{data.email} • {data.phone}</p>
          <hr className="my-6 border-t-2 border-gray-800" />

          <h2 className="text-xl font-bold mt-8">Expériences professionnelles</h2>
          {(data.enhanced_experiences || data.experiences).map((exp: any, i: number) => (
            <div key={i} className="mt-6">
              <div className="flex justify-between">
                <p className="font-semibold">{exp.job_title} — {exp.company}</p>
                <p className="text-gray-600">{exp.start_date} - {exp.end_date || "Présent"}</p>
              </div>
              <p className="mt-2">{exp.description}</p>
            </div>
          ))}

          {data.education.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-10">Formation</h2>
              {data.education.map((edu: any, i: number) => (
                <div key={i} className="mt-4">
                  <p className="font-semibold">{edu.diplome}</p>
                  <p className="text-gray-600">{edu.etablissement} • {edu.start_date} - {edu.end_date}</p>
                </div>
              ))}
            </>
          )}

          {data.projects.length > 0 && (template === "minimalistic" || template === "professional") && (
            <>
              <h2 className="text-xl font-bold mt-10">Projets</h2>
              {data.projects.map((p: any, i: number) => (
                <p key={i} className="mt-3">{p.description} <span className="text-gray-600">({p.annee})</span></p>
              ))}
            </>
          )}

          {data.certifications.length > 0 && (template === "minimalistic" || template === "professional") && (
            <>
              <h2 className="text-xl font-bold mt-10">Certifications</h2>
              {data.certifications.map((c: any, i: number) => (
                <p key={i} className="mt-3">{c.name} {c.issuer && `— ${c.issuer}`} {c.year && <span className="text-gray-600">({c.year})</span>}</p>
              ))}
            </>
          )}

          {data.activities.length > 0 && template === "minimalistic" && (
            <>
              <h2 className="text-xl font-bold mt-10">Activités</h2>
              {data.activities.map((a: any, i: number) => (
                <div key={i} className="mt-3">
                  <p className="font-semibold">{a.name}</p>
                  {a.description && <p>{a.description}</p>}
                </div>
              ))}
            </>
          )}

          {data.languages.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-10">Langues</h2>
              {data.languages.map((l: any, i: number) => (
                <p key={i}>{l.name} — Niveau {l.level}</p>
              ))}
            </>
          )}

          {data.skills.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-10">Compétences</h2>
              <div className="flex flex-wrap gap-3 mt-4">
                {data.skills.filter((s: string) => s).map((s: string, i: number) => (
                  <span key={i} className="bg-gray-200 px-4 py-2 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </>
          )}

          
        <div className="flex gap-4 mt-8">
        <Button 
            onClick={async () => {
            const payload: any = { ...form, template };
            if (enhanced) payload.enhanced_experiences = enhanced.enhanced_experiences;

            const res = await fetch("http://localhost:8000/resume/api/save-resume", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success("CV sauvegardé avec succès !");
                router.push("/my-resumes");
            } else {
                toast.error("Erreur sauvegarde");
            }
            }} 
            className="flex-1 bg-green-600 hover:bg-green-700 py-6 text-xl font-bold"
        >
            Sauvegarder mon CV
        </Button>

        <Button onClick={download} size="lg" className="flex-1 bg-black text-white py-6 text-xl font-bold">
            Télécharger PDF
        </Button>
        </div>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
            <Button onClick={download} size="lg" className="bg-black text-white px-12 py-6 text-lg">
              Télécharger PDF
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-20">AI RESUME BUILDER - Version gratuite</p>
        </div>
      </div>
    </div>
  );
}