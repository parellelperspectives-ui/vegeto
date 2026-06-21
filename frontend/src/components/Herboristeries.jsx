import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix icônes Leaflet avec CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const RAYON_KM = 10;

// Convertit km en degrés approximatifs pour la bbox OSM
const kmToDeg = (km) => km / 111;

const fetchCommerces = async (lat, lon) => {
  const delta = kmToDeg(RAYON_KM);
  const bbox = `${lat - delta},${lon - delta},${lat + delta},${lon + delta}`;

 const query = `
  [out:json][timeout:25];
  (
    node["shop"="herbalist"](${bbox});
    node["healthcare"="herbalist"](${bbox});
    node["shop"="organic"](${bbox});
    node["amenity"="pharmacy"](${bbox});
    node["name"~"herboristerie|herboriste|herbal|plantes médicinales",i](${bbox});
    way["shop"="herbalist"](${bbox});
    way["healthcare"="herbalist"](${bbox});
    way["shop"="organic"](${bbox});
    way["amenity"="pharmacy"](${bbox});
    way["name"~"herboristerie|herboriste|herbal|plantes médicinales",i](${bbox});
  );
  out center;
`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  const data = await res.json();
    return data.elements.map((el) => ({
    id: el.id,
    lat: el.lat || el.center?.lat,
    lon: el.lon || el.center?.lon,
    nom: el.tags?.name || "Commerce sans nom",
    type: el.tags?.shop || el.tags?.healthcare || el.tags?.amenity || 
            (el.tags?.name?.toLowerCase().includes("herbo") ? "herbalist_name" : null),
    adresse: [
        el.tags?.["addr:housenumber"],
        el.tags?.["addr:street"],
        el.tags?.["addr:city"],
    ]
        .filter(Boolean)
        .join(" "),
    }));
};

const labelType = (type) => {
  if (type === "herbalist") return "🌿 Herboristerie";
  if (type === "organic") return "🥦 Magasin bio";
  if (type === "pharmacy") return "💊 Pharmacie";
  if (type === "herbalist_name") return "🌿 Herboristerie (nom)";
  return "📍 Commerce";
};



export default function Herboristeries() {
  const [position, setPosition] = useState(null);
  const [villeInput, setVilleInput] = useState("");
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoRefused, setGeoRefused] = useState(false);
  const [filtreType, setFiltreType] = useState("tous");

// Filtre les commerces selon le type sélectionné
const commercesFiltres = filtreType === "tous"
  ? commerces
  : commerces.filter(c => c.type === filtreType);

  // Tentative géolocalisation automatique
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoRefused(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => setGeoRefused(true)
    );
  }, []);

  // Charge les commerces dès qu'on a une position
  useEffect(() => {
    if (!position) return;
    const charger = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCommerces(position.lat, position.lon);
        setCommerces(data);
      } catch (err) {
        setError("Impossible de charger les commerces.");
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [position]);

  // Fallback manuel par ville
  const handleVilleSubmit = async (e) => {
    e.preventDefault();
    if (!villeInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(villeInput)}&format=json&limit=1`
      );
      const data = await res.json();
      if (!data.length) throw new Error("Ville introuvable");
      setPosition({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
    } catch (err) {
      setError("Ville introuvable, essaie avec un nom différent.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">

  <h1 className="flex items-center gap-1 font-bold text-gray-800 mb-4">
    <MapPin size={24} className="text-green-700"  /> Trouver un commerce près de chez vous
  </h1>

  {/* Fallback manuel */}
  {geoRefused && (
    <form onSubmit={handleVilleSubmit} className="flex gap-2 mb-4">
      <div className="flex-1">
        <label htmlFor="ville-refused" className="sr-only">
          Entrez votre ville
        </label>
        <input
          id="ville-refused"
          type="text"
          placeholder="Entrez votre ville..."
          value={villeInput}
          onChange={(e) => setVilleInput(e.target.value)}
          autoComplete="address-level2"
          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800"
      >
        Rechercher
      </button>
    </form>
  )}

  {/* Option manuelle même si géoloc OK */}
  {!geoRefused && (
    <form onSubmit={handleVilleSubmit} className="flex gap-2 mb-4">
      <div className="flex-1">
        <label htmlFor="ville-manual" className="sr-only">
          Rechercher une autre ville
        </label>
        <input
          id="ville-manual"
          type="text"
          placeholder="Ou rechercher une autre ville..."
          value={villeInput}
          onChange={(e) => setVilleInput(e.target.value)}
          autoComplete="address-level2"
          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800"
      >
        Rechercher
      </button>
    </form>
  )}

  {loading && (
    <p className="text-center text-gray-600 text-sm mt-4">
      Chargement des commerces...
    </p>
  )}

  {error && (
    <p className="text-red-500 text-sm mt-2">{error}</p>
  )}

  {/* Carte */}
  {position && !loading && (
    <MapContainer
      center={[position.lat, position.lon]}
      zoom={13}
      className="w-full h-72 rounded-xl mt-4 z-0"
       role="region"
        aria-label="Carte des commerces à proximité"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      {commercesFiltres.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lon]}>
          <Popup>
            <strong>{c.nom}</strong><br />
            {labelType(c.type)}<br />
            {c.adresse && <span>{c.adresse}</span>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )}

  {/* Liste */}
  {!loading && commerces.length > 0 && (
    <div>
    {/* Boutons filtre */}
    <div className="flex gap-2 mt-4 flex-wrap">
      {["tous", "herbalist", "pharmacy"].map((type) => (
        <button
          key={type}
          onClick={() => setFiltreType(type)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            filtreType === type
              ? "bg-green-700 text-white border-green-700"
              : "bg-white text-gray-600 border-gray-300 hover:border-green-600"
          }`}
        >
          {type === "tous" ? "Tous" : labelType(type)}
        </button>
      ))}
    </div>

    {/* Liste */}
    <ul className="mt-4 space-y-2">
      {commercesFiltres.map((c) => (
        <li
          key={c.id}
          className="p-3 border rounded-lg bg-white flex justify-between items-start"
        >
          <div>
            <p className="font-medium text-gray-800">{c.nom}</p>
            <p className="text-sm text-gray-500">{labelType(c.type)}</p>
            {c.adresse && (
              <p className="text-sm text-gray-600">{c.adresse}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

      {!loading && position && commerces.length === 0 && (
        <p className="text-sm text-gray-600 italic mt-4">
          Aucun commerce trouvé dans un rayon de {RAYON_KM} km.
        </p>
      )}
    </div>
  );
}