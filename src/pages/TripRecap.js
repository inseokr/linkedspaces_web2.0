import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import Modal from 'react-modal';
import { FaMicrophoneAlt } from 'react-icons/fa';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { IoRadioOutline } from 'react-icons/io5';
import 'leaflet/dist/leaflet.css';
import './TripRecap.css';
import { formatDate, reformatDate } from '../utils/DateUtils';
import { defaultIcon, polylineOptions } from '../constants/MapConstants';
import { fileServer } from '../constants/ServerUrls';

function TripRecap() {
  const { userId, tripId } = useParams(); // Get userId and tripId from the route

  const [recapData, setRecapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCommentClick = (photo) => {
    setSelectedPhoto(photo);
    setCommentModalOpen(true);
  };

  const handleImageClick = (imageSrc) => {
    if (isMobile) {
      setModalImageSrc(imageSrc);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleAudioPlay = async (audioUrl, event) => {
    event.stopPropagation(); // Prevent image click event
    
    // If the same audio is already playing, just stop it
    if (playingAudio && playingAudio.src === fileServer + audioUrl) {
      playingAudio.pause();
      playingAudio.removeEventListener('ended', handleAudioEnd);
      setPlayingAudio(null);
      setIsPlaying(false);
      return;
    }

    // If different audio is playing, stop it first
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.removeEventListener('ended', handleAudioEnd);
    }

    const audio = new Audio(fileServer + audioUrl);
    audio.addEventListener('ended', handleAudioEnd);
    try {
      await audio.play();
      setPlayingAudio(audio);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleAudioHover = async (audioUrl, event) => {
    event.stopPropagation();
    
    // If the same audio is already playing, do nothing
    if (playingAudio && playingAudio.src === fileServer + audioUrl) {
      return;
    }

    // If different audio is playing, stop it first
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.removeEventListener('ended', handleAudioEnd);
    }

    const audio = new Audio(fileServer + audioUrl);
    audio.loop = true; // Enable looping
    audio.addEventListener('ended', handleAudioEnd);
    try {
      await audio.play();
      setPlayingAudio(audio);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing hover audio:', error);
    }
  };

  const handleAudioHoverEnd = () => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.removeEventListener('ended', handleAudioEnd);
      setPlayingAudio(null);
      setIsPlaying(false);
    }
  };

  const handleAudioEnd = (audio) => {
    if (audio && isPlaying) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error replaying audio:', error);
        setIsPlaying(false);
      });
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.removeEventListener('ended', handleAudioEnd);
        setPlayingAudio(null);
        setIsPlaying(false);
      }
    };
  }, [playingAudio]);

  // Add scroll event listener to stop audio when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.removeEventListener('ended', handleAudioEnd);
        setPlayingAudio(null);
        setIsPlaying(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [playingAudio]);

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
    <div className="TripRecap">
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

      {/* Display recap per day */}
      {recapData.days.map((day, dayIndex) => (
        <div key={dayIndex} className="day-container">
          <h2>Day {dayIndex + 1}: {reformatDate(day.date)}</h2>
          {/* Map for the day */}
          {commentModalOpen===false && 
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
          </div>}
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
                        <div className="photo-container">
                          <img
                            src={fileServer + photo.uri}
                            alt={`Photo ${photo.uri}`}
                            className="photo"
                            style={{
                              transform: isPlaying && playingAudio?.src === fileServer + photo.audio ? 'scale(1.05)' : 'scale(1)',
                              transition: 'transform 2s ease-in-out',
                              animation: isPlaying && playingAudio?.src === fileServer + photo.audio ? 'zoomInOut 8s infinite' : 'none',
                              zIndex: isPlaying && playingAudio?.src === fileServer + photo.audio ? 2 : 1,
                              position: 'relative'
                            }}
                            onClick={() => handleImageClick(fileServer + photo.uri)} 
                          />
                          <style>
                            {`
                              @keyframes zoomInOut {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.03); }
                                100% { transform: scale(1); }
                              }
                            `}
                          </style>
                          {(photo.audio?.length??0)>0 && (
                            <div 
                              onMouseEnter={(e) => handleAudioHover(photo.audio, e)}
                              onMouseLeave={handleAudioHoverEnd}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                border: 'none',
                                borderRadius: '16px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 1000,
                                transition: 'all 0.2s ease',
                                backgroundColor: isPlaying && playingAudio?.src === fileServer + photo.audio 
                                  ? 'rgba(255, 255, 255, 0.9)' 
                                  : 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              <IoRadioOutline 
                                size={20} 
                                color={isPlaying && playingAudio?.src === fileServer + photo.audio ? '#000' : '#fff'} 
                              />
                            </div>
                          )}
                          {(photo.comments?.length??0)>0 && (
                            <button 
                              className="comments-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCommentClick(photo);
                              }}
                            >
                              View Comments ({photo.comments?.length || 0})
                            </button>
                          )}
                        </div>}
                        <p className="photo-story">{photo.story}</p>
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
            <img src={modalImageSrc} alt="Popup" className="modal-image" onClick={()=>{closeModal()}} style={{
              '@media (max-width: 768px)': {
                height: '40vh'
              }
            }}/>
          </div>
        </div>
      )}
      <Modal
        isOpen={commentModalOpen}
        onRequestClose={()=>{
          setCommentModalOpen(false);
          setSelectedPhoto(null);
        }}
        contentLabel="Comments Modal"
      >
        {selectedPhoto && (
          <div className="comments-section">
            <h2>Comments</h2>
            {selectedPhoto.comments?.map((comment) => (
              <div key={comment.id} className="comment">
                <p><strong>{comment.username}</strong>: {comment.text}</p>
                {comment.replies.length > 0 && (
                  <div className="replies">
                    <h3>Replies</h3>
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply">
                        <p><strong>{reply.username}</strong>: {reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button onClick={()=>{
              setCommentModalOpen(false);
              setSelectedPhoto(null);
            }}>Close</button>
          </div>
        )}
      </Modal>
      <div>
        <button className='signup-button'>
          <a href={'https://linkedspaces.com'} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>Sign up for LinkedSpaces</a>
        </button>
      </div>
    </div>
  );
}

export default TripRecap;