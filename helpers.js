const useragent = require('express-useragent');
const axios = require('axios');
const express = require('express');

const { IP_GEOLOCATION_API_KEY } = require('./getEnvs')

const appConfig = (app) => {
  app.set('trust proxy', true);
  app.use(useragent.express());
  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, keyword');
    next();
  });
}

const errorHandler = (res, error) => {
  console.error(error);
  return res.status(500).send('Erro interno no servidor');
}

const getGeolocation = async (ip) => {
  try {
      const IP_GEOLOCATION_URL = "https://api.ipgeolocation.io/ipgeo"
      const params = {
        apiKey: IP_GEOLOCATION_API_KEY,
        ip: ip ===  "::1" ? null : ip
      }
      const response = await axios.get(`${IP_GEOLOCATION_URL}`, {params})
      return response.data;
  } catch (error) {
      console.error("Erro ao obter localização:", error.message);
      return null;
  }
};

module.exports = {
  errorHandler,
  getGeolocation,
  appConfig
}