import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, MapPin, Shuffle, Menu, X } from "lucide-react";

export default function Header({ onRandomPlant }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
 const navigate = useNavigate()
  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
      isActive
        ? "bg-green-700 text-white border-green-700"
        : "text-gray-600 border-gray-300 hover:border-green-700 hover:text-green-700 bg-white"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-green-700 text-white"
        : "text-gray-600 hover:bg-green-50 hover:text-green-700"
    }`;


  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-1.5 text-xl font-bold text-green-700 tracking-tight"
        >
          <img src={`${process.env.PUBLIC_URL}/images/logo-vegeto.svg`} alt="Vegeto" className="h-8 w-auto" />
        </NavLink>

        {/* Navigation desktop — masquée sur mobile */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={navLinkClass}>
            <Home size={15} />
            Accueil
          </NavLink>

          {onRandomPlant && (
            <button
              onClick={() => navigate("/?random=true")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors text-gray-600 border-gray-300 hover:border-green-700 hover:text-green-700 bg-white"
            >
              <Shuffle size={15} />
              Aléatoire
            </button>
          )}

          <NavLink to="/lexique" className={navLinkClass}>
            <BookOpen size={15} />
            Lexique
          </NavLink>

          <NavLink to="/herboristeries" className={navLinkClass}>
            <MapPin size={15} />
            Herboristeries
          </NavLink>
        </nav>

        {/* Bouton hamburger — visible uniquement sur mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-green-700 hover:text-green-700 transition-colors"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Menu déroulant mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-fade-in-up">
          <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>
            <Home size={18} />
            Accueil
          </NavLink>

          <NavLink to="/lexique" className={mobileNavLinkClass} onClick={closeMenu}>
            <BookOpen size={18} />
            Lexique
          </NavLink>

          <NavLink to="/herboristeries" className={mobileNavLinkClass} onClick={closeMenu}>
            <MapPin size={18} />
            Herboristeries
          </NavLink>

          {onRandomPlant && (
            <button
              onClick={() => { navigate("/?random=true"); closeMenu(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-green-50 hover:text-green-700"
            >
              <Shuffle size={18} />
              Plante aléatoire
            </button>
          )}
        </div>
      )}
    </header>
  );
}