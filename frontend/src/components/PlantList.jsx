import PlantCard from "./PlantCard";

const MOCK_PLANTS = [
  {
    nom_scientifique: "Mentha spicata",
    nom_vernaculaire: "Menthe",
    famille: "Lamiaceae"
  },
  {
    nom_scientifique: "Zingiber officinale",
    nom_vernaculaire: "Gingembre",
    famille: "Zingiberaceae"
  }
];

export default function PlantList({ search }) {
  const results = MOCK_PLANTS.filter(p =>
    p.nom_scientifique.toLowerCase().includes(search.toLowerCase()) ||
    p.nom_vernaculaire.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {results.map((plant, index) => (
        <PlantCard key={index} plant={plant} />
      ))}
    </div>
  );
}
