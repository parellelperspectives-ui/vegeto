export default function SearchFilters({ filters, setFilters }) {

  const toggle = (field, value) => {
    setFilters(prev => {
      const list = prev[field];
      return {
        ...prev,
        [field]: list.includes(value)
          ? list.filter(v => v !== value)
          : [...list, value]
      };
    });
  };

  return (
    <div>
      <h3>Méthodes</h3>
      {["infusion", "poudre", "décoction"].map(v => (
        <label key={v}>
          <input
            type="checkbox"
            checked={filters.methodes.includes(v)}
            onChange={() => toggle("methodes", v)}
            autocomplete="off"
          />
          {v}
        </label>
      ))}

      <h3>Propriétés</h3>
      {["digestive", "anti-inflammatoire", "stimulante"].map(v => (
        <label key={v}>
          <input
            type="checkbox"
            checked={filters.proprietes.includes(v)}
            onChange={() => toggle("proprietes", v)}
          />
          {v}
        </label>
      ))}
    </div>
  );
}
