import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Accueil} from "./Pages/Accueil";    

export const Routeur = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
      </Routes>
    </Router>
  );
};
