import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./Highlight.css";
import { Dialog } from "@headlessui/react";
import { formatDate } from "../utils/DateUtils";
import { useParams } from "react-router-dom";
import { defaultIcon, markerWithPlaceInfo } from "../constants/MapConstants";
import { fileServer } from "../constants/ServerUrls";
import Spinner from "../components/Spinner";
import { IoRadioOutline, IoHeadsetOutline, IoPause, IoChevronDown, IoChevronUp } from 'react-icons/io5';

const Highlight = () => {
    const [highlightData, setHighlightData] = useState(null);
    const { userId, id } = useParams();
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [error, setError] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [modalImageSrc, setModalImageSrc] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [playingAudio, setPlayingAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingStoryAudio, setPlayingStoryAudio] = useState(null);
    const [expandedComments, setExpandedComments] = useState(null);

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleImageClick = (imageSrc) => {
        setModalImageSrc(imageSrc);
        setModalOpen(true);
    };

    const handleAudioPlay = async (audioUrl, event) => {
        event.stopPropagation();
        
        // If the same audio is already playing, stop it and reset state
        if (playingAudio && playingAudio.src === fileServer + audioUrl) {
            playingAudio.pause();
            playingAudio.currentTime = 0;
            playingAudio.removeEventListener('ended', handleAudioEnd);
            playingAudio.src = '';
            setPlayingAudio(null);
            setIsPlaying(false);
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
        audio.loop = true;
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

    const handleStoryAudioPlay = async (audioUrl, event) => {
        event.stopPropagation();
        
        // If the same audio is already playing, stop it
        if (playingStoryAudio && playingStoryAudio.src === fileServer + audioUrl) {
            playingStoryAudio.pause();
            playingStoryAudio.removeEventListener('ended', handleStoryAudioEnd);
            setPlayingStoryAudio(null);
            return;
        }

        // If different audio is playing, stop it first
        if (playingStoryAudio) {
            playingStoryAudio.pause();
            playingStoryAudio.removeEventListener('ended', handleStoryAudioEnd);
        }

        const audio = new Audio(fileServer + audioUrl);
        audio.addEventListener('ended', () => {
            setPlayingStoryAudio(null);
        });
        try {
            await audio.play();
            setPlayingStoryAudio(audio);
        } catch (error) {
            console.error('Error playing story audio:', error);
            setPlayingStoryAudio(null);
        }
    };

    const handleStoryAudioEnd = () => {
        if (playingStoryAudio) {
            playingStoryAudio.removeEventListener('ended', handleStoryAudioEnd);
            playingStoryAudio.removeEventListener('pause', handleStoryAudioEnd);
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

    const getPlaceCoverPhoto = (place) => {

        if(!place || ((place.photoList?.length ??0)===0)) {
            return null;
        }

        for (let _photo of place.photoList) {
            if(_photo) return _photo.uri;
        }
        
        return null;
    }

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(()=>{
        if(highlightData) {
            let _coordinates = [];
            highlightData.data.flatMap((day) => day.places).map((place, index)=>{
                _coordinates.push(place.coordinate);
            });

            console.warn(`_coordinates:`, _coordinates.length, _coordinates[0]);
            setCoordinates([..._coordinates]);
        } 
    }, [highlightData])

    useEffect(() => {
        if (userId && id) {
            axios.get(`https://pocketverse.herokuapp.com/LS_API/ls-beta-test/highlight/${userId}/${id}`)
                .then(response => {
                    console.warn(`highlight: `, response.data);
                    setHighlightData(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    setError(error.message);
                    setLoading(false);
                });
        }
    }, [userId, id]);

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

    // Cleanup story audio on unmount
    useEffect(() => {
        return () => {
            if (playingStoryAudio) {
                playingStoryAudio.pause();
                setPlayingStoryAudio(null);
            }
        };
    }, [playingStoryAudio]);

    useEffect(()=>{
        if(isModalOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
    }, [isModalOpen])

    if (loading) return <div>
        <div className="loading">Loading...</div>
        <Spinner />
    </div>;

    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="Highlight" style={{
            backgroundColor: isModalOpen ? 'black' : 'transparent',
            minHeight: '100vh',
            transition: 'background-color 0.3s ease'
        }}>
            <header className="trip-header">
                {highlightData &&
                <div className="trip-info">
                    <h1>{(highlightData.header.title?.length ?? 0 > 0) ? highlightData.header.title : 'Highlight from LinkedSpaces'}</h1>
                    <section className="user-container">
                        <p className="trip-user">
                            Shared from {highlightData.header.userName}
                        </p>
                        <img src={fileServer + highlightData.header.profilePicture} alt="Popup" className="profile-picture" onClick={() => { }} />
                    </section>
                </div>}
            </header>
            
            {coordinates && 
            <div className="day-container">
                <div className="map-container">
                    <MapContainer
                        center={[coordinates[0].latitude, coordinates[0].longitude]}
                        zoom={12}
                        style={{height: '400px', width: "100%" }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {highlightData && highlightData.data.flatMap((day) => day.places).map((place, index) => (
                            <Marker
                                key={index}
                                position={[place.coordinate.latitude, place.coordinate.longitude]}
                                icon={markerWithPlaceInfo(fileServer+getPlaceCoverPhoto(place), place.placeName)}
                            >
                                <Popup>
                                    <div className="text-center">
                                        {place.photo && <img src={place.photo} alt={place.placeName} className="w-40 h-24 object-cover rounded-md mb-2" />}
                                        <h3><a href={place.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecorationLine: 'underline' }}>
                                            {place.placeName}
                                        </a></h3>
                                        <div className="popup-photo-grid">
                                            {place.photoList?.slice(0, 2).map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={fileServer + photo.uri}
                                                    alt={`Photo ${photo.uri}`}
                                                    className="popup-photo"
                                                />
                                            ))}
                                        </div>
                                        <p style={{textAlign: 'center'}}>{formatDate(place.digitizedTime)}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>}
            
            {highlightData && (
                <div className="places-container">
                    {highlightData.data.flatMap((day) => day.places).map((place, placeIndex) => (
                        <div key={placeIndex} className="place-card">
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
                    ))}
                </div>
            )}
            
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
        </div>
    );
};

export default Highlight;
