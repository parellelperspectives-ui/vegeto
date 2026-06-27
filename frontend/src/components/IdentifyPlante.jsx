import { useState, useRef } from "react";
import { Camera, Upload, X, Leaf, AlertTriangle } from "lucide-react";
import API_URL from "../config";

export default function IdentifyPlante({ onPlanteFound }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResults(null);
    setError(null);
  };

  const handleIdentify = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(`${API_URL}/api/identify`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Impossible d'identifier la plante. Réessayez avec une photo plus nette.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResults(null);
    setError(null);
  };

  const scoreLabel = (score) => {
    if (score > 0.5) return { label: "Très probable", color: "text-green-700 bg-green-50 border-green-200" };
    if (score > 0.2) return { label: "Probable", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Incertain", color: "text-red-700 bg-red-50 border-red-200" };
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-1">
        <Camera size={24} className="text-green-700" />
        Identifier une plante
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Prenez une photo ou importez une image pour identifier une plante
      </p>

      {/* Zone upload */}
      {!preview && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => cameraInputRef.current.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-700 hover:text-green-700 transition-colors"
          >
            <Camera size={24} />
            <span className="font-medium">Prendre une photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-700 hover:text-green-700 transition-colors"
          >
            <Upload size={24} />
            <span className="font-medium">Importer une image</span>
          </button>
        </div>
      )}

      {/* Inputs cachés */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* Prévisualisation */}
      {preview && (
        <div className="mb-4">
          <div className="relative">
            <img
              src={preview}
              alt="Plante à identifier"
              className="w-full h-64 object-cover rounded-xl"
            />
            <button
              onClick={reset}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {!results && (
            <button
              onClick={handleIdentify}
              disabled={loading}
              className="mt-3 w-full py-3 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Identification en cours..." : "Identifier cette plante"}
            </button>
          )}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Résultats */}
      {results && (
        <div className="space-y-3 animate-fade-in-up">
          <h2 className="font-semibold text-gray-700 text-sm">
            Résultats d'identification
          </h2>

          {results.results.map((result, index) => {
            const { label, color } = scoreLabel(result.score);
            return (
              <div
                key={index}
                className="p-4 bg-white border rounded-xl"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 italic">
                      {result.scientificName}
                    </p>
                    {result.commonNames?.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {result.commonNames.slice(0, 2).join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Famille : {result.famille}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full border ${color}`}>
                    {label}
                  </span>
                </div>

                {/* Plante trouvée dans Vegeto */}
                {result.planteVegeto ? (
                  <button
                    onClick={() => onPlanteFound(result.planteVegeto)}
                    className="mt-2 w-full flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <Leaf size={14} />
                    Voir la fiche : {result.planteVegeto.nom_vernaculaire}
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-gray-400 italic">
                    Plante non référencée dans Vegeto
                  </p>
                )}
              </div>
            );
          })}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              L'identification automatique peut être inexacte. Ne consommez jamais une plante sans confirmation d'un expert.
            </p>
          </div>

          <button
            onClick={reset}
            className="w-full py-2 text-sm text-gray-500 hover:text-green-700 transition-colors"
          >
            Nouvelle identification
          </button>
        </div>
      )}
    </div>
  );
}