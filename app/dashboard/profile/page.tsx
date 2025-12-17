"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const ProfilePage: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && user) {
      setProfileData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.linkedInProfile|| "",
      });
    }
  }, [user, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/user/api/update-profile", profileData);
      setMessage("Profil mis à jour !");
    } catch (err: any) {
      setMessage(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>
      )}

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nom complet"
          value={profileData.full_name}
          onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={profileData.email}
          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Téléphone"
          value={profileData.phone}
          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
          className="border p-2 rounded"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
