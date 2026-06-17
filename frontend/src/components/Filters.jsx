export default function Filters({ onFilter }) {
  return (
    <div style={styles.filters}>
      <select onChange={(e) => onFilter("methode_consommation", e.target.value)}>
        <option value="">Méthode de consommation</option>
        <option value="infusion">Infusion</option>
        <option value="poudre">Poudre</option>
        <option value="teinture">Teinture</option>
      </select>

      <select onChange={(e) => onFilter("proprietes_principales", e.target.value)}>
        <option value="">Propriétés</option>
        <option value="digestive">Digestive</option>
        <option value="calmante">Calmante</option>
        <option value="anti-inflammatoire">Anti-inflammatoire</option>
      </select>

      <select onChange={(e) => onFilter("resolution_probleme", e.target.value)}>
        <option value="">Problème</option>
        <option value="nausées">Nausées</option>
        <option value="stress">Stress</option>
        <option value="digestion">Digestion</option>
      </select>
    </div>
  );
}

const styles = {
  filters: {
    display: "flex",
    gap: "1rem"
  }
};
