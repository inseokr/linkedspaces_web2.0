import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { APIProvider, Map, AdvancedMarker, Marker, useMap } from '@vis.gl/react-google-maps';
import getEnvVariables from '../env';
import { fileServer } from '../constants/ServerUrls';
import './GoogleMap.css';

const GoogleMap = ({ places, onMarkerClick, className = "" }) => {
  const envVars = getEnvVariables();
  
  // State for popup
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFullSizePhoto, setShowFullSizePhoto] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  
  // Default center (San Francisco) if no places provided
  const center = places.length > 0 
    ? { lat: places[0].coordinate.latitude, lng: places[0].coordinate.longitude }
    : { lat: 37.7749, lng: -122.4194 };

  // Create polyline coordinates for the route
  const polylineCoordinates = places.map(place => ({
    lat: place.coordinate.latitude,
    lng: place.coordinate.longitude
  }));

// Custom Polyline component using Google Maps API
const CustomPolyline = ({ places, onSegmentClick }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && places.length > 1) {
      // Create a simple straight path between places
      const createSimplePath = (places) => {
        return places.map(place => ({
          lat: place.coordinate.latitude,
          lng: place.coordinate.longitude
        }));
      };
      
      // Create a single dotted polyline
      const path = createSimplePath(places);
      
      // Create the visible dotted polyline
      const polyline = new window.google.maps.Polyline({
        path: path,
        strokeColor: '#ff8c00',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        geodesic: false,
        clickable: false, // Make it non-clickable
        // Use Google Maps stroke pattern for dotted line with orange and white dots
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              strokeWeight: 3,
              strokeColor: '#ff8c00'
            },
            offset: '0',
            repeat: '60px'
          },
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              strokeWeight: 3,
              strokeColor: '#ffffff'
            },
            offset: '30px',
            repeat: '60px'
          }
        ]
      });
      
      // Create invisible clickable polyline segments for each route segment
      const clickablePolylines = [];
      for (let i = 0; i < path.length - 1; i++) {
        const segmentPolyline = new window.google.maps.Polyline({
          path: [path[i], path[i + 1]],
          strokeColor: 'transparent',
          strokeOpacity: 0,
          strokeWeight: 20, // Wider clickable area
          geodesic: false,
          clickable: true
        });
        
        // Add click listener for this segment
        segmentPolyline.addListener('click', (event) => {
          if (onSegmentClick) {
            console.log('Segment clicked');
            // Target the next marker after this segment
            const targetIndex = Math.min(i + 1, places.length - 1);
            onSegmentClick(targetIndex, map); // Pass map instance
          }
        });
        
        segmentPolyline.setMap(map);
        clickablePolylines.push(segmentPolyline);
      }
      
      polyline.setMap(map);
      
      return () => {
        polyline.setMap(null);
        clickablePolylines.forEach(clickablePolyline => clickablePolyline.setMap(null));
      };
    }
  }, [map, places, onSegmentClick]);
  
  return null;
};

  // Custom map styles for a modern, blog-friendly look
  const mapStyles = [
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [{ weight: "2.00" }]
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ color: "#f2f2f2" }]
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ color: "#46bcec" }, { visibility: "on" }]
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ saturation: -100 }, { lightness: 45 }]
    }
  ];

  // Simplified handler for marker click
  const handleMarkerClick = useCallback((place, index) => {
    // Position popup in center of viewport (works for both normal and fullscreen mode)
    const centerPosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    
    // Set position first, then selected place to prevent movement
    setPopupPosition(centerPosition);
    
    // Use setTimeout to ensure position is set before showing popup
    setTimeout(() => {
      setSelectedPlace({ place, index });
    }, 0);
    
    // Don't call the original onMarkerClick to prevent page scrolling
    // The popup will handle the interaction instead
  }, []);

  // Handler for polyline segment click - center map on target marker
  const handleSegmentClick = useCallback((targetIndex, mapInstance) => {
    if (targetIndex < places.length && mapInstance) {
      const targetPlace = places[targetIndex];
      
      // Add a delay before starting the animation
      setTimeout(() => {
        // Get current map center
        const currentCenter = mapInstance.getCenter();
        const targetCenter = {
          lat: targetPlace.coordinate.latitude,
          lng: targetPlace.coordinate.longitude
        };
        
        // Custom smooth animation with longer duration
        const animationDuration = 1500; // 1.5 seconds
        const steps = 60; // Number of animation steps
        const stepDuration = animationDuration / steps;
        
        let currentStep = 0;
        
        const animateStep = () => {
          if (currentStep <= steps) {
            // Calculate interpolation factor (easing function)
            const t = currentStep / steps;
            const easeInOut = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
            // Interpolate between current and target position
            const lat = currentCenter.lat() + (targetCenter.lat - currentCenter.lat()) * easeInOut;
            const lng = currentCenter.lng() + (targetCenter.lng - currentCenter.lng()) * easeInOut;
            
            // Update map center
            mapInstance.panTo({ lat, lng });
            
            currentStep++;
            setTimeout(animateStep, stepDuration);
          }
        };
        
        animateStep();
        console.log('Segment clicked', targetPlace);
      }, 300); // 300ms initial delay
    }
    else {
      console.log('Segment clicked got ignored', targetIndex, mapInstance, places.length);
    }
  }, [places]);

  // Close popup
  const closePopup = () => {
    setSelectedPlace(null);
    setPopupPosition(null);
  };

  // Handle image click - show full size within popup
  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowFullSizePhoto(true);
  };

  // Close full size photo view
  const closeFullSizePhoto = () => {
    setShowFullSizePhoto(false);
    setSelectedImage(null);
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const [datePart, timePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split(':');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  // Check if we have a valid Map ID (not the demo placeholder)
  const hasValidMapId = envVars.REACT_APP_GOOGLE_MAPS_MAP_ID && 
                       envVars.REACT_APP_GOOGLE_MAPS_MAP_ID !== 'DEMO_MAP_ID';

  return (
    <div className={`google-map-container ${className}`}>
      <APIProvider apiKey={envVars.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <Map
          {...(hasValidMapId && { mapId: envVars.REACT_APP_GOOGLE_MAPS_MAP_ID })}
          defaultCenter={center}
          defaultZoom={15}
          styles={mapStyles}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          scaleControl={true}
          streetViewControl={false}
          rotateControl={false}
          fullscreenControl={true}
          onLoad={(map) => setMapInstance(map)}
        >
          {/* Custom polyline for route */}
          <CustomPolyline places={places} onSegmentClick={handleSegmentClick} />
          
          {/* Enhanced markers with cover photos */}
          {places.map((place, index) => {
            // Get the best available photo for the marker
            const getMarkerPhoto = () => {
              if (place.photoList && place.photoList.length > 0) {
                // Use the first photo as cover photo
                const photo = place.photoList[0];
                return fileServer + photo.uri;
              }
              return null; // No fallback, we'll handle this in the component
            };

            const photoUrl = getMarkerPhoto();
            const hasPhoto = photoUrl !== null;
            
            // Determine marker type for special styling
            const isStartMarker = index === 0;
            const isEndMarker = index === places.length - 1;
            const markerType = isStartMarker ? 'start' : isEndMarker ? 'end' : 'middle';
            
            // Always use AdvancedMarker for custom styling, fallback to regular Marker only if AdvancedMarker fails
            return (
              <AdvancedMarker
                key={`${place.placeName}-${index}`}
                position={{
                  lat: place.coordinate.latitude,
                  lng: place.coordinate.longitude
                }}
                title={place.placeName}
                onClick={(e) => {
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                  handleMarkerClick(place, index);
                }}
              >
                <div className={`custom-marker ${markerType}`}>
                  {/* Visit order badge */}
                  <div className="marker-order-badge">
                    {isStartMarker ? '🚗' : isEndMarker ? '🏁' : index + 1}
                  </div>
                  
                  <div className="marker-photo">
                    {hasPhoto ? (
                      <img 
                        src={photoUrl} 
                        alt={`${place.placeName} cover photo`}
                        onError={(e) => {
                          // Hide the image and show fallback
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        loading="lazy"
                      />
                    ) : null}
                    <div 
                      className="marker-fallback"
                      style={{ display: hasPhoto ? 'none' : 'flex' }}
                    >
                      {isStartMarker ? '🚗' : isEndMarker ? '🏁' : index + 1}
                    </div>
                  </div>
                  <div className="marker-label">{place.placeName}</div>
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Marker Popup - Rendered outside map container using portal */}
      {selectedPlace && popupPosition && createPortal(
        <div 
          key={`popup-${selectedPlace.index}`}
          className={`marker-popup ${showFullSizePhoto ? 'popup-full-photo-mode' : ''}`}
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            position: 'fixed',
            zIndex: 999999
          }}
        >
          <div className="popup-content">
            {/* Close button */}
            <button className="popup-close" onClick={closePopup}>
              ×
            </button>
            
            {/* Full size photo view */}
            {showFullSizePhoto && selectedImage ? (
              <>
                <button className="popup-full-photo-close" onClick={closeFullSizePhoto}>
                  ×
                </button>
                <img 
                  src={selectedImage} 
                  alt="Full size photo"
                  className="popup-full-photo"
                />
              </>
            ) : (
              <>
                {/* Place name */}
                <h3 className="popup-title">{selectedPlace.place.placeName}</h3>
                
                {/* Visit date */}
                <p className="popup-date">Visited: {formatDate(selectedPlace.place.digitizedTime)}</p>
                
                {/* Photos */}
                {selectedPlace.place.photoList && selectedPlace.place.photoList.length > 0 && (
                  <div className="popup-photos">
                    {selectedPlace.place.photoList.map((photo, idx) => (
                      <div 
                        key={idx}
                        className="popup-photo-container"
                        onClick={() => handleImageClick(fileServer + photo.uri)}
                      >
                        <img 
                          src={fileServer + photo.uri} 
                          alt={`Photo ${idx + 1}`}
                          className="popup-photo"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* First story */}
                {selectedPlace.place.photoList && selectedPlace.place.photoList.length > 0 && 
                 selectedPlace.place.photoList[0].story && (
                  <div className="popup-story">
                    <p>{selectedPlace.place.photoList[0].story}</p>
                  </div>
                )}
                
                {/* External link */}
                {selectedPlace.place.externalUrl && (
                  <a 
                    href={selectedPlace.place.externalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="popup-link"
                  >
                    Visit {selectedPlace.place.placeName} →
                  </a>
                )}
              </>
            )}
          </div>
          
          {/* Popup arrow */}
          <div className="popup-arrow"></div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GoogleMap;