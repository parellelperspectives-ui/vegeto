import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import { BookOpen, Leaf, Stethoscope, FlaskConical, LayoutGrid } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { getLexiqueLocal } from "../services/db";


const CATEGORIES = [
  { value: "tous", label: "Toutes les catégories", icon: <LayoutGrid size={15} /> },
  { value: "methode", label: "Méthodes de consommation", icon: <FlaskConical size={15} /> },
  { value: "propriete", label: "Propriétés", icon: <Leaf size={15} /> },
  { value: "probleme", label: "Problèmes traités", icon: <Stethoscope size={15} /> },
];

export default function Lexique() {
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState("tous");
  const [resultats, setResultats] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    chargerTermes("", categorie);
  }, []);

  useEffect(() => {
    chargerTermes(q, categorie);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [categorie]);

 const chargerTermes = async (recherche, cat) => {
  setLoading(true);
  try {
    // Mode hors ligne sur Android
    if (Capacitor.isNativePlatform() && !navigator.onLine) {
      const data = await getLexiqueLocal(recherche, cat);
      setResultats(data || []);
      return;
    }
    // Mode en ligne
    const params = new URLSearchParams();
    if (recherche) params.append("q", recherche);
    if (cat && cat !== "tous") params.append("categorie", cat);
    const res = await fetch(`${API_URL}/api/lexique?${params.toString()}`);
    const data = await res.json();
    setResultats(data);
  } catch (err) {
    // Fallback local
    if (Capacitor.isNativePlatform()) {
      const data = await getLexiqueLocal(recherche, cat);
      setResultats(data || []);
    }
    console.error("Erreur lexique :", err);
  } finally {
    setLoading(false);
  }
};

 const chargerSuggestions = async (valeur) => {
  if (valeur.length < 2) {
    setSuggestions([]);
    return;
  }
  try {
    // Mode hors ligne — filtre directement depuis les résultats locaux
    if (Capacitor.isNativePlatform() && !navigator.onLine) {
      const data = await getLexiqueLocal(valeur, categorie);
      setSuggestions(data?.slice(0, 10) || []);
      setShowSuggestions(true);
      return;
    }
    // Mode en ligne
    const params = new URLSearchParams({ q: valeur });
    if (categorie !== "tous") params.append("categorie", categorie);
    const res = await fetch(`${API_URL}/api/lexique/termes?${params.toString()}`);
    const data = await res.json();
    setSuggestions(data);
    setShowSuggestions(true);
  } catch (err) {
    if (Capacitor.isNativePlatform()) {
      const data = await getLexiqueLocal(valeur, categorie);
      setSuggestions(data?.slice(0, 10) || []);
      setShowSuggestions(true);
    }
    console.error("Erreur suggestions :", err);
  }
};

  const handleInputChange = (e) => {
    const valeur = e.target.value;
    setQ(valeur);
    chargerSuggestions(valeur);
    if (!valeur) {
      chargerTermes("", categorie);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (terme) => {
    setQ(terme);
    setSuggestions([]);
    setShowSuggestions(false);
    chargerTermes(terme, categorie);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      chargerTermes(q, categorie);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const grouped = CATEGORIES.filter(c => c.value !== "tous").reduce((acc, cat) => {
    acc[cat.value] = resultats.filter(r => r.categorie === cat.value);
    return acc;
  }, {});

  const labelCategorie = (value) =>
    CATEGORIES.find(c => c.value === value)?.label || value;

  const iconCategorie = (value) =>
    CATEGORIES.find(c => c.value === value)?.icon || null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-1">
        <BookOpen size={24} className="text-green-700" />
        Lexique
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Définitions des termes employés dans les fiches plantes
      </p>

      {/* Barre de recherche */}
      <div className="relative mb-4" ref={searchRef}>
        <label htmlFor="search-term" className="sr-only">
          Rechercher un terme
        </label>
        <input
          id="search-term"
          type="text"
          placeholder="Rechercher un terme..."
          value={q}
          autoComplete="off"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-md">
            {suggestions.map((s) => (
              <li
                key={s.id}
                onClick={() => handleSuggestionClick(s.terme)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-green-50 flex justify-between items-center"
              >
                <span>{s.terme}</span>
                <span className="text-xs text-gray-600">
                  {labelCategorie(s.categorie)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Boutons catégorie */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategorie(c.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              categorie === c.value
                ? "bg-green-700 text-white border-green-700"
                : "text-gray-600 border-gray-300 hover:border-green-700 hover:text-green-700 bg-white"
            }`}
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-center text-gray-600 text-sm mt-4">Chargement...</p>
      )}

      {/* Résultats groupés par catégorie */}
      {!loading && (
        categorie === "tous" ? (
          Object.entries(grouped).map(([cat, termes]) =>
            termes.length > 0 ? (
              <div key={cat} className="mb-8">
                <h2 className="flex items-center gap-2 text-md font-semibold text-gray-600 mb-3 border-b pb-1">
                  {iconCategorie(cat)}
                  {labelCategorie(cat)}
                </h2>
                <dl className="space-y-4">
                  {termes.map((t) => (
                    <TermeItem key={t.id} terme={t} />
                  ))}
                </dl>
              </div>
            ) : null
          )
        ) : (
          <dl className="space-y-4">
            {resultats.map((t) => (
              <TermeItem key={t.id} terme={t} />
            ))}
          </dl>
        )
      )}

      {!loading && resultats.length === 0 && (
        <p className="text-sm text-gray-600 italic mt-4">
          Aucun terme trouvé.
        </p>
      )}
    </div>
  );
}

function TermeItem({ terme }) {
  return (
    <div className="p-4 bg-white border rounded-lg animate-fade-in-up">
      <dt className="font-semibold text-gray-800 mb-1">{terme.terme}</dt>
      <dd className="text-sm text-gray-600 leading-relaxed">
        {terme.definition}
      </dd>
    </div>
  );
}