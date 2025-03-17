const moment = require("moment");
const axios = require('axios');
const qs = require('qs');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const { v4: uuidv4 } = require('uuid');
const jwtUtil = require('../utils/jwt');
const userService = require('../service/userService.js'); 
const snsAccountService = require('../service/snsAccountService.js'); 
const {verifyAppleToken} = require('../utils/verifyAppleToken.js');
/* 

로그인
- access token, refresh token 생성 후 전달
- refresh token -> DB에 저장

Verify
- access token 기간 만료시 -> TOKEN_EXPIRED 에러 코드 전달

Refresh
- access token, refresh token 모두 재발급
- refresh token 기간 만료시 -> 인증 실패
- 발급자, 위조여부 검사

로그아웃
- DB에 저장된 refresh token 삭제

*/

const AuthService = {

    // login
    signin : async function(req, res){      
        const { loginId, password } = req.body;
        if(! loginId || ! password) throw new Error('Login id, password is required.');
        console.log('== ', loginId, password);

        let user = await userService.getFromLogin(loginId);
        if(! user) throw new Error('Login Id not exist.');
        if(! userService.comparePassword(password, user.password)) throw new Error('Password not match.');

        this.saveAuthLog(user, req);
        return await this.createToken(req, res, user);
    },

    // logon
    signon : async function(user, { loginId, password }){      
        if(! loginId || ! password) throw new Error('Invalid param!');
        if(! user) throw new Error('Not found user.')
        await userService.updateIdPw(user.id, loginId, password);
        await userService.setEnabled(user.id, true);
        return await userService.get(user.id);
    },
    
    // refreshtoken 만으로 accesstoken 재생성.
    refresh : async function(req, res, refreshToken){
        if(!refreshToken) throw new Error('Refresh token invalid');
        
        // virefy
        // refresh token -> 만료되었을 경우 실패 처리
        let payloadRefresh = jwtUtil.verifyRefresh(refreshToken);
        // DB에 저장된 토큰과 일치하는지 검사, userId(발급대상자)도 검증됨.
        let _refresh = await this.getRefreshToken(payloadRefresh.userId);
        if(_refresh !== refreshToken) throw new Error('Refresh token invalid');

        let user = await userService.get(payloadRefresh.userId);
        // accessToken만 재생성
        return await this.createToken(req, res, user, refreshToken);
    },

    createToken: async function(req, res, user, refreshToken = null){
        let payload = {
            userId: user.id,
            userName: user.name,
            loginId: user.loginId,
            email: user.email,
            uuid: uuidv4() // 추가 인증(만료된 accessToken 검증) 용도로 사용 <- 현재 사용하지 않음.
        }
        // create refresh token
        if(! refreshToken) {
            refreshToken = await this.createRefreshToken(payload);
        }
        // create access token
        let accessToken = jwtUtil.sign(payload);
        // userInfo
        // let userInfo = await this.myinfo(user.id);

        // set cookie
        let option = {
            httpOnly: true,
            sameSite: 'strict', // CSRF 방지
        }
        if(req.protocol == 'https') option.secure = true;
        res.cookie('refreshToken', refreshToken, option);

        return accessToken;
    },

    logout: async function(userId){
        if(! userId) return;
        await prisma.authToken.deleteMany({
            where: {
                userId: Number(userId)
            }
        });
    },

    leave: async function(userId){
        if(! userId) return;
        await prisma.userService.delete(userId);
    },
    
    // refresh token 생성 
    // payload -> uuid 만 포함. (추가 검증시 사용)
    // access 재생성 요청시 검증을 위해 db에 저장
    createRefreshToken : async function(payload){
        let token = jwtUtil.signRefresh({ 
            userId: payload.userId,
            uuid: payload.uuid 
        })
        if(! payload.userId || ! token) return;

        // delete token
        await prisma.authToken.deleteMany({
            where: {
                userId: Number(payload.userId)
            }
        });
        // save token
        await prisma.authToken.create({
            data: {
                userId: Number(payload.userId),
                refreshToken: token,
                expiredAt: jwtUtil.getRefreshTokenExpiredTime()
            }
        });
        return token;
    },

    getRefreshToken : async function(userId){
        let rs = await prisma.authToken.findMany({
            where: {
                userId: Number(userId),
                expiredAt: { gt: moment() }
            },
            orderBy: [ { id: 'desc' } ]
        })
        return rs && rs.length > 0 ? rs[0].refreshToken : null;
    },

    myinfo: async function(userId){
        if(! userId) return;
        return await userService.get(userId);
    },

    saveAuthLog: async function(user, req){
        try {
            // update user last_loagin_dt
            await prisma.users.update({ 
                where: {
                    id: Number(user.id)
                },
                data: {
                    lastLoginDt: moment().format()
                }
            });
            
            let ip = req.headers['x-forwarded-for'] ||  req.socket.remoteAddress;
            // save log
            let data = {
                userId: user.id,
                ip,
                userAgent: req.headers['user-agent'],
                result: true
            }
            await prisma.authLog.create({ data });
        } catch(e) {}
    },
    
    snsLogin: async function(req, res, { snsId, snsProvider, mobile, email }){
        // console.log(`== snsLogin - ${snsId}, ${snsProvider}, ${mobile}, ${email}`);
        let account = await snsAccountService.getBySnsId(snsId);
        let user = null;
        console.log('== account: ', account)
        if(account) { 
            user = await userService.first({ id: account.userId, enabled: true });
            if(! user) throw Error('Not found user.');
            await snsAccountService.update(account);
        } else {
            user = await userService.findByMobile(mobile);
            console.log('== user from mobile: ', user);
            if(! user) {
                user = await userService.first({ email, enabled: true });
                console.log('== user from email: ', user);
            }
            if(! user) throw Error('Not found user.');
            await snsAccountService.create({
                userId: user.id,
                snsProvider: snsProvider,
                snsId: snsId + ''
            });
        }
        return await this.createToken(req, res, user);
    },
    
    getNaverToken: async function(code, state) {
        const response = await axios.post(
            `https://nid.naver.com/oauth2.0/token`,
            qs.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.NAVER_CLIENT_ID,
                client_secret: process.env.NAVER_CLIENT_SECRET,
                code,
                state,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response.data.access_token;
    },
    
    getKakaoToken: async function(code) {
        const response = await axios.post(
            `https://kauth.kakao.com/oauth/token`,
            qs.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID,
                redirect_uri: process.env.REDIRECT_URI,
                code,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response.data.access_token;
    },
    
    getNaverUserInfo: async function(accessToken) {
        const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('== response: ', response.data)
        // if(! response?.data || response.data.resultcode != '00') throw Error('Naver Login Failed.');
        return {
            snsProvider: 'naver',
            snsId: response.data.response?.id,
            email: response.data.response?.email || null,
            mobile: response.data.response?.mobile || null
        }
    },
      
    // 카카오 사용자 정보 가져오기
    getKakaoUserInfo: async function(accessToken) {
        const response = await axios.get(`https://kapi.kakao.com/v2/user/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('== response: ', response.data);
        return {
            snsProvider: 'kakao',
            snsId: response.data.id,
            email: response.data.kakao_account?.email || null,
            mobile: response.data.kakao_account?.phone_number || null
        }
    },

    // Apple 로그인 메서드 수정
    getAppleUserInfo: async function(identityToken) {
        try {
            // Apple ID Token 검증
            const verifiedToken = await verifyAppleToken(identityToken);
            
            return {
                snsProvider: 'apple',
                snsId: verifiedToken.sub,
                email: verifiedToken.email || `${verifiedToken.sub}@privaterelay.appleid.com`,
                mobile: null
            };
        } catch (error) {
            console.error("Apple Login Error:", error);
            throw error;
        }
    },
};

module.exports = AuthService;