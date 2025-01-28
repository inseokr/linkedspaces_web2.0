import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';

// Create a React root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <Router>
    <Routes>
      {/* Define routes for the app */}
      <Route path="/trip/:userId/:tripId" element={<App />} />
    </Routes>
  </Router>
);
