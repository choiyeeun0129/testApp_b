const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

const userDepartmentService = {
    get: async function(id){
        let user = await prisma.userDepartments.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                degree: true,
                course: true
            }
        });
        return user;
    },
    list: async function(userId, {
        departmentId, name, degreeCode, courseCode, officeNumber, enabled='', 
        page=1, perPage=config.PAGINATION_PER_PAGE, sortColumn='id', sortAsc=false})
    {
        let where = { userId: Number(userId), deletedAt: null }
        if(degreeCode) where.degreeCode = degreeCode;
        if(courseCode) where.courseCode = courseCode;
        if(name) where.name = { contains: name };
        if(officeNumber) where.officeNumber = { contains: officeNumber };
        if(Number(departmentId) > 0) where.departmentId = Number(departmentId);

        if(enabled !== '') {
            if(util.toBool(enabled)) where.enabled = true;
            else where.enabled = false;
        }

        let sortAscening = 'desc';
        if(util.toBool(sortAsc)) sortAscening = 'asc';

        let count = await prisma.userDepartments.count({ where });
        let data = await prisma.userDepartments.findMany({
            where,
            orderBy: [{[sortColumn]: sortAscening}],
            skip: Number((page-1) * perPage),
            take: Number(perPage),
            include: {
                user: true,
                degree: true,
                course: true
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

    upsert: async function(param){
        let id = Number(param.id || 0);
        delete param.id;
        delete param.deletedAt;

        param.departmentId = util.toNum(param.departmentId) == 0 ? null : util.toNum(param.departmentId);
        if(param.enabled) param.enabled = util.toBool(param.enabled);

        let where = { id };
        let data = param
        let update = param;
        update.updatedAt = moment().format()

        return await prisma.userDepartments.upsert({ 
            where, 
            update: update,
            create: data
        });
    },

    delete: async function(id){
        return await prisma.userDepartments.delete({
            where: { id: Number(id) }
        });
    },
    deleteList: async function({ ids = [] }){
        if(! ids || ids.length == 0) return {}
        return await prisma.userDepartments.updateMany({
            where: {
                id: { in: ids },
            },
            data: {
                deletedAt: moment().format()
            },
        })
    },
}

module.exports = userDepartmentService;