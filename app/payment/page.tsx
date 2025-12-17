// src/app/payment/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import HeaderHome from "@/components/HeaderHome";


const plans = {
  daily: { name: "Journalier", price: 500, desc: "Accès 24h illimité", recommended: false },
  monthly: { name: "Mensuel", price: 3000, desc: "Meilleur rapport qualité/prix", recommended: true },
  annual: { name: "Annuel", price: 25000, desc: "Économise 30% • Meilleure offre", recommended: false },
};

export default function PaymentPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<"daily" | "monthly" | "annual">("monthly");
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const handlePayment = async () => {
    if (!user?.email) return alert("Connecte-toi d'abord");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_xaf: plans[selected].price,
          email: user.email,
          phone: user.linkedInProfile || "",
        }),
      });

      const data = await res.json();
      if (data.success && data.payment_url) {
        setPaymentUrl(data.payment_url);
        setModalOpen(true);
      } else {
        alert("Erreur lors du paiement");
      }
    } catch {
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <HeaderHome></HeaderHome>
      <div className="min-h-screen bg-gradient-to-br from-white-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Abonnement Premium
            </h1>
            <p className="mt-4 text-xl text-gray-600">Paiement sécurisé en FCFA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setSelected(key as any)}
                className={`relative rounded-3xl p-8 cursor-pointer transition-all duration-300 bg-white shadow-xl hover:shadow-2xl border-2
                  ${selected === key ? "ring-4 ring-orange-400 scale-105 border-orange-500" : "border-gray-200"}
                  ${plan.recommended ? "border-orange-500" : ""}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">
                    Recommandé
                  </div>
                )}

                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-extrabold text-orange-600">{plan.price.toLocaleString()}</span>
                      <span className="ml-2 text-2xl font-medium text-gray-700">FCFA</span>
                    </div>
                    {key !== "daily" && (
                      <span className="text-lg text-gray-500 mt-1">
                        /{key === "monthly" ? "mois" : "an"}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 font-medium">{plan.desc}</p>

                
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="bg-orange-600 hover:bg-dark-700 text-white px-16 py-7 text-xl font-bold rounded-2xl shadow-2xl transition-all hover:scale-105"
            >
              {loading ? "Préparation..." : `Payer ${plans[selected].price.toLocaleString()} FCFA`}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold">Finaliser le paiement</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 space-y-6">
            <p className="text-gray-700">Clique sur le bouton pour ouvrir la page de paiement sécurisée.</p>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-105"
            >
              Ouvrir le paiement
              <ExternalLink className="w-5 h-5" />
            </a>
            
            
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}