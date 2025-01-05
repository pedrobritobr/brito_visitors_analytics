const express = require('express');
const moment = require('moment-timezone');
const useragent = require('express-useragent');
const axios = require('axios');

require('dotenv').config()

const { PORT, BRT_ANALITYCS_PHRASE, IP_GEOLOCATION_API_KEY } = require('./getEnvs')
const { insertData, getData, getLastData } = require('./bigqueryClient');

const app = express();

app.set('trust proxy', true);
app.use(useragent.express());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, keyword');
  next();
});

const errorHandler = (res, error) => {
  console.error(error);
  return res.status(500).send('Erro interno no servidor');
}

app.get('/ping', (req, res) => {
  return res.send('pong');
});

app.post('/login', async (req, res) => {
  try {
    if (req.headers.keyword !== BRT_ANALITYCS_PHRASE) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.status(200).json({ message: 'Authorized' });
  }
  catch (error) {
  return errorHandler(res, error);
  }
});

const getGeolocation = async (ip) => {
    try {
        const IP_GEOLOCATION_URL = "https://api.ipgeolocation.io/ipgeo"
        const params = {
          apiKey: IP_GEOLOCATION_API_KEY,
          ip
        }
        const response = await axios.get(`${IP_GEOLOCATION_URL}`, {params})
        return response.data;
    } catch (error) {
        console.error("Erro ao obter localização:", error.message);
        return null;
    }
};

const getPublicIp = async () => {
  try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
  } catch (error) {
      console.error("Erro ao buscar IP público:", error.message);
      return null;
  }
};

app.get('/insert', async (req, res) => {
  try {
    if (req.headers.keyword !== BRT_ANALITYCS_PHRASE) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log("collecting data from user");

    const ip = await getPublicIp();
    const geoData = await getGeolocation(ip);

    const userInfo = {
        ip,
        userAgent: req.get('User-Agent'),
        os: req.useragent.platform,
        browser: req.useragent.browser,
        browserVersion: req.useragent.version,
        tsIngestionBRT: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss'),
        host: req.headers.host,
        hostname: req.hostname,
        url: req.url,
        method: req.method,
        location: geoData ? {
            city: geoData.city,
            state_prov: geoData.state_prov,
            country: geoData.country_name,
            continent: geoData.continent_name,
            latitude_longitude: `${geoData.latitude}, ${geoData.longitude}`,
            isp: geoData.isp,
        } : null,
    };
    await insertData(userInfo);
    return res.status(201).end();
  }
  catch (error) {
    return errorHandler(res, error);
  }

});

app.get('/view', async (req, res) => {
  try {
    if (req.headers.keyword !== BRT_ANALITYCS_PHRASE) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const response = await getData();
    return res.status(200).json(response);
    
  } catch (error) {
    return errorHandler(res, error);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

