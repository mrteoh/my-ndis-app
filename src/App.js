import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/page";   
import InvoicePage from "./pages/Invoice/page";   

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InvoicePage />} />
        <Route path="/invoice" element={<InvoicePage />} />
      </Routes>
    </Router>
  );
}

export default App;
