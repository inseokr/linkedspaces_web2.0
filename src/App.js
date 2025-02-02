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

// // Function to format visited time
// const formatDate = (timestamp) => {
//   const date = new Date(timestamp);
//   return date.toLocaleString('en-US', {
//     weekday: 'long', // "Tuesday"
//     year: 'numeric', // "2024"
//     month: 'long', // "December"
//     day: 'numeric', // "26"
//     hour: 'numeric', // "3"
//     minute: 'numeric', // "58"
//     second: 'numeric', // "03"
//     hour12: true, // "AM/PM"
//   });
// };

function numberToMonth(number) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Check if the input is a valid number (between 1 and 12)
  if (number < 1 || number > 12 || !Number.isInteger(number)) {
    return "Invalid input. Please enter a number between 1 and 12.";
  }

  // Return the corresponding month name
  return months[number - 1]; 
}

function convertTo12Hour(timeStr) {
  let [hours, minutes] = timeStr.split(":").map(Number);
  let period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDate(dateStr) {
  // Split the input string into date and time parts
  const [datePart, timePart] = dateStr.split(' '); 

  // 2024:12:05 10:44:44 ==> 
  var year = datePart.split(':')[0];
  var month = datePart.split(':')[1];
  var day = datePart.split(':')[2];

  return `${numberToMonth(parseInt(month))} ${parseInt(day)}, ${year} at ${convertTo12Hour(timePart)}`
}

// ex> 2022:09:23
// ==> 9/23/2022
const reformatDate = (dateStr)=> {
const [year, month, day] = dateStr.split(':');
return `${numberToMonth(parseInt(month))}/${parseInt(day)} ${year}`;

}

function App() {
  const { userId, tripId } = useParams(); // Get userId and tripId from the route

  const [recapData, setRecapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const handleImageClick = (imageSrc) => {
    if (isMobile) {
      setModalImageSrc(imageSrc);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    // Check if the screen width is below 768px (commonly used mobile breakpoint)
    const checkIfMobile = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    // Initial check on component mount
    checkIfMobile();

    // Add event listener to handle resizing
    window.addEventListener("resize", checkIfMobile);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    if (userId && tripId) {
      axios.get(`https://pocketverse.herokuapp.com/LS_API/ls-beta-test/trip-recap/${userId}/${tripId}`)
        .then(response => {
          setRecapData(response.data);
          setLoading(false);

          console.warn(`response: `, response.data);
        })
        .catch(error => {
          setError(error.message);
          setLoading(false);
        });
    }
  }, [userId, tripId]);


  useEffect(()=>{
    if(isModalOpen) {
      console.warn(`hidden`);
      document.body.style.overflow = 'hidden';
    }
    else {
      document.body.style.overflow = 'auto';
    }
  })

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="App">
      <header className="trip-header">
        <div className="trip-info">
          <h1>{(recapData.trip.title?.length??0>0)? recapData.trip.title: 'Trip Recap from LinkedSpaces'}</h1>
          <p className="trip-dates">
          From {recapData.trip.startTimeString} to {recapData.trip.endTimeString}, {recapData.trip.startingYear}
          </p>
          <section className="user-container">
          <p className="trip-user">
            Shared from {recapData.trip.userName}
          </p>
          <img src={fileServer + recapData.trip.profilePicture} alt="Popup" className="profile-picture" onClick={()=>{}}/>
          </section>
          </div>
      </header>

      {/* {(recapData.trip.title?.length??0>0) &&
      <section className="trip-highlight">
        <h2>Trip Highlight: {recapData.trip.title}</h2>
        <div className="highlight-story">
          <h3>{recapData.trip.highlight}</h3>
        </div>
      </section>} */}

      {/* Display recap per day */}
      {recapData.days.map((day, dayIndex) => (
        <div key={dayIndex} className="day-container">
          <h2>Day {dayIndex + 1}: {reformatDate(day.date)}</h2>

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
                    <p><strong>Visited:</strong> {formatDate(place.digitizedTime)}</p>
                    <div className="popup-photo-grid">
                      {place.photoList?.slice(0,2).map((photo, index) => (
                        <img
                          key={index}
                          src={fileServer + photo.uri}
                          alt={`Photo ${photo.uri}`}
                          className="popup-photo"
                        />
                      ))}
                    </div>
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
                  <h3><a href={place.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecorationLine: 'underline' }}>
                    {place.placeName}
                  </a></h3>
                  <p><strong>Visited:</strong> {formatDate(place.digitizedTime)}</p>
                  <div className="photo-grid">
                    {place.photoList.map((photo, idx) => (
                      <div key={idx} className="photo-card">
                        {photo.uri &&
                        <img
                          src={fileServer + photo.uri}
                          alt={`Photo ${photo.uri}`}
                          className="photo"
                          onClick={() => handleImageClick(fileServer + photo.uri)} 
                        />}
                        <p className="photo-story">{photo.story}</p>
                        {(photo.audio?.length??0)>0 &&
                        <audio controls className="photo-audio">
                          <source src={fileServer + photo.audio} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>}
                        {(photo.storyAudio?.length??0)>0 &&
                        <audio controls className="photo-audio">
                          <source src={fileServer + photo.storyAudio} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
         
        </div>
      ))}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImageSrc} alt="Popup" className="modal-image" onClick={()=>{closeModal()}}/>
          </div>
        </div>
      )}
      <div>
        <button className='signup-button'>
          <a href={'https://linkedspaces.com'} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>Sign up for LinkedSpaces</a>
        </button>
      </div>
    </div>
  );
}

export default App;