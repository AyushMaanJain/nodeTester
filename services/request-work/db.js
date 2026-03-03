import { Connection, Request, TYPES } from 'tedious';
import { Pool } from 'tarn';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }
  },
  options: {
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '1433'),
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  }
};

const pool = new Pool({
  create: () => {
    return new Promise((resolve, reject) => {
      const connection = new Connection(config);
      connection.on('connect', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
      connection.connect();
    });
  },
  validate: (connection) => {
    return connection.state.name === 'LoggedIn';
  },
  destroy: (connection) => {
    return new Promise((resolve) => {
      connection.on('end', () => resolve());
      connection.close();
    });
  },
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const query = async (sql, params = []) => {
  const connection = await pool.acquire().promise;
  try {
    return await new Promise((resolve, reject) => {
      const results = [];
      const request = new Request(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });

      params.forEach(param => {
        request.addParameter(param.name, param.type, param.value);
      });

      request.on('row', (columns) => {
        const row = {};
        columns.forEach(column => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row);
      });

      connection.execSql(request);
    });
  } finally {
    pool.release(connection);
  }
};

export { TYPES };
