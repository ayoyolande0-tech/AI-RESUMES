"use client";

interface Experience {
  job_title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
}

interface ResumeFormProps {
  data: any;
  setData: (data: any) => void;
}

export default function ResumeForm({ data, setData }: ResumeFormProps) {
  const handleAddExperience = () => {
    setData({
      ...data,
      experiences: [...data.experiences, { job_title: "", company: "", start_date: "", end_date: "", description: "" }]
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Nom complet"
        value={data.full_name}
        onChange={(e) => setData({ ...data, full_name: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Téléphone"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        className="border p-2 rounded"
      />

      <button
        onClick={handleAddExperience}
        className="bg-gray-400 text-white px-3 py-1 rounded w-max"
      >
        Ajouter une expérience
      </button>

      {data.experiences.map((exp: Experience, idx: number) => (
        <div key={idx} className="border p-2 rounded flex flex-col gap-2">
          <input
            type="text"
            placeholder="Poste"
            value={exp.job_title}
            onChange={(e) => {
              const newExps = [...data.experiences];
              newExps[idx].job_title = e.target.value;
              setData({ ...data, experiences: newExps });
            }}
            className="border p-1 rounded"
          />
          <input
            type="text"
            placeholder="Entreprise"
            value={exp.company}
            onChange={(e) => {
              const newExps = [...data.experiences];
              newExps[idx].company = e.target.value;
              setData({ ...data, experiences: newExps });
            }}
            className="border p-1 rounded"
          />
          <textarea
            placeholder="Description"
            value={exp.description}
            onChange={(e) => {
              const newExps = [...data.experiences];
              newExps[idx].description = e.target.value;
              setData({ ...data, experiences: newExps });
            }}
            className="border p-1 rounded"
          />
        </div>
      ))}
    </div>
  );
}
