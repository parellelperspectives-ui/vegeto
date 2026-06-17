import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("vegeto_disclaimer_accepted");
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("vegeto_disclaimer_accepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <h2 className="text-lg font-bold text-gray-800">
            Avertissement important
          </h2>
        </div>

        <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
          <p>
            Les informations présentées sur <strong>Vegeto</strong> ont un caractère 
            strictement informatif et éducatif. Elles ne constituent en aucun cas 
            un avis médical, un diagnostic ou une prescription thérapeutique.
          </p>
          <p>
            L'utilisation de plantes médicinales peut présenter des risques, 
            notamment en cas d'interactions avec des médicaments, d'allergies, 
            de grossesse, d'allaitement ou de pathologies préexistantes. 
            Certaines plantes peuvent être toxiques à fortes doses ou 
            contre-indiquées dans certaines situations.
          </p>
          <p>
            <strong>Consultez toujours un professionnel de santé</strong> — 
            médecin, pharmacien ou phytothérapeute qualifié — avant d'utiliser 
            une plante à des fins thérapeutiques, en particulier si vous suivez 
            un traitement médical.
          </p>
          <p className="text-xs text-gray-600">
            En utilisant Vegeto, vous reconnaissez avoir pris connaissance de 
            cet avertissement et acceptez que les informations fournies ne 
            sauraient engager la responsabilité des créateurs de l'application.
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="mt-6 w-full py-2.5 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors"
        >
          J'ai compris, continuer
        </button>
      </div>
    </div>
  );
}