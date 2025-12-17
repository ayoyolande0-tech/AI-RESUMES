

export default function ProfessionalTemplate({ data }: { data: any }) {
  return (
    <div className="max-w-4xl mx-auto p-16 font-sans text-sm grid grid-cols-3 gap-10">
      <aside className="space-y-8">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto" />
        
        <div>
          <h3 className="font-bold text-lg mb-2">Contact</h3>
          <p>{data.email}</p>
          <p>{data.phone}</p>
        </div>

        {data.languages?.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-2">Langues</h3>
            {data.languages.map((l: any, i: number) => (
              <p key={i}>• {l.name} ({l.level})</p>
            ))}
          </div>
        )}

        {data.skills?.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-2">Compétences</h3>
            {data.skills.filter(Boolean).map((s: string, i: number) => (
              <p key={i}>• {s}</p>
            ))}
          </div>
        )}
      </aside>

      <main className="col-span-2 space-y-10">
        <header>
          <h1 className="text-4xl font-bold">{data.full_name}</h1>
        </header>

        <section>
          <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-4">Expériences professionnelles</h2>
          {(data.enhanced_experiences || data.experiences).map((exp: any, i: number) => (
            <div key={i} className="mb-6">
              <div className="flex justify-between">
                <strong className="text-lg">{exp.job_title} chez {exp.company}</strong>
                <span>{exp.start_date} - {exp.end_date || "Présent"}</span>
              </div>
              <p className="mt-2 text-gray-700">{exp.description}</p>
            </div>
          ))}
        </section>

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-4">Formation</h2>
            {data.education.map((edu: any, i: number) => (
              <div key={i} className="mb-4">
                <strong>{edu.diplome}</strong> — {edu.etablissement}
              </div>
            ))}
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-4">Projets</h2>
            {data.projects.map((p: any, i: number) => (
              <p key={i}>• {p.description} ({p.annee})</p>
            ))}
          </section>
        )}

        {data.certifications?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-4">Certifications</h2>
            {data.certifications.map((c: any, i: number) => (
              <p key={i}>• {c.name} {c.issuer && `— ${c.issuer}`} {c.year && `(${c.year})`}</p>
            ))}
          </section>
        )}
      </main>

      <div className="col-span-3 text-center text-gray-500 text-xs mt-20 italic">
        AI RESUME BUILDER - Version gratuite
      </div>
    </div>
  );
}