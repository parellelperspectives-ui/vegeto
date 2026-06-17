import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../config";

export default function Plante() {
  const { id } = useParams();
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

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!plante) return <p className="text-center mt-10">Plante introuvable</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Nom de la plante */}
      <h1 className="text-4xl font-bold mb-2">{plante.nom_vernaculaire}</h1>
      <p className="italic text-gray-600 mb-4">{plante.nom_scientifique}</p>

      {/* Famille */}
      {plante.famille && plante.famille !== "-" && (
        <Badge label={plante.famille} color="green" />
      )}

      {/* Sections principales */}
      <Section title="Méthode de consommation">
        {plante.methode_consommation}
      </Section>

      <Section title="Propriétés principales">
        {plante.proprietes_principales}
      </Section>

      <Section title="Résout quels problèmes">
        {plante.resolution_probleme}
      </Section>

      <Section title="Parties comestibles">
        {plante.parties_comestibles}
      </Section>

      <Section title="Contre-indications">
        {plante.contre_indications}
      </Section>

      <Section title="Interactions médicamenteuses">
        {plante.interactions_medicamenteuses}
      </Section>

      <Section title="Femmes enceintes">
        {plante.contre_indication_femmes_enceintes}
      </Section>

      <Section title="Enfants">
        {plante.contre_indication_enfant}
      </Section>
    </div>
  );
}

// Composant pour les sections
function Section({ title, children }) {
  if (!children || children === "-") return null;

  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg mb-1 text-gray-800">{title}</h2>
      <p className="text-gray-700">{children}</p>
    </div>
  );
}

// Composant Badge
function Badge({ label, color }) {
  const colors = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-block ${colors[color] || colors.green} text-sm font-semibold px-3 py-1 rounded-full mb-4`}
    >
      {label}
    </span>
  );
}
