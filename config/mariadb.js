const mariadb = require('mariadb');
const config = require('../env/config');

let pool;
let connection;

const mariadbModule = {

    createPool: async function() {
        if(! pool) {
            console.log(`🔥 [DEBUGㅎㅎㅎㅎㅎ] MARIADB CONFIG:`, config.MARIADB);
            pool = await mariadb.createPool(config.MARIADB);
        }
    },

    connect : async function() {
        console.debug(`== mariadb connect`);
        try {
            await this.createPool();
            connection = await pool.getConnection();
            if(connection) console.debug('mariadb connect ok!');
            else console.debug('mariadb connect error!');
        } catch (e) {
            console.error(e);
        }
    },

    getConn: async function() {
        await this.createPool();
        return await pool.getConnection();
    },

    release: function(){
        if (connection) return connection.release();
    },

    close: function(){
        if (connection) return connection.end();
    }

};

module.exports = mariadbModule;