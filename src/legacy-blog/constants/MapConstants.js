import L from 'leaflet';

// Custom marker icon
export const defaultIcon = (index) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: #007bff; color: white; 
        width: 30px; height: 30px; display: flex; 
        align-items: center; justify-content: center; 
        border-radius: 50%; font-size: 14px;">${index}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15], // Center the icon
    });

export const markerWithPlaceInfo = (imgUri, placeName) =>
        L.divIcon({
          className: "custom-marker",
            html: `<div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="background-color:rgb(246, 246, 247); color: white; 
                    width: 45px; height: 45px; display: flex; 
                    align-items: center; justify-content: center; 
                    border-radius: 50%; font-size: 14px;">
                    <img src="${imgUri}" class="photo" style="width: 100%; height: 100%; border-radius: 50%;" />
                </div>
                <span style="margin-top: 4px; font-size: 12px; color: black; font-weight: bold; max-width: 100px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    ${placeName}
                </span>
            </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15], // Center the icon
        });
  
  export const polylineOptions = {
    color: "#007bff",        // Line color
    weight: 2,            // Line thickness
    dashArray: "4 8",     // Pattern for dashes (4px dash, 8px space)
  };