const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

const snsAccountService = {

    get: async function(id){
        return await prisma.snsAccounts.findUnique({
            where: { id: Number(id) }
        });
    },

    getBySnsId: async function(snsId){
        return await prisma.snsAccounts.findFirst({
            where: { snsId: '' + snsId }
        });
    },

    create: async function(param){
        return await prisma.snsAccounts.create({ data: param });
    },

    update: async function(param){
        return await prisma.snsAccounts.update({ 
            where: { id: Number(param.id) },
            data: { updatedAt: moment().format() }
        });
    },
}

module.exports = snsAccountService;