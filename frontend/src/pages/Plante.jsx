import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../config";
import PlanteFiche from "../components/PlanteFiche";

export default function Plante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plante, setPlante] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/plantes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlante(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <p className="text-center mt-10 text-gray-400">Chargement...</p>
  );

  if (!plante) return (
    <p className="text-center mt-10 text-gray-400">Plante introuvable</p>
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 transition-colors"
      >
        ← Retour
      </button>
      <PlanteFiche plante={plante} />
    </div>
  );
}