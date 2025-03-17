const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

const documentService = {
    get: async function(id){
        let user = await prisma.documents.findUnique({
            where: { id: Number(id) },
            include: {
                type: true,
            }
        });
        return user;
    },
    list: async function({
        typeCode, title,
        page=1, perPage=config.PAGINATION_PER_PAGE, sortColumn='id', sortAsc=false})
    {
        let where = {  }
        if(title) where.title = { contains: title };
        if(typeCode) where.typeCode = typeCode;

        let sortAscening = 'desc';
        if(util.toBool(sortAsc)) sortAscening = 'asc';

        let count = await prisma.documents.count({ where });
        let data = await prisma.documents.findMany({
            where,
            orderBy: [{[sortColumn]: sortAscening}],
            skip: Number((page-1) * perPage),
            take: Number(perPage),
            include: {
                type: true,
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

    upsert: async function({id=0, typeCode, title, content}){

        let where = { id: Number(id) };
        let data = { typeCode, title, content }
        let update = { typeCode, title, content };
        update.updatedAt = moment().format()

        return await prisma.documents.upsert({ 
            where, 
            update: update,
            create: data
        });
    },

    delete: async function(id){
        return await prisma.documents.delete({
            where: { id: Number(id) }
        });
    },
    deleteList: async function({ ids = [] }){
        if(! ids || ids.length == 0) return {}
        return await prisma.documents.updateMany({
            where: {
                id: { in: ids },
            },
            data: {
                deletedAt: moment().format()
            },
        })
    },
}

module.exports = documentService;