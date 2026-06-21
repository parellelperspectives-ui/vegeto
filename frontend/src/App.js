import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Plante from "./pages/Plante";
import Herboristeries from "./components/Herboristeries";
import Lexique from "./pages/Lexique";
import Header from "./components/Header";
import DisclaimerModal from "./components/DisclaimerModal";
import Footer from "./components/Footer";
import { useState } from "react";

function App() {
  const [randomPlantTrigger, setRandomPlantTrigger] = useState(null);
  const isWeb = window.location.hostname !== "localhost" && !window.location.href.startsWith("capacitor");

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
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
export default App;
