const moment = require("moment");
const dates = require('../../utils/dates');
const mariadb = require('../../config/mariadb.js');

const TABLE_NAME = "system_config";

const configModel = {
    list: async function({enabled}){
        let conn = await mariadb.getConn();
        try {
            let where = '';
            let param = [];
            if(enabled) {
                where = `WHERE enabled=?`;
                param.push(`1`);
            }

            let sql = `SELECT * FROM ${TABLE_NAME} ${where} ORDER BY name ASC`;
            return await conn.query(sql, param);
        } catch (e) {
            console.error(`configModel list error`, e);
        } finally {
            mariadb.release();
        }
        return null;
    },
}

module.exports = configModel;
