// These constants are injected via webpack environment variables.
// You can add more variables in webpack.common.js or in profile specific webpack.<dev|prod>.js files.
// If you change the values in the webpack config files, you need to re run webpack to update the application

export const VERSION = process.env.VERSION;
export const DEBUG_INFO_ENABLED: boolean = !!process.env.DEBUG_INFO_ENABLED;

export let SERVER_API_URL = 'http://localhost:9091/';
export let MASTER_SERVER_API_URL = 'http://localhost:9093/';
export let DATAINGESTION_SERVER_API_URL = 'http://localhost:9092/api/';
export let USER_MANAGEMENT_SERVER_API_URL = 'http://mumchsem01:9095/';
export let R_MODEL_SERVICE_API_URL = 'http://mumchsem01:9096/';
export let KIBANA_UI_SERVICE_API_URL = 'http://mumchsem01:8200';
export let MODEL_SERVICE_API_URL = 'http://mumchsem01:9099/';

export let KEY_CLOAK_REALM_NAME = 'RMU_DEV';
export let KEY_CLOAK_URL = 'http://34.73.213.130:8080/auth';
export let KEY_CLOAK_CLIENT_ID = 'semui';

export let profile = 'dev';
if (profile === 'dev') {
    SERVER_API_URL = 'http://34.75.107.138/semservice/';                         //GKE with custom istio
    MASTER_SERVER_API_URL = 'http://34.75.107.138/masterservice/';                   //GKE with custom istio
    DATAINGESTION_SERVER_API_URL = 'http://34.75.107.138/dataingestionsrvc/api/'; // GKE with external istio
    USER_MANAGEMENT_SERVER_API_URL = 'http://34.75.107.138/usermanagementsrvc/'; // GKE with external istio
    R_MODEL_SERVICE_API_URL = 'http://34.75.107.138/rservice/';                  // GKE with external istio

    // DATAINGESTION_SERVER_API_URL = 'http://mumchsem01:9094/dataingestionservice/api/';
    // USER_MANAGEMENT_SERVER_API_URL = 'http://mumchsem01:9095/usermanagement/';
    // R_MODEL_SERVICE_API_URL = 'http://mumchsem01:9096/';
    KIBANA_UI_SERVICE_API_URL = 'http://mumchsem01:8200';
    MODEL_SERVICE_API_URL = 'http://mumchsem01:9099/';
} else if (profile === 'qa') {
    SERVER_API_URL = 'http://mumchsem03:9094/semservice/';
    //SERVER_API_URL = 'http://localhost:9091/';
    MASTER_SERVER_API_URL = 'http://mumchsem03:9094/masterservice/';
    //MASTER_SERVER_API_URL = 'http://localhost:9093/';
    DATAINGESTION_SERVER_API_URL = 'http://mumchsem03:9094/dataingestionservice/api/';
    USER_MANAGEMENT_SERVER_API_URL = 'http://mumchsem03:9094/usermanagement/';
    //USER_MANAGEMENT_SERVER_API_URL = 'http://localhost:9095/';
    R_MODEL_SERVICE_API_URL = 'http://mumchsem03:9094/rmodelservice/';
    KIBANA_UI_SERVICE_API_URL = 'http://mumchsem01:8200';
    KEY_CLOAK_REALM_NAME = 'RMU_QA';
} else if (profile === 'uat') {
    SERVER_API_URL = 'http://mumchsem05:9094/semservice/';
    MASTER_SERVER_API_URL = 'http://mumchsem05:9094/masterservice/';
    DATAINGESTION_SERVER_API_URL = 'http://mumchsem05:9094/dataingestionservice/api/';
    USER_MANAGEMENT_SERVER_API_URL = 'http://mumchsem05:9094/usermanagement/';
    R_MODEL_SERVICE_API_URL = 'http://mumchsem05:9094/rmodelservice/';
    KEY_CLOAK_REALM_NAME = 'RMU_UAT';
    KEY_CLOAK_URL = 'http://mumchsem05:8443/auth';
} else if (profile === 'prod') {
    KEY_CLOAK_URL = 'https://auth-rise.crisil.com/auth';
    SERVER_API_URL = 'https://semgateway.crisil.com/semservice/';
    MASTER_SERVER_API_URL = 'https://semgateway.crisil.com/masterservice/';
    DATAINGESTION_SERVER_API_URL = 'https://semgateway.crisil.com/dataingestionservice/api/';
    USER_MANAGEMENT_SERVER_API_URL = 'https://semgateway.crisil.com/usermanagement/';
    R_MODEL_SERVICE_API_URL = 'https://semgateway.crisil.com/rmodelservice/';
    KIBANA_UI_SERVICE_API_URL = 'http://ukcensem02:8200';
    KEY_CLOAK_REALM_NAME = 'RMU_PROD';
}
export const BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP;
