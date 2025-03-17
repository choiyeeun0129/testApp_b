const moment = require('moment');
const { PrismaClient, Prisma } = require("@prisma/client");
const jwt = require('jsonwebtoken');

var errorUtil = {

    message: function(e = 'UnknownError', message = ''){
        let error = null;
        if(typeof e === 'string'){
            error = e;
        } else if (e instanceof Error) {
            error = e.name;
            if(! message) message = e.message;
        }
        
        if(error?.includes('PrismaClient')) message = 'Server Error.';
        if(message?.length > 100) message = 'Server Error.';
        console.error('== error message: ', message);
        console.error(e);
        return {
            success: false,
            error,
            message
        }
    },

};

module.exports = errorUtil;