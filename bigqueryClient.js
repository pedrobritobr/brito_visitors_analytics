const {BigQuery} = require('@google-cloud/bigquery');
const {
  DATASET_ID,
  TABLE_ID,
  PROJECT_ID,
  TABLE_AMBIENT,
} = require('./getEnvs')

const tableName = TABLE_ID + TABLE_AMBIENT;

const { GCP_CREDS } = require('./getEnvs')
const options = {
  credentials: GCP_CREDS,
  projectId: PROJECT_ID,
};  

const bigqueryClient = new BigQuery(options);

const insertData = async (row) => {
  console.log("inserting data to database");
  return bigqueryClient.dataset(DATASET_ID).table(tableName).insert([row]);
}

const getData = async () => {
  const [rows] = await bigqueryClient.dataset(DATASET_ID).table(tableName).getRows();
  return rows
}

module.exports = { insertData, getData };
