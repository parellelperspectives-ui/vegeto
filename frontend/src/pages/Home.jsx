import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import PlanteFiche from "../components/PlanteFiche";
import API_URL from "../config";
import Filtres from "../components/MultiFilters";

export default function Home({ onRegisterRandom }) {
  const [results, setResults] = useState([]);
  const [selectedPlante, setSelectedPlante] = useState(null);
  const [showFiltres, setShowFiltres] = useState(false);
  const [searchLaunched, setSearchLaunched] = useState(false);
  const [filtres, setFiltres] = useState({ methode: "", probleme: "" });

   const loadRandomPlant = async () => {
    setResults([]);
    setSearchLaunched(false);
    try {
      const res = await fetch(`${API_URL}/api/plantes/random`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSelectedPlante(data);
    } catch (err) {
      console.error("Erreur chargement plante aléatoire :", err.message);
    }
  };

  const handleSearch = async (q) => {
    setSelectedPlante(null);
    if (!q) {
      setResults([]);
      setSearchLaunched(false);
      return;
    }
    setSearchLaunched(true);
    try {
      const res = await fetch(`${API_URL}/api/plantes?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Erreur recherche :", err);
    }
  };

  const handleFilter = async ({ methode, probleme }) => {
    setFiltres({ methode, probleme });
    setSelectedPlante(null);
    setSearchLaunched(true);

    const params = new URLSearchParams();
    if (methode) params.append("methode", methode);
    if (probleme) params.append("probleme", probleme);

    try {
      const res = await fetch(`${API_URL}/api/plantes?${params.toString()}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Erreur filtres :", err);
    }
  };

  const toggleFiltres = () => {
    if (showFiltres) {
      handleFilter({ methode: "", probleme: "" });
    }
    setShowFiltres(!showFiltres);
  };

  

  useEffect(() => {
    loadRandomPlant();
  }, []);

  useEffect(() => {
    if (onRegisterRandom) onRegisterRandom(() => loadRandomPlant);
  }, []);
  
  return (
    <div className="max-w-3xl mx-auto p-4">

      <SearchBar
        onSearch={handleSearch}
        onSelect={(plante) => setSelectedPlante(plante)}
      />

      <div className="mt-4">
        <button
          onClick={toggleFiltres}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
            showFiltres
              ? "bg-green-700 text-white border-green-700"
              : "bg-white text-gray-600 border-gray-300 hover:border-green-600"
          }`}
        >
          <span>{showFiltres ? "▲" : "▼"}</span>
          Recherche par critères
        </button>

        {showFiltres && (
          <div className="mt-3 p-4 border rounded-lg bg-gray-50 animate-fade-in-up">
            <Filtres onFilter={handleFilter} />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <ul className="mt-2 border rounded bg-white">
          {results.map((plante) => (
            <li
              key={plante.id}
              onClick={() => {
                setSelectedPlante(plante);
                setResults([]);
              }}
              className="p-2 cursor-pointer hover:bg-green-100"
            >
              {plante.nom_vernaculaire}
            </li>
          ))}
        </ul>
      )}

      {searchLaunched && results.length === 0 && !selectedPlante && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-500 text-sm">
            Aucune plante trouvée pour cette recherche.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Essayez un autre terme ou utilisez les filtres par critères.
          </p>
        </div>
      )}

      {selectedPlante && <PlanteFiche plante={selectedPlante} />}
    </div>
  );
}