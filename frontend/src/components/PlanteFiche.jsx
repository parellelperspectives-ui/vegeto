export default function PlanteFiche({ plante }) {
  if (!plante) return null;

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl shadow-lg border overflow-hidden animate-fade-in-up">
      {/* Image */}
      <div className="w-full bg-gray-100">
        <img
          src={`${process.env.PUBLIC_URL}/images/plantes/${plante.image_filename}`}
          alt={plante.nom_vernaculaire}
          className="w-full h-40 md:h-80 object-cover"
          onError={(e) => {
            e.currentTarget.src = `${process.env.PUBLIC_URL}/images/plantes/default.jpg`;
          }}
        />
      </div>

      {/* Contenu */}
      <div className="p-6 md:p-8">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-[1.2rem] md:text-3xl font-bold text-gray-900">
            {plante.nom_vernaculaire}
          </h1>

          <p className="mt-2 italic text-gray-600">
            {plante.nom_scientifique}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {plante.famille && plante.famille !== "-" && (
              <Badge label={plante.famille} color="green" />
            )}

            {plante.parties_comestibles && plante.parties_comestibles !== "-" && (
              <Badge label="Parties comestibles" color="yellow" />
            )}

            {plante.contre_indications && plante.contre_indications !== "-" && (
              <Badge label="Précautions" color="red" />
            )}
          </div>
        </div>

        {/* Bloc résumé */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InfoCard title="Méthode de consommation">
            {plante.methode_consommation}
          </InfoCard>

          <InfoCard title="Résout quels problèmes">
            {plante.resolution_probleme}
          </InfoCard>
        </div>

        {/* Sections détaillées */}
        <div className="space-y-6">
          <Section title="Propriétés principales">
            {plante.proprietes_principales}
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

          <Section title="Contre-indications femmes enceintes">
            {plante.contre_indication_femmes_enceintes}
          </Section>

          <Section title="Contre-indications enfant">
            {plante.contre_indication_enfant}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sous-composants ---------- */

function Section({ title, children }) {
  if (!children || children === "-") return null;

  return (
    <section className="border-t pt-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {title}
      </h2>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </section>
  );
}

function InfoCard({ title, children }) {
  if (!children || children === "-") return null;

  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}

function Badge({ label, color }) {
  const colors = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        colors[color] || colors.green
      }`}
    >
      {label}
    </span>
  );
}