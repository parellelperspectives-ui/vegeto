import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Plante from "./pages/Plante";
import Herboristeries from "./components/Herboristeries";
import Lexique from "./pages/Lexique";
import Header from "./components/Header";
import DisclaimerModal from "./components/DisclaimerModal";
import Footer from "./components/Footer";
import IdentifyPlante from "./components/IdentifyPlante";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { initDB, syncData } from "./services/db";
import API_URL from "./config";

function IdentifyPage() {
  const navigate = useNavigate();
  
  return (
    <IdentifyPlante
      onPlanteFound={(plante) => {
        navigate(`/plante/${plante.id}`);
          console.log("Navigation vers :", `/plante/${plante.id}`);
      }}
    />
  );
}


function App() {
  const [randomPlantTrigger, setRandomPlantTrigger] = useState(null);
  const isWeb = window.location.hostname !== "localhost" && !window.location.href.startsWith("capacitor");

    useEffect(() => {
    const initAndSync = async () => {
      if (!Capacitor.isNativePlatform()) return;
      await initDB();
      await syncData(API_URL);
    };
    initAndSync();
  }, []);

  return (
    <Router basename={isWeb ? "/app/vegeto" : "/"}>
      <DisclaimerModal />
      <Header onRandomPlant={randomPlantTrigger} />
      <main className="pt-4">
        <Routes>
          <Route 
            path="/" 
            element={<Home onRegisterRandom={setRandomPlantTrigger} />} 
          />
          <Route path="/plante/:id" element={<Plante />} />
          <Route path="/herboristeries" element={<Herboristeries />} />
          <Route path="/lexique" element={<Lexique />} />
          <Route path="/identifier" element={<IdentifyPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
export default App;
