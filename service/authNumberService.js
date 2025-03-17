const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

const authNumberService = {

    generateNumber: function(){
        return (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000) + '';
    },

    getNumber: async function(userId){
        let rs = await prisma.authNumber.findFirst({
            where: { 
                userId: Number(userId),
                updatedAt: { 
                    gte: moment().subtract(5, 'minutes').toDate() // 최근 5분 이내
                }
            }
        });
        return rs?.authNumber + '';
    },

    upsert: async function(req, userId){
        if(! userId || userId <= 0) throw new Error('Invalid Param.');
        let param = {
            userId: Number(userId),
            authNumber: this.generateNumber(),
            userAgent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] ||  req.socket.remoteAddress,
            updatedAt: moment().format()
        }
        let where = { userId: Number(userId) };
        return await prisma.authNumber.upsert({ 
            where, 
            update: param,
            create: param
        });
    },
}

module.exports = authNumberService;