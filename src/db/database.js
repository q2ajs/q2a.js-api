import Sequelize from 'sequelize';
import mysql from 'mysql';
import config from './config.js';

let db = null;
const models = new Map();
const isInTestMode = process.env.JEST_WORKER_ID;

const createDatabaseIfNotExist = (rawSQLConnection) => {
  return new Promise((resolve, reject) => {
    rawSQLConnection.connect(err => {
      if (err) reject(err);
      console.log('Connected!');
      rawSQLConnection.query(`CREATE DATABASE IF NOT EXISTS  ${config.database}`, (err2) => {
        if (err2) reject(err2);
        console.log('Database created');
        rawSQLConnection.close();
        resolve();
      });
    });
  });
};

const databaseUtils = () => {
  const makeDb = async () => {
    if (!isInTestMode) {
      console.log('HERE ?');
      const rawSQLConnection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
      });

      await createDatabaseIfNotExist(rawSQLConnection);
    }

    const sequelize = isInTestMode
      ? new Sequelize('sqlite::memory:', { logging: false })
      : new Sequelize(config.database, config.user, config.password, {
          host: config.host,
          port: config.port,
          dialect: 'mysql',
          pool: {
            max: 5,
            min: 0,
            idle: 10000,
          },
        });
    //
    try {
      await sequelize.authenticate();
      // console.log('Connection established successfully.');
    } catch (err) {
      console.error('Unable to connect to the database:', err);
      sequelize.close();
    }
    return sequelize;
  };

  return {
    getSequelize: async () => {
      if (!db) {
        db = await makeDb();
      }
      return db;
    },
    cacheModel: (key, model) => {
      models.set(key, model);
    },
    loadModel: (key) => {
      return models.get(key);
    },
  };
};

export default databaseUtils;
