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

const updateSchemaTable = async (columnName, parentColumnName = null, fieldType) => {
  const [table] = await bigquery.dataset(DATASET_ID).table(tableName).get();
  const schema = table.metadata.schema;

  if (parentColumnName) {
    return {
      fields: schema.fields.map((field) => {
        if (field.name === parentColumnName) {
          return {
            ...field,
            fields: [
              ...(field.fields || []),
              { name: columnName, type: fieldType, mode: "NULLABLE" },
            ],
          };
        }
        return field;
      }),
    };
  }
  return {
    fields: [
      ...schema.fields,
      { name: columnName, type: fieldType, mode: "NULLABLE" },
    ],
  };
}

const addFieldToTable = async (columnName, parentColumnName = null, fieldType) => {
  try {
    const schema = updateSchemaTable(columnName, parentColumnName, fieldType);
    await bigquery.dataset(datasetId).table(tableId).setMetadata({ schema });

    console.log(`Esquema da tabela atualizado com sucesso: ${columnName}`);
    return
  } catch (error) {
    console.error('Erro ao atualizar o esquema da tabela:', error);
  }
};

module.exports = { insertData, getData, addFieldToTable };
