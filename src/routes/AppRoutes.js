import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TripRecap from "../pages/TripRecap";
import Highlight from "../pages/Highlight";

const AppRoutes = () => (
  <Router>
    <Routes>
        <Route path="/trip/:userId/:tripId" element={<TripRecap />} />
        <Route path="/highlight/:userId/:id" element={<Highlight />} />
    </Routes>
  </Router>
);

export default AppRoutes;