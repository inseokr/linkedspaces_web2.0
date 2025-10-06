const getEnvVariables = () => {
    // Always use environment variables - no hardcoded credentials
    return {
        REACT_APP_FILE_SERVER_URL: process.env.REACT_APP_FILE_SERVER_URL,
        REACT_APP_GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        REACT_APP_GOOGLE_MAPS_MAP_ID: process.env.REACT_APP_GOOGLE_MAPS_MAP_ID,
    };
}

export default getEnvVariables;