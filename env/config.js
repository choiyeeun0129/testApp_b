const dotenv = require('dotenv');

let path;
switch (process.env.NODE_ENV) {
  case "production":
    path = `${__dirname}/../.env.production`;
    break;
  case "development":
    path = `${__dirname}/../.env.development`;
    break;
  default:
    path = `${__dirname}/../.env.local`;
}
console.debug(`== NODE_ENV:${process.env.NODE_ENV}`);
console.debug(`== path: ${path}`);
dotenv.config({ path: path });

const config = {

    NODE_ENV : process.env.NODE_ENV || 'development',
    LOG_LEVEL : process.env.LOG_LEVEL || 'debug',
    
    //=======================
    // server setttings
    //=======================
    SERVER_PORT : process.env.SERVER_PORT || 3000,
    WEBSOCKET_PORT : process.env.WEBSOCKET_PORT || 3001,

    MARIADB_URL: process.env.MARIADB_URL,
    MARIADB: {
      host: process.env.MARIADB_HOST || 'localhost',
      port: process.env.MARIADB_PORT || 3306,
      user: process.env.MARIADB_USER,
      password: process.env.MARIADB_PASSWD,
      database: process.env.MARIADB_DB,
      charset : 'utf8mb4',
      connectionLimit: 10,
    },

    //=======================
    // program setttings
    //=======================

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE || 60,
    REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE || 20160,

    // upload
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    UPLOAD_FILE_NAME_SIZE: process.env.UPLOAD_FILE_NAME_SIZE || 100,
    UPLOAD_FILE_SIZE: process.env.UPLOAD_FILE_SIZE || 10,
    UPLOAD_FILE_COUNT: process.env.UPLOAD_FILE_COUNT || 1, 
    UPLOAD_IMAGE_MAX_WIDTH: process.env.UPLOAD_IMAGE_MAX_WIDTH || 5000,

    // pagination
    PAGINATION_PER_PAGE: 30,

    EMAIL_SENDER: process.env.EMAIL_SENDER || '',
    EMAIL_PW: process.env.EMAIL_PW || '',
    SMS_SENDER: process.env.SMS_SENDER || '',
    SMS_API_KEY: process.env.SMS_API_KEY || '',
    SMS_API_SECRET: process.env.SMS_API_SECRET || '',


    set: function(values){
      console.debug(`== set config`);
      if(! values) return;
      for (const [key, value] of Object.entries(values)) {
        console.debug(`${key} : ${value}`);
        if(key in this) this[key] = value;
      }
    }
  };

  module.exports = config;