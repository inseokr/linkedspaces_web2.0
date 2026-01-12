const getEnvVariables = () => {
  return {
    REACT_APP_FILE_SERVER_URL: process.env.NEXT_PUBLIC_FILE_SERVER_URL,
    REACT_APP_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    REACT_APP_GOOGLE_MAPS_MAP_ID: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
  };
};

export default getEnvVariables;
