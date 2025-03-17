const moment = require("moment");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

const userService = {
    get: async function(id, expand = true){
        let include = {};
        if(expand) {
            include = {
                role: true,
                batch: true,
                degree: true,
                course: true,
                imageFile: true
            }
        }
        let user = await prisma.users.findUnique({
            where: { id: Number(id) },
            include
        });
        if(user) {
            delete user.password;
        }
        return user;
    },
    first: async function(param){
        return await prisma.users.findFirst({
            where: param,
            include: {
                role: true,
                batch: true,
                degree: true,
                course: true,
                imageFile: true
            }
        });
    },
    findByMobile: async function(mobile){
        if(! mobile) return null;
        const localFormat = util.convertToLocalFormat(mobile); // +82를 0으로 변환
        const hyphenatedFormat = util.addHyphen(localFormat); // 하이픈 포함 형식으로 변환
        console.log('== ', localFormat);
        console.log('== ', hyphenatedFormat);
        return await prisma.users.findFirst({
            where: {
              AND: [
                { enabled: true },
                {
                  OR: [
                    { mobileNumber: mobile },
                    { mobileNumber: mobile.replace(/\D/g, '') }, // 하이픈 제거
                    { mobileNumber: hyphenatedFormat }, // 하이픈 포함 국내 형식
                    { mobileNumber: localFormat }, // 국내 형식으로 변환된 값
                  ],
                },
              ],
            },
        });
    },
    getFromEmail: async function(email){
        let rs = await prisma.users.findMany({
            where: { email }
        });
        return rs && rs.length > 0 ? rs[0] : null;
    },
    getFromLogin: async function(loginId){
        let rs = await prisma.users.findMany({
            where: { 
                deletedAt: null,
                enabled: true,
                loginId
            }
        });
        return rs && rs.length > 0 ? rs[0] : null;
    },
    list: async function({
        keyword, loginId, name, email, mobileNumber, isPublic='', enabled='',  
        roleCode, batchCode, degreeCode, courseCode, companyName,
        page=1, perPage=config.PAGINATION_PER_PAGE, sortColumn='id', sortAsc=true})
    {
        let where = { deletedAt: null }
        if(keyword) where.AND = { 
            OR: [
                { name: { contains: keyword } },
                { companyName: { contains: keyword } }
            ]
        };
        if(loginId) where.loginId = { contains: loginId };
        if(email) where.email = { contains: email };
        if(name) where.name = { contains: name };
        if(mobileNumber) where.mobileNumber = { contains: mobileNumber };
        if(roleCode) where.roleCode = roleCode;
        if(batchCode) where.batchCode = batchCode;
        if(degreeCode) where.degreeCode = degreeCode;
        if(courseCode) where.courseCode = courseCode;
        if(enabled !== '') {
            if(util.toBool(enabled)) where.enabled = true;
            else where.enabled = false;
        }
        if(isPublic !== '') {
            if(util.toBool(isPublic)) where.isPublic = true;
            else where.isPublic = false;
        }

        if(! sortColumn) sortColumn='id';
        else if(sortColumn == 'active') sortColumn='enabled';
        let sortAscening = 'desc';
        if(util.toBool(sortAsc)) sortAscening = 'asc';

        console.log('== sort: ', sortColumn, sortAscening)
        let count = await prisma.users.count({ where });
        let data = await prisma.users.findMany({
            where,
            orderBy: [{[sortColumn]: sortAscening}],
            skip: Number((page-1) * perPage),
            take: Number(perPage),
            include: {
                role: true,
                batch: true,
                degree: true,
                course: true,
                imageFile: true
            }
        });

        for(let user of data){
            if(user) {
                delete user?.password;
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

    hashPasswrod: function (password){
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    },

    comparePassword: function(password, encryptPw){
        return bcrypt.compareSync(password, encryptPw);
    },

    validateParam: async function(param){

        let id = Number(param.id || 0);
        let data = util.copyObj(param, [
            'loginId', 'password', 'name', 'birthYear', 'mobileNumber', 'email', 'website', 'memo',
            'roleCode', 'batchCode', 'degreeCode', 'courseCode', 'profileImage',
            'companyName', 'retirement', 'officeAddress', 'officePhone', 'level', 'job', 'major', 'advisor', 
            'graduated', 'isPublicMobile', 'isPublicOffice', 'isPublicEmail', 'isPublicDepartment', 'isPublicBirth', 'enabled'
        ])

        // 신규 생성시
        if(id == 0) {
            if(! data.loginId || ! data.email || !data.mobileNumber || ! data.name) throw new Error('Invalid Parameter !')
        }

        // loginId check duplicate
        if(data.loginId){
            let where = { 
                id: { not: id },
                loginId: data.loginId
            }
            let rs = await prisma.users.findMany({ where });
            if(rs.length > 0) throw new Error('Duplicated Login Id.')
        }

        // email check duplicate
        if(data.email) {
            let where = { 
                id: { not: id },
                email: data.email
            }
            let rs = await prisma.users.findMany({ where });
            if(rs.length > 0) throw new Error('Duplicated Email.')
        }

        // mobileNumber check duplicate
        if(data.mobileNumber) {
            data.mobileNumber = util.convertToLocalFormat(data.mobileNumber); // +82를 0으로 변환
            data.mobileNumber = data.mobileNumber.replace(/\D/g, "");
            let where = { 
                id: { not: id },
                mobileNumber: data.mobileNumber
            }
            let rs = await prisma.users.findMany({ where });
            if(rs.length > 0) throw new Error('Duplicated mobileNumber.')
        }

        if(data.enabled) data.enabled = util.toBool(data.enabled);
        if(data.graduated) data.graduated = util.toBool(data.graduated);
        if(data.retirement) data.retirement = util.toBool(data.retirement);
        if(data.isPublic) data.isPublic = util.toBool(data.isPublic);
        if(data.isPublicMobile) data.isPublicMobile = util.toBool(data.isPublicMobile);
        if(data.isPublicOffice) data.isPublicOffice = util.toBool(data.isPublicOffice);
        if(data.isPublicEmail) data.isPublicEmail = util.toBool(data.isPublicEmail);
        if(data.isPublicDepartment) data.isPublicDepartment = util.toBool(data.isPublicDepartment);
        if(data.isPublicBirth) data.isPublicBirth = util.toBool(data.isPublicBirth);
        if(data.birthYear) data.birthYear = Number(data.birthYear);
        if(data.profileImage) data.profileImage = Number(data.profileImage);

        // password hashing..
        if(data.password && data.password.length > 0) {
            if(data.password < 8) throw new Error('Invalid Param! \n비밀번호 길이 최소 8자리 이상으로 해주세요.');
            else data.password = this.hashPasswrod(data.password);
        } else {
            delete data.password;
        }
        return data;
    },

    upsert: async function(param){
        let data = await this.validateParam(param);
        
        let where = { id: Number(param.id || 0) };
        // deep copy
        let update = JSON.parse(JSON.stringify(data));
        data.enabled = false;
        update.updatedAt = moment().format()

        console.log('== create data: ', data);
        console.log('== update data: ', update);
        let user = await prisma.users.upsert({ 
            where, 
            update: update,
            create: data
        });

        if(user) delete user.password;
        return user;
    },

    update: async function(param){
        let id = Number(param.id || 0);
        if(id == 0) throw new Error('Invalid Param.');
        let data = await this.validateParam(param);
        let where = { id };
        console.log('== data: ', data);
        let user = await prisma.users.update({ 
            where, data
        });
        if(user) delete user.password;
        return user;
    },

    setEnabled: async function(userId, enabled = false){
        if(! userId) throw new Error('Invalid Param!');
        await prisma.users.update({ 
            where: { id: Number(userId) }, 
            data: { 
                enabled: enabled,
                updatedAt: moment().format()
            }
        });
        return true;
    },

    updatePassword: async function(userId, password){
        if(! userId || ! password) throw new Error('Invalid Param!');
        if(password.length < 8) throw new Error('Invalid Param! \n비밀번호 길이 최소 8자리 이상으로 해주세요.');
        await prisma.users.update({ 
            where: { id: Number(userId) }, 
            data: { 
                password: this.hashPasswrod(password),
                updatedAt: moment().format()
            }
        });
        return true;
    },

    updateIdPw: async function(userId, loginId, password){
        if(! userId || ! loginId || ! password) throw new Error('Invalid Param!');
        if(password.length < 8) throw new Error('Invalid Param! \n비밀번호 길이 최소 8자리 이상으로 해주세요.');
        
        let rs = await prisma.users.findMany({
            where: {
                deletedAt: null,
                id: { not: Number(userId) },
                loginId: loginId
            }
        });
        if(rs.length > 0) throw new Error('Duplicated login ID!');

        await prisma.users.update({ 
            where: { id: Number(userId) }, 
            data: { 
                loginId: loginId,
                password: this.hashPasswrod(password),
                updatedAt: moment().format()
            }
        });

        return true;
    },

    delete: async function(id){
        // return await prisma.users.delete({
        //     where: { id: Number(id) }
        // });
        if(!id) return null;
        return await prisma.users.update({
            where: {
                id: Number(id)
            },
            data: {
                deletedAt: moment().format()
            },
        })
    },

    deleteList: async function({ ids = [] }){
        if(! ids || ids.length == 0) return {}
        return await prisma.users.updateMany({
            where: {
                id: { in: ids },
            },
            data: {
                deletedAt: moment().format()
            },
        })
    },
}

module.exports = userService;