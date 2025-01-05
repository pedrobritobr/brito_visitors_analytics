const express = require('express');
const moment = require('moment-timezone');

require('dotenv').config()

const { PORT, BRT_ANALITYCS_PHRASE } = require('./getEnvs');
const {
  errorHandler,
  getGeolocation,
  getPublicIp,
  appConfig
} = require('./appUtils')
const { insertData, getData } = require('./bigqueryClient');

const app = express();
appConfig(app);

app.get('/', (req, res) => {
  return res.send('hello');
});

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

