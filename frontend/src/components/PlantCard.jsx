export default function PlantCard({ plant }) {
  return (
    <div style={styles.card}>
      <h3>{plant.nom_vernaculaire}</h3>
      <p><i>{plant.nom_scientifique}</i></p>
      <p>Famille : {plant.famille}</p>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "1rem",
    margin: "0.5rem"
  }
};
