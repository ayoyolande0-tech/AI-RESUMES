

export default function ModernTemplate({ data }: { data: any }) {
  return (
    <div className="max-w-4xl mx-auto p-16 font-sans text-sm leading-relaxed">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold">{data.full_name}</h1>
        <p className="text-gray-600 mt-2">{data.email}</p>
        <p className="text-gray-800 text-lg font-semibold">{data.phone}</p>
      </header>

      <hr className="border-t-4 border-black mb-10" />

      <section className="mb-10">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Expériences professionnelles</h2>
        {(data.enhanced_experiences || data.experiences).map((exp: any, i: number) => (
          <div key={i} className="mb-6">
            <div className="flex justify-between">
              <strong>{exp.job_title} — {exp.company}</strong>
              <span className="text-gray-600">{exp.start_date} - {exp.end_date || "Présent"}</span>
            </div>
            <p className="mt-2 text-gray-800">{exp.description}</p>
          </div>
        ))}
      </section>

      {data.education?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Formation</h2>
          {data.education.map((edu: any, i: number) => (
            <div key={i} className="mb-4">
              <strong>{edu.diplome}</strong>
              <p className="text-gray-600">{edu.etablissement}</p>
            </div>
          ))}
        </section>
      )}

      {data.languages?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Langues</h2>
          {data.languages.map((l: any, i: number) => (
            <p key={i}>{l.name} — Niveau {l.level}</p>
          ))}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Compétences</h2>
          <div className="flex flex-wrap gap-3">
            {data.skills.filter(Boolean).map((s: string, i: number) => (
              <span key={i} className="bg-gray-200 px-5 py-2 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </section>
      )}

      <div className="text-center text-gray-500 text-xs mt-20 italic">
        AI RESUME BUILDER - Version gratuite
      </div>
    </div>
  );
}