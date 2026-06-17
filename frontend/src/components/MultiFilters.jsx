import { useState, useEffect } from "react";
import API_URL from "../config";

const METHODES = [
  "infusion", "extrait", "poudre", "huile essentielle",
  "usage externe", "teinture mère", "décoction"
];

const TOUS_PROBLEMES = [
  "dépression légère", "anxiété", "brûlures", "inflammations cutanées",
  "fatigue nerveuse", "ballonnements", "troubles digestifs",
  "prévention des infections", "jambes lourdes", "insomnie",
  "nervosité", "diarrhée", "irritations cutanées", "constipation",
  "migraine", "troubles du cycle", "stress"
];

export default function Filtres({ onFilter }) {
  const [methode, setMethode] = useState("");
  const [probleme, setProbleme] = useState("");
  const [problemesDisponibles, setProblemesDisponibles] = useState(TOUS_PROBLEMES);

  // Recharge les problèmes disponibles quand la méthode change
  useEffect(() => {
    const chargerProblemes = async () => {
      try {
        const params = methode ? `?methode=${encodeURIComponent(methode)}` : "";
        const res = await fetch(`${API_URL}/api/plantes/problemes-par-methode${params}`);
        const data = await res.json();
        console.log("Problèmes reçus :", data);
        // On filtre notre liste prédéfinie pour ne garder que ceux présents en base
        const disponibles = TOUS_PROBLEMES.filter(p =>
          data.some(d => d.includes(p) || p.includes(d))
        );

        setProblemesDisponibles(disponibles);

        // Si le problème sélectionné n'est plus disponible, on le reset
        if (probleme && !disponibles.includes(probleme)) {
          setProbleme("");
          onFilter({ methode, probleme: "" });
        }
      } catch (err) {
        console.error("Erreur chargement problèmes :", err);
        setProblemesDisponibles(TOUS_PROBLEMES);
      }
    };

    chargerProblemes();
  }, [methode]);

  const handleMethode = (value) => {
    const newMethode = value === methode ? "" : value;
    setMethode(newMethode);
    setProbleme("");
    onFilter({ methode: newMethode, probleme: "" });
  };

  const handleProbleme = (value) => {
    const newProbleme = value === probleme ? "" : value;
    setProbleme(newProbleme);
    onFilter({ methode, probleme: newProbleme });
  };

  const reset = () => {
    setMethode("");
    setProbleme("");
    onFilter({ methode: "", probleme: "" });
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label htmlFor="select-methode" className="sr-only">
          Méthode de consommation
        </label>
        <select
          id="select-methode"
          value={methode}
          onChange={(e) => handleMethode(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700"
        >
          <option value="">Toutes les méthodes</option>
          {METHODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Résout quels problèmes
          {methode && (
            <span className="ml-2 text-xs text-green-700">
              (filtrés pour : {methode})
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {problemesDisponibles.length === 0 ? (
            <p className="text-sm text-gray-600 italic">
              Aucun problème associé à cette méthode
            </p>
          ) : (
            problemesDisponibles.map((p) => (
              <button
                key={p}
                onClick={() => handleProbleme(p)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  probleme === p
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-600"
                }`}
              >
                {p}
              </button>
            ))
          )}
        </div>
      </div>

      {(methode || probleme) && (
        <button
          onClick={reset}
          className="text-sm text-red-600 hover:text-red-600 underline"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}