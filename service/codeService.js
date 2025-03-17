const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

const codeService = {
    get: async function(code){
        return await prisma.codes.findUnique({
            where: { code },
            include: {
                codeGroup: {
                    select: {
                        grpCode: true,
                        name: true
                    }
                }
            }
        });
    },
    list: async function({
        grpCode, code, name, enabled='', 
        page=1, perPage=config.PAGINATION_PER_PAGE, sortColumn, sortAsc=true})
    {
        let where = { grpCode }
        if(code) where.code = { contains: code };
        if(name) where.name = { contains: name };
        if(enabled !== '') {
            if(util.toBool(enabled)) where.enabled = true;
            else where.enabled = false;
        }

        if(! sortColumn) sortColumn='orderSn';
        else if(sortColumn == 'active') sortColumn='enabled';
        let sortAscening = 'asc';
        if(! util.toBool(sortAsc)) sortAscening = 'desc';

        let count = await prisma.codes.count({ where });
        let data = await prisma.codes.findMany({
            where,
            orderBy: [{[sortColumn]: sortAscening}],
            skip: Number((page-1) * perPage),
            take: Number(perPage),
            include: {
                codeGroup: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return {
            contents: data,
            pagination: {
                page: page,
                totalCount: count
            }
        }
    },
    upsert: async function({grpCode, code, name, value, orderSn=1, enabled, memo }){
        if(enabled == '1' || enabled == 'true') enabled = true;
        else enabled = false;

        let where = { code: code };
        let data = { 
            grpCode, code, name, value, enabled, memo, 
            orderSn: Number(orderSn)
        }

        let update = Object.assign({}, data);
        update.updatedAt = moment().format()
        
        let rs = await prisma.codes.upsert({ 
            where, 
            update: update,
            create: data
        });

        return rs;
    },
    delete: async function(code){
        return await prisma.codes.delete({
            where: { code }
        });
    },
    deleteList: async function({ ids = [] }){
        if(! ids || ids.length == 0) return {}
        return await prisma.codes.deleteMany({
            where: {
                code: { in: ids },
            }
        })
    },
}

module.exports = codeService;