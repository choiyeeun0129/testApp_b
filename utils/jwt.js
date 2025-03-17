const moment = require('moment');
const jwt = require('jsonwebtoken');
const config = require("../env/config");

const ACCESS_TOKEN_SECRET = config.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET; 
// Expire Time
const ACCESS_TOKEN_LIFE = config.ACCESS_TOKEN_LIFE * 60; // seconds
const REFRESH_TOKEN_LIFE = config.REFRESH_TOKEN_LIFE * 60; // seconds

var jwtUtil = {

    getFromHeader:  function(req){
        let token = null;
        if('authorization' in req.headers ){
            let arr = req.headers.authorization.split(" ");
            if(arr && arr.length > 0) token = arr[1];
        }
        // console.debug('jwtUtil:accessToken - ', token);
        return token;
    },

    // deprecated
    getRefreshFromHeader:  function(req){
        // header['x-auth-token'] = "{token}"
        let token = null;
        if('x-auth-token' in req.headers ){
            token = req.headers['x-auth-token'];
        }
        console.debug('jwtUtil:refreshToken - ', token);
        return token;
    },

    // access token 생성
    sign : function(payload){
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
                algorithm: "HS256",
                expiresIn: ACCESS_TOKEN_LIFE
        }) 
    },

    // refresh token 생성
    signRefresh : function(payload){

        console.log('== payload: ', payload);
        console.log('== ACCESS_TOKEN_SECRET: ', ACCESS_TOKEN_SECRET);
        console.log('== REFRESH_TOKEN_SECRET: ', REFRESH_TOKEN_SECRET);
        console.log('== ACCESS_TOKEN_LIFE: ', ACCESS_TOKEN_LIFE);
        console.log('== REFRESH_TOKEN_LIFE: ', REFRESH_TOKEN_LIFE);

        return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: REFRESH_TOKEN_LIFE
        })
    },

    verify : function(token, ignoreExpiration = false){
        return jwt.verify(token, ACCESS_TOKEN_SECRET, { ignoreExpiration });
    },

    verifyRefresh : function(token){
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    },

    decode: function(token){
        return jwt.decode(token, ACCESS_TOKEN_SECRET);
    },

    getRefreshTokenExpiredTime: function(){
        return moment().add(REFRESH_TOKEN_LIFE, 'seconds');
    },
};

module.exports = jwtUtil;