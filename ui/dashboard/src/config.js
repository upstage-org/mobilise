const { APP_CONFIG } = process.env;

let configs = {
    API_ENDPOINT: 'http://159.89.19.111/V2.0/',
    AXIOS_TIMEOUT: 10000,
    ACCESS_TOKEN_KEY: 'access_token',
    MQTT_CONNECTION: {
        host: '128.199.69.170',
        port: 9001,
        endpoint: '/mqtt',
        clean: true, // Reserved session
        connectTimeout: 4000, // Time out
        reconnectPeriod: 4000, // Reconnection interval
        retain: true,
        username: 'performance',
        password: 'z48FCTsJVEUkYmtUw5S9',
    }
}

if (APP_CONFIG) {
    const envConfig = JSON.parse(APP_CONFIG);
    configs = {
        ...configs,
        envConfig
    }
}

export default configs;