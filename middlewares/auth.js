const jwt = require('jsonwebtoken');
const url = require('url');
const utils = require('../utils/default');
const jwtUtil = require('../utils/jwt');
const error = require('../utils/error');
const authService = require('../service/authService');
const userService = require('../service/userService.js');

const AuthMiddleware = {
    
    // 인증 체크
    checkLogin : async (req, res, next) => {

        // header.authorization = "Bearer {token}"
        // accessToken
        console.log('== url: ', req.url)
        let token = jwtUtil.getFromHeader(req);
        if(! token) {
            return res.status(401).json(error.message('Unauthorized', 'Token is mmissing'))
        }

        // verify
        try {
            let ignoreExpiration = false;
            if(req.url == '/refresh') ignoreExpiration = true;
            let payload = jwtUtil.verify(token, ignoreExpiration); 
            console.debug('>> check:payload', payload);
            if(! payload) return res.status(401).json(error.message('InvalidPayload', 'Payload is missing required fields'));
            req.tokenPayload = payload;
            req.user = await userService.get(payload.userId);
        } catch(e) {
            if(e.name === 'TokenExpiredError' && req.headers['x-client-type'] === 'web') return res.json(error.message(e));
            else return res.status(401).json(error.message(e));
        }
        next();
    },

    // 권한 체크
    checkLoginWithRole: (requiredRole) => {
        return async (req, res, next) => {
            // 먼저 checkLogin을 호출하여 로그인 상태 확인
            await AuthMiddleware.checkLogin(req, res, async (err) => {
                if (err) return res.status(403).json(error.message('Forbidden', 'You do not have permission to access this resource'));

                // checkLogin 성공 후 권한 체크
                if (requiredRole && req.user?.role?.value !== requiredRole) {
                    return res.status(403).json(error.message('Forbidden', 'You do not have permission to access this resource'));
                }

                // 권한 체크 통과 시 다음 미들웨어 호출
                next();
            });
        };
    },
    
    // 인증체크(오류 무시, logout 용)
    onlyCheck : async (req, res, next) => {
        try {
            // accessToken
            let token = jwtUtil.getFromHeader(req);
            if(token) {
                let payload = jwtUtil.verify(token); 
                if(payload) req.tokenPayload = payload;
            }
        } catch(e) {}
        next();
    }

};

module.exports = AuthMiddleware;