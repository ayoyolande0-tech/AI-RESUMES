"use client";

import { useRouter } from "next/navigation";
import { FaFileAlt, FaEnvelope, FaUser, FaChartLine, FaHome } from "react-icons/fa";

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-white shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">HireAfrica Dashboard</h2>
      <nav className="flex flex-col gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <FaHome /> Accueil
        </button>
        <button
          onClick={() => router.push("/dashboard/cv")}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <FaFileAlt /> Liste de CV
        </button>
        <button
          onClick={() => router.push("/dashboard/cover_letter")}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <FaEnvelope /> Lettres de motivation
        </button>
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <FaUser /> Profil
        </button>
        <button
          onClick={() => router.push("/dashboard/ats")}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <FaChartLine /> ATS Scan
        </button>
      </nav>
    </aside>
  );
}
