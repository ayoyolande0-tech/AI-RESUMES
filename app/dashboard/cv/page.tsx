"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function CVPage() {
  const { user, loading } = useAuth();
  const [cvs, setCvs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && user) fetchCVs();
  }, [user, loading]);

  const fetchCVs = async () => {
    setLoadingData(true);
    try {
      const res = await axios.get(`/resume/api/list?email=${user?.email}`);
      setCvs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mes CV</h1>

      {loadingData ? (
        <p>Chargement des CV...</p>
      ) : (
        <ul className="space-y-2">
          {cvs.map((cv, idx) => (
            <li key={idx} className="p-2 border rounded flex justify-between items-center">
              <span>{cv.title || `CV #${idx + 1}`}</span>
              <a
                href={cv.download_url}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Télécharger / Prévisualiser
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
