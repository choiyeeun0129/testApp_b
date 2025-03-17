const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

const codeGroupService = {
    get: async function(grpCode){
        return await prisma.codeGroups.findUnique({
            where: { grpCode }
        });
    },
    list: async function({
        grpCode, name, memo, 
        page=1, perPage=config.PAGINATION_PER_PAGE, sortColumn, sortAsc=true})
    {
        let where = { }
        if(grpCode) where.grpCode = { contains: grpCode };
        if(name) where.name = { contains: name };
        if(memo) where.memo = { contains: memo };

        if(! sortColumn) sortColumn='grpCode';
        else if(sortColumn == 'active') sortColumn='enabled';
        let sortAscening = 'asc';
        if(! util.toBool(sortAsc)) sortAscening = 'desc';

        let count = await prisma.codeGroups.count({ where });
        let data = await prisma.codeGroups.findMany({
            where,
            orderBy: [{orderSn: 'asc'}, {[sortColumn]: sortAscening}],
            skip: Number((page-1) * perPage),
            take: Number(perPage)
        });
        return {
            contents: data,
            pagination: {
                page: page,
                totalCount: count
            }
        }
    },
    upsert: async function({grpCode, name, memo}){
        let where = { grpCode: grpCode };
        let data = { grpCode, name, memo }
        let update = Object.assign({}, data);
        update.updatedAt = moment().format()

        return await prisma.codeGroups.upsert({ 
            where, 
            update: update,
            create: data
        });
    },
    delete: async function(grpCode){
        return await prisma.codeGroups.delete({
            where: { grpCode }
        });
    },
    deleteList: async function({ ids = [] }){
        if(! ids || ids.length == 0) return {}
        return await prisma.codeGroups.deleteMany({
            where: {
                grpCode: { in: ids },
            }
        })
    },
}

module.exports = codeGroupService;