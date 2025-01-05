require('dotenv').config()

const dotEnv = process.env;
const env = {
  PORT: dotEnv.PORT || 3030,
  BRT_ANALITYCS_PHRASE: dotEnv.BRT_ANALITYCS_PHRASE,
  IP_GEOLOCATION_API_KEY: dotEnv.IP_GEOLOCATION_API_KEY,
  GCP_CREDS: JSON.parse(dotEnv.GCP_CREDS),
  DATASET_ID: dotEnv.DATASET_ID,
  TABLE_ID: dotEnv.TABLE_ID,
  TABLE_AMBIENT: dotEnv.TABLE_AMBIENT,
  PROJECT_ID: dotEnv.PROJECT_ID,
}

if (Object.values(env).includes(undefined)) {
  throw new Error('An environment variable is not defined.');
}

module.exports = { ...env }
