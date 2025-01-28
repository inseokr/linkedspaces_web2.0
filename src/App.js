import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const fileServer = `https://s3-us-west-1.amazonaws.com/linkedspaces.fs`;

// Custom marker icon
const defaultIcon = (index) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: #007bff; color: white; 
      width: 30px; height: 30px; display: flex; 
      align-items: center; justify-content: center; 
      border-radius: 50%; font-size: 14px;">${index}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15], // Center the icon
  });

const polylineOptions = {
  color: "#007bff",        // Line color
  weight: 2,            // Line thickness
  dashArray: "4 8",     // Pattern for dashes (4px dash, 8px space)
};

// Function to format visited time
const formatVisitedTime = (timeString) => {
  const [date, time] = timeString.split(' ');
  return `${date.replace(/:/g, '-')} ${time}`;
};

function App() {
  const { userId, tripId } = useParams(); // Get userId and tripId from the route

  const [recapData, setRecapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId && tripId) {
      axios.get(`https://pocketverse.herokuapp.com/LS_API/ls-beta-test/trip-recap/${userId}/${tripId}`)
        .then(response => {
          setRecapData(response.data);
          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setLoading(false);
        });
    }
  }, [userId, tripId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="App">
      <header className="header">
        <h1>Trip Recap: {recapData.trip.title}</h1>
        <p className="trip-dates">
          {recapData.trip.startTimeString} - {recapData.trip.endTimeString}
        </p>
      </header>

      {/* Display recap per day */}
      {recapData.days.map((day, dayIndex) => (
        <div key={dayIndex} className="day-container">
          <h2>Day {dayIndex + 1}: {day.date}</h2>

          {/* Map for the day */}
          <div className="map-container">
            <MapContainer
              center={[day.places[0].coordinate.latitude, day.places[0].coordinate.longitude]}
              zoom={12}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Polyline to connect places */}
              <Polyline
                positions={day.places.map(place => [place.coordinate.latitude, place.coordinate.longitude])}
                pathOptions={polylineOptions}
              />
              {day.places.map((place, placeIndex) => (
                <Marker
                  key={placeIndex}
                  position={[place.coordinate.latitude, place.coordinate.longitude]}
                  icon={defaultIcon(placeIndex + 1)} 
                >
                  <Popup>
                    <h3>{place.placeName}</h3>
                    <p>{place.story}</p>
                    <p><strong>Visited:</strong> {formatVisitedTime(place.visitedTimeDigitized)}</p>
                    {place.photoList.map((photo, idx) => (
                      <img
                        key={idx}
                        src={fileServer + photo.uri}
                        alt={`Photo ${photo.uri}`}
                        className="popup-photo"
                      />
                    ))}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Stories and Photos for the day */}
          <div className="places-container">
            {day.places.map((place, placeIndex) => {
              // Alternate layout for each place
              const layoutClass = placeIndex % 2 === 0 ? 'layout-even' : 'layout-odd';
              return (
                <div key={placeIndex} className={`place-card ${layoutClass}`}>
                  <h3>{place.placeName}</h3>
                  <p className="place-story">{place.story}</p>
                  <p><strong>Visited:</strong> {formatVisitedTime(place.visitedTimeDigitized)}</p>
                  <div className="photo-grid">
                    {place.photoList.map((photo, idx) => (
                      <div key={idx} className="photo-card">
                        <img
                          src={fileServer + photo.uri}
                          alt={`Photo ${photo.uri}`}
                          className="photo"
                        />
                        <p className="photo-story">{photo.story}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;