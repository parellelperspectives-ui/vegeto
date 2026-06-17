import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // 🔥 clé
  };

 return (
  <div className="relative">
    <label htmlFor="search-plante" className="sr-only">
      Rechercher une plante
    </label>
    <input
      id="search-plante"
      type="text"
      placeholder="Rechercher une plante..."
      autoComplete="off"
      value={query}
      onChange={handleChange}
      className="w-full p-3 text-base rounded border border-gray-300"
    />
  </div>
);
}
