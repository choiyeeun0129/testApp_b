const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');
const userService = require('../service/userService.js'); 

const favoritesService = {
    get: async function(id){
        return await prisma.userFavorites.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                target: true
            }
        });
    },
    list: async function(userId, { page=1, perPage=config.PAGINATION_PER_PAGE })
    {
        let where = { 
            userId: Number(userId), 
            target: { deletedAt: null, enabled: true } 
        }
        let count = await prisma.userFavorites.count({ where });
        let data = await prisma.userFavorites.findMany({
            where,
            // orderBy: { taget: { name: 'asc' } },
            skip: Number((page-1) * perPage),
            take: Number(perPage),
            include: {
                // target: true
                target: {
                    select: {
                      id: true,
                      name: true,
                      profileImage: true,
                      birthYear: true,
                      mobileNumber: true,
                      email: true,
                      website: true,
                      graduated: true,
                      companyName: true,
                      level: true,
                      job: true,
                      major: true,
                      isPublic: true,
                      isPublicMobile: true,
                      isPublicOffice: true,
                      isPublicEmail: true,
                      isPublicDepartment: true,
                      isPublicBirth: true,
                      role: true,
                      batch: true,
                      degree: true,
                      course: true,
                    },
                }
            }
        });

        for(let favorites of data){
            if(favorites.target) {
                delete favorites.target?.password;
            }
        }

        return {
            contents: data,
            pagination: {
                page: page,
                totalCount: count
            }
        }
    },
    upsert: async function({ userId, targetId }){
        if(! userId || ! targetId) throw new Error('Invalid parameter!');
        let user = await userService.get(targetId);
        if(! user) throw new Error('Not found target user.');
        let data = { userId: Number(userId), targetId: Number(targetId) }
        await this.delete(data);
        return await prisma.userFavorites.create({ data });
    },
    
    delete: async function({ userId, targetId }){
        if(! userId || ! targetId) throw new Error('Invalid parameter!')
        return await prisma.userFavorites.deleteMany({
            where: { userId: Number(userId), targetId: Number(targetId) }
        });
    },

    deleteList: async function({ ids = [] }){
        if(! ids || ids.length == 0) return {}
        return await prisma.userFavorites.deleteMany({
            where: {
                id: { in: ids },
            }
        })
    },
}

module.exports = favoritesService;