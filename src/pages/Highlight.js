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

    const handleImageClick = (imageSrc) => {
        if (isMobile) {
          setModalImageSrc(imageSrc);
          setModalOpen(true);
        }
      };

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

    const toggleModal = (place) => {
        setSelectedPlace(place);
        setModalOpen(true);
    };

    return <div style={{
    }}
    >
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
         {coordinates && <div 
            style={{
                width: window.innerWidth*0.8,
                margin: "0 auto",
                paddingTop: 10,
            }}
            className="container"
            ><MapContainer
            center={[coordinates[0].latitude, coordinates[0].longitude]}
            zoom={12}
            style={{height: '400px', width: "100%" }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {highlightData && highlightData.data.flatMap((day) => day.places).map((place, index) => (
                <Marker
                    key={index}
                    position={[place.coordinate.latitude, place.coordinate.longitude]}
                    icon={markerWithPlaceInfo(fileServer+place.photoList[0].uri, place.placeName)}
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
        </MapContainer></div>}
        {!isMobile && highlightData && (
                <div 
                    style={{
                        width: window.innerWidth*0.8,
                        margin: "0 auto",
                        marginTop: 10
                        }}
                    className="container" 
                        >
                    {highlightData.data.map((day) => (
                        <div key={day.date} className="mb-4">
                            {day.places.map((place, index) => (
                                <div key={index} className="place-card" onClick={() => toggleModal(place)}>
                                    {place.photo && <img src={place.photo} alt={place.placeName} className="w-full h-32 object-cover rounded-md mb-2" />}
                                    <h3><a href={place.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecorationLine: 'underline' }}>
                                        {place.placeName}
                                    </a></h3>
                                    <p className="text-sm text-gray-600">{formatDate(place.digitizedTime)}</p>
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
                                                {(photo.audio?.length ?? 0) > 0 &&
                                                    <audio controls className="photo-audio">
                                                        <source src={fileServer + photo.audio} type="audio/mpeg" />
                                                        Your browser does not support the audio element.
                                                    </audio>}
                                                {(photo.storyAudio?.length ?? 0) > 0 &&
                                                    <audio controls className="photo-audio">
                                                        <source src={fileServer + photo.storyAudio} type="audio/mpeg" />
                                                        Your browser does not support the audio element.
                                                    </audio>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
       
    </div>
};

export default Highlight;
