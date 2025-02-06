
const variables = {
    development: {
    },
 
    production: {
        REACT_APP_FILE_SERVER_URL:'https://s3-us-west-1.amazonaws.com/linkedspaces.fs',
    }
}

const getEnvVariables = () => {
    return variables.production;

    // if (__DEV__) {
    //     return variables.development;
    // }

    // return variables.production;
}

export default getEnvVariables;
