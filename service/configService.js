const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');
const configModel = require('../models/mariadb/configModel.js');

console.log("🔥 [DEBUG]  MARIADB_DB 환경 변수:", process.env.MARIADB_DB);
console.log("🔥 [DEBUG]  NODE_ENV 환경 변수:", process.env.NODE_ENV);
console.log("🔥 [DEBUG]  MARIADB_URL 환경 변수:", process.env.MARIADB_URL);


const configService = {
    setEnv: async function(){
        let values = await configModel.list({ enabled: 1});
        let env = {}
        for(let val of values){
            env[val.name] = val.value;
        }
        config.set(env);
    },
    get: async function(id){
        return await prisma.systemConfig.findUnique({
            where: { id }
        });
    },
    list: async function({ enabled='' })
    {
        let where = { deletedAt: null }
        if(enabled !== '') {
            if(util.toBool(enabled)) where.enabled = true;
            else where.enabled = false;
        }
        return await prisma.systemConfig.findMany({
            where,
            orderBy: [{ orderSn: 'asc'}],
        });
    },
    update: async function({ id, value }, tx = prisma){
        if(! id) throw new Error('System config update failed. ID is empty');
        return await tx.systemConfig.updateMany({
            where: { id: Number(id), editable: true },
            data: {
                value,
                updatedAt: moment().format()
            }
        });
    },
    updateList: async function(params){
        let rs = await prisma.$transaction(async(tx) => {
            for(let row of params) await this.update(row, tx);
            return { count: params.length }
        },
        {
            maxWait: 60000, // 60 seconds
            timeout: 300000, // 5 minute
        });
        this.setEnv();
        return rs;
    },
}

module.exports = configService;