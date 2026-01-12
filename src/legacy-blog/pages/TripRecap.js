import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GoogleMap from '../components/GoogleMap';
import Modal from 'react-modal';
import { IoRadioOutline, IoHeadsetOutline, IoPause, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import './TripRecap.css';
import { formatDate, reformatDate } from '../utils/DateUtils';
import { fileServer } from '../constants/ServerUrls';

function TripRecap({ userId, tripId }) {

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
  const [playingStoryAudio, setPlayingStoryAudio] = useState(null);
  const [expandedComments, setExpandedComments] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleMarkerClick = (place, index) => {
    setSelectedPlace({ place, index });
    // Scroll to the corresponding place card
    const placeCard = document.querySelector(`[data-place-index="${index}"]`);
    if (placeCard) {
      placeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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
    event.stopPropagation();
    
    const fullAudioUrl = fileServer + audioUrl;
    
    // If the same audio is already playing, stop it
    if (playingAudio && playingAudio.src === fullAudioUrl) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      playingAudio.removeEventListener('ended', handleAudioEnd);
      playingAudio.src = '';
      setPlayingAudio(null);
      setIsPlaying(false);
      return;
    }

    // Stop any currently playing audio
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.removeEventListener('ended', handleAudioEnd);
      playingAudio.src = '';
      setPlayingAudio(null);
      setIsPlaying(false);
    }

    // Create new audio instance
    const audio = new Audio(fullAudioUrl);
    audio.preload = 'none'; // Don't preload to save memory
    audio.addEventListener('ended', handleAudioEnd);
    
    try {
      await audio.play();
      setPlayingAudio(audio);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      // Clean up on error
      audio.src = '';
    }
  };

  const handleAudioHover = async (audioUrl, event) => {
    event.stopPropagation();
    
    const fullAudioUrl = fileServer + audioUrl;
    
    // If the same audio is already playing, do nothing
    if (playingAudio && playingAudio.src === fullAudioUrl) {
      return;
    }

    // If different audio is playing, stop it first
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.removeEventListener('ended', handleAudioEnd);
      playingAudio.src = '';
      setPlayingAudio(null);
      setIsPlaying(false);
    }

    const audio = new Audio(fullAudioUrl);
    audio.preload = 'none'; // Don't preload to save memory
    audio.loop = true;
    audio.addEventListener('ended', handleAudioEnd);
    
    try {
      await audio.play();
      setPlayingAudio(audio);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing hover audio:', error);
      // Clean up on error
      audio.src = '';
    }
  };

  const handleAudioHoverEnd = () => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.removeEventListener('ended', handleAudioEnd);
      playingAudio.src = ''; // Clear src to free memory
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

  const handleStoryAudioPlay = async (audioUrl, event) => {
    event.stopPropagation();
    
    const fullAudioUrl = fileServer + audioUrl;
    
    // If the same audio is already playing, stop it
    if (playingStoryAudio && playingStoryAudio.src === fullAudioUrl) {
      playingStoryAudio.pause();
      playingStoryAudio.removeEventListener('ended', handleStoryAudioEnd);
      playingStoryAudio.src = ''; // Clear src to free memory
      setPlayingStoryAudio(null);
      return;
    }

    // If different audio is playing, stop it first
    if (playingStoryAudio) {
      playingStoryAudio.pause();
      playingStoryAudio.removeEventListener('ended', handleStoryAudioEnd);
      playingStoryAudio.src = ''; // Clear src to free memory
      setPlayingStoryAudio(null);
    }

    const audio = new Audio(fullAudioUrl);
    audio.preload = 'none'; // Don't preload to save memory
    audio.addEventListener('ended', () => {
      audio.src = ''; // Clear src to free memory
      setPlayingStoryAudio(null);
    });
    
    try {
      await audio.play();
      setPlayingStoryAudio(audio);
    } catch (error) {
      console.error('Error playing story audio:', error);
      audio.src = ''; // Clean up on error
      setPlayingStoryAudio(null);
    }
  };

  const handleStoryAudioEnd = () => {
    if (playingStoryAudio) {
      playingStoryAudio.removeEventListener('ended', handleStoryAudioEnd);
      playingStoryAudio.removeEventListener('pause', handleStoryAudioEnd);
      playingStoryAudio.src = ''; // Clear src to free memory
      setPlayingStoryAudio(null);
    }
  };

  const toggleComments = (photo) => {
    if (expandedComments === photo) {
      setExpandedComments(null);
    } else {
      setExpandedComments(photo);
    }
  };

  const handleDayNavigation = (dayIndex) => {
    const dayElement = document.querySelector(`[data-day-index="${dayIndex}"]`);
    if (dayElement) {
      dayElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.removeEventListener('ended', handleAudioEnd);
        playingAudio.src = ''; // Clear src to free memory
        setPlayingAudio(null);
        setIsPlaying(false);
      }
    };
  }, [playingAudio]);

  // Add throttled scroll event listener to stop audio when scrolling and detect scroll position
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (playingAudio) {
            playingAudio.pause();
            playingAudio.removeEventListener('ended', handleAudioEnd);
            playingAudio.src = ''; // Clear src to free memory
            setPlayingAudio(null);
            setIsPlaying(false);
          }
          
          // Check if scrolled past header (approximately 200px)
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          setIsScrolled(scrollTop > 200);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
      document.body.style.overflow = 'hidden';
    }
    else {
      document.body.style.overflow = '';
    }
  }, [isModalOpen])

  // Cleanup story audio on unmount
  useEffect(() => {
    return () => {
      if (playingStoryAudio) {
        playingStoryAudio.pause();
        playingStoryAudio.removeEventListener('ended', handleStoryAudioEnd);
        playingStoryAudio.src = ''; // Clear src to free memory
        setPlayingStoryAudio(null);
      }
    };
  }, [playingStoryAudio]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="TripRecap" style={{
      backgroundColor: isModalOpen ? 'black' : 'transparent',
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    }}>
      <header className="trip-header">
        <div className="trip-info">
          <div className="header-content">
            <div className="title-section">
              <div className="title-with-profile">
                <h1>Travel Story from {recapData.trip.userName}</h1>
                <img src={fileServer + recapData.trip.profilePicture} alt={recapData.trip.userName} className="profile-picture" loading="eager"/>
              </div>
              <button className="signup-button-header">
                <a href={'https://linkedspaces.com'} target="_blank" rel="noopener noreferrer">Join LinkedSpaces</a>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Day Navigation */}
      {isScrolled && recapData && (
        <div className="sticky-day-nav">
          <div className="day-nav-container">
            <div className="day-nav-buttons">
              {recapData.days.map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  className="day-nav-button"
                  onClick={() => handleDayNavigation(dayIndex)}
                >
                  Day {dayIndex + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Display recap per day */}
      {recapData.days.map((day, dayIndex) => (
        <div key={dayIndex} className="day-container" data-day-index={dayIndex}>
          <h2>Day {dayIndex + 1}: {reformatDate(day.date)}</h2>
          {/* Map for the day */}
          {commentModalOpen===false && 
          <GoogleMap 
            places={day.places}
            onMarkerClick={handleMarkerClick}
            className="day-map"
          />}
          {/* Stories and Photos for the day */}
          <div className="places-container">
            {day.places.map((place, placeIndex) => {
              // Alternate layout for each place
              const layoutClass = placeIndex % 2 === 0 ? 'layout-even' : 'layout-odd';
              return (
                <div key={placeIndex} className={`place-card ${layoutClass}`} data-place-index={placeIndex}>
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
                            loading="lazy"
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
                              onMouseEnter={!isMobile ? (e) => handleAudioHover(photo.audio, e) : undefined}
                              onMouseLeave={!isMobile ? handleAudioHoverEnd : undefined}
                              onClick={(e) => handleAudioPlay(photo.audio, e)}
                              style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 1000
                              }}
                            >
                              <div
                                style={{
                                  border: 'none',
                                  borderRadius: '16px',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
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
                            </div>
                          )}
                        </div>}
                        <p className="photo-story">
                          {(photo.storyAudio?.length??0)>0 && (
                            <button 
                              className={`story-audio-button ${playingStoryAudio?.src === fileServer + photo.storyAudio ? 'playing' : ''}`}
                              onClick={(e) => handleStoryAudioPlay(photo.storyAudio, e)}
                            >
                              {playingStoryAudio?.src === fileServer + photo.storyAudio ? (
                                <IoPause size={20} />
                              ) : (
                                <IoHeadsetOutline size={20} />
                              )}
                            </button>
                          )}
                          {photo.story}
                        </p>
                        {(photo.comments?.length??0)>0 && (
                          <div className="comments-section">
                            <button 
                              className="comments-toggle-button"
                              onClick={() => toggleComments(photo)}
                            >
                              {expandedComments === photo ? (
                                <>
                                  Hide Comments ({photo.comments?.length || 0})
                                  <IoChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  View Comments ({photo.comments?.length || 0})
                                  <IoChevronDown size={16} />
                                </>
                              )}
                            </button>
                            {expandedComments === photo && (
                              <div className="comments-list">
                                {photo.comments?.map((comment) => (
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
                              </div>
                            )}
                          </div>
                        )}
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
        <div className="modal" onClick={closeModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={modalImageSrc} 
              alt="Popup" 
              className="modal-image" 
              onClick={()=>{closeModal()}} 
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
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
    </div>
  );
}

export default TripRecap;