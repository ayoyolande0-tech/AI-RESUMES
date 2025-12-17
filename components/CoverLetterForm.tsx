"use client";

interface CoverLetterFormProps {
  data: any;
  setData: (data: any) => void;
}

export default function CoverLetterForm({ data, setData }: CoverLetterFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Poste"
        value={data.job_title}
        onChange={(e) => setData({ ...data, job_title: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Entreprise"
        value={data.company}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        className="border p-2 rounded"
      />
      <textarea
        placeholder="Expériences principales"
        value={data.experiences}
        onChange={(e) => setData({ ...data, experiences: e.target.value })}
        className="border p-2 rounded"
      />
      <textarea
        placeholder="Compétences clés"
        value={data.skills}
        onChange={(e) => setData({ ...data, skills: e.target.value })}
        className="border p-2 rounded"
      />
    </div>
  );
}
