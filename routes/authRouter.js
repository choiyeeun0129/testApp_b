const express = require('express');
const router = express.Router();
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const authService = require('../service/authService.js'); 
const userService = require('../service/userService.js');
const authNumberService = require('../service/authNumberService.js');
const utils = require('../utils/default');
const error = require('../utils/error');
const email = require('../utils/email');
const sms = require('../utils/sms');
const authCheck = require('../middlewares/auth');
const fileService = require('../service/fileService.js');
const verifyAppleToken = require('../utils/verifyAppleToken.js');




/**
 * 
 * accessToken : frontEnd에서 memory(store 변수)에 관리
 * refreshToken : cookie httpOnly 옵션으로 관리
 * 
 * 토큰 생성 후 전달(login / refresh)
 * refreshToken 은 생성 후 서버측에서 cookie에 저장
 * accessToken은 클라인트로 전달
 * 
 */

/* login */
router.post('/login', async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'Login - request jwt token'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { 
          loginId: '',
          password: ''  
        }
    }
    #swagger.responses[200] = {
        schema: { accessToken: '' }
    }
  */
  console.debug(`== authRouter:login - body:`, req.body);
  try {
    const token = await authService.signin(req, res);
    res.json({ accessToken: token });
  } catch(e) {
    res.json(error.message(e));
  }
});

/* refresh token */
router.get('/refresh', authCheck.checkLogin, async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'Refresh Token - refresh access token'
    #swagger.parameters['Refresh-Token'] = {
        in: 'header',
        schema: ''
    } 
    #swagger.responses[200] = {
        schema: { accessToken: '' }
    }
  */
  console.debug(`== authRouter:refresh - body:`, req.body, req.protocol);
  let rs = null;
  try {
    let refretoken = req.cookies.refreshToken;
    const token = await authService.refresh(req, res, refretoken);
    res.json({ accessToken: token });
  } catch(e) {
    res.status(401).json(error.message(e));
  }
});

/* myinfo */
router.get('/myinfo', authCheck.checkLogin, async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '내 정보 조회'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== authRouter:myinfo`);
  let rs = null;
  try {
    rs = await authService.myinfo(req.tokenPayload.userId);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

/* myinfo */
router.post('/myinfo', authCheck.checkLogin, async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '내 정보 수정'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== authRouter:myinfo`);
  let rs = null;
  try {
    let param = utils.validateParam(req.body);
    if(param.id != req.tokenPayload.userId) throw new Error('Invalid Param!');
    // let user = await authService.myinfo(req.tokenPayload.userId);
    // rs = await userService.update({ ...user, ...param });
    delete param.loginId;
    rs = await userService.update(param);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

/* 공개 여부 설정 */
router.post('/public', authCheck.checkLogin, async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '공개 여부 설정'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== authRouter:public`);
  let rs = null;
  try {
    let param = utils.validateParam(req.body);
    let user = await userService.get(req.tokenPayload.userId);
    user.isPublicMobile = utils.toBool(param?.mobile);
    user.isPublicOffice = utils.toBool(param?.office);
    user.isPublicEmail = utils.toBool(param?.email);
    user.isPublicDepartment = utils.toBool(param?.department);
    user.isPublicBirth = utils.toBool(param?.birth);
    rs = await userService.update(user);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

/* status */
router.get('/status/:mobile', async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '스마트폰 번호 인증'
    #swagger.responses[200] = {
        schema: { }
    }
  */
  console.debug(`== authRouter:status`, req.params);
  try {
    const mobile = req.params.mobile;
    if(! mobile) throw new Error('Invalid param.');

    /*
    status (상태값)
    - Unregistered : 미등록
    - NotEnrolled : 미가입
    - Active : 가입
    */
    let status = 'Unregistered';
    // 사용자 조회(이름, 폰번호)
    let user = await userService.first({ mobileNumber: mobile });
    if(user) {
      if(user.enabled) status = 'Active';
      else status = 'NotEnrolled';
    } else {
      status = 'Unregistered';
    }
    // 가입
    res.json({ status });
  } catch(e) {
    res.json(error.message(e));
  }
});

/* 가입 */
router.post('/join', async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '사용자 가입'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== authRouter:join`, req.body);
  let rs = null;
  try {
    let param = utils.validateParam(req.body);

    // 사용자 조회(폰번호)
    let user = await userService.first({ 
      mobileNumber: param.mobile
    });
    if(! user) throw new Error('Not found user!');

    rs = await authService.signon(user, param);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

/* authNumber */
router.get('/authNumber', async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '인증 번호 요청청'
    #swagger.responses[200] = {
        schema: { }
    }
  */
  console.debug(`== authRouter:authNumber`);
  try {
    const param = utils.validateParam(req.query);
    let p = {};
    if(param.mobile) p.mobileNumber = param.mobile;
    if(param.name) p.name = param.name;
    if(param.loginId) p.loginId = param.loginId;

    console.log('== param: ', p)
    let user = await userService.first(p);
    if(! user) throw new Error('Not found user!');

    // 인증번호 생성/저장
    const authNumber = await authNumberService.upsert(req, user.id);
    if(! authNumber || ! authNumber.authNumber) throw new Error('Authentication number creation failed.');

    // 이메일/SMS 전송
    if(param.type === 'email') email.sendAuthToken(user.email, authNumber.authNumber);
    else await sms.sendAuthToken(user.mobileNumber, authNumber.authNumber);

    res.json({});
  } catch(e) {
    res.json(error.message(e));
  }
});

/* findId */
router.get('/findId', async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '로그인ID 변경 '
    #swagger.responses[200] = {
        schema: { }
    }
  */
  console.debug(`== authRouter:findId`);
  try {
    let param = utils.validateParam(req.query);

    // 사용자 조회(이름, 폰번호)
    let user = await userService.first({ 
      name: param.name || '', 
      mobileNumber: param.mobile || '' 
    });
    if(! user) throw new Error('Not found user!');

    // 인증 번호 검사사
    const token = await authNumberService.getNumber(user.id);
    if(! token || token != param.authNumber) throw new Error('Invalid auth token.');

    // 가입
    if(user) res.json({ loginId: user.loginId });
    else res.json({});
  } catch(e) {
    res.json(error.message(e));
  }
});

/* 비밀번호 재설정 */
router.post('/password', async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = '비밀번호 재설정'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== authRouter:password`);
  let rs = null;
  try {
    let param = utils.validateParam(req.body);
    console.log('== password.param: ', param)

    // 사용자 조회(이름, loginId)
    let user = await userService.first({ 
      name: param.name || '',
      loginId: param.loginId || '',
    });
    if(! user) throw new Error('Not found user.');

    // 인증 번호 검사사
    const token = await authNumberService.getNumber(user.id);
    if(! token || token != param.authNumber) throw new Error('Invalid auth token.');

    // 비번 변경
    rs = await userService.updatePassword(user.id, param.password);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

/* logout */
router.get('/logout', authCheck.onlyCheck, async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'Logout - delete refresh token'
    #swagger.responses[200] = {
        schema: { success: true }
    }
  */
  console.debug(`== authRouter:logout`);
  try {
    res.cookie('refreshToken', '', { maxAge:0 });
    if(req.tokenPayload) await authService.logout(req.tokenPayload?.userId);
    res.json({});
  } catch(e) {
    res.json({});
  }
});

/* leave */
router.get('/leave', authCheck.onlyCheck, async function(req, res) {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'Leave - delete user'
    #swagger.responses[200] = {
        schema: { success: true }
    }
  */
  console.debug(`== authRouter:leave`);
  try {
    let user = await userService.get(req.tokenPayload?.userId);
    let admin = await userService.get(1);
    if(! user) throw new Error('Not found user.');
    console.log('== leave: ', user);
    email.sendLeaveMsg(user, admin);

    // res.cookie('refreshToken', '', { maxAge:0 });
    // if(req.tokenPayload) await userService.delete(req.tokenPayload?.userId);

    res.json(true);
  } catch(e) {
    res.json({});
  }
});

// 네이버 로그인 URL
router.get('/naver', (req, res) => {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'Naver login for web'
    #swagger.responses[200] = {
        schema: { accessToken: '' }
    }
  */
  const naverAuthURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=naver`;
  console.log('== naver login: ', naverAuthURL);
  res.redirect(naverAuthURL);
});

// 카카오 로그인 URL
router.get('/kakao', (req, res) => {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'Kakao login for web'
    #swagger.responses[200] = {
        schema: { accessToken: '' }
    }
  */
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=kakao`;
  console.log('== kakao login: ', kakaoAuthURL);
  res.redirect(kakaoAuthURL);
});

// 모바일용 SNS 로그인 
router.post('/sns/mobile', async (req, res) => {
  console.log('🌟 1. SNS 로그인 요청 시작:', req.body);
  const { provider, accessToken } = req.body;
  console.log('🌟 2. 받은 데이터 - provider:', provider, 'token:', accessToken.substring(0, 50) + '...');

  try {
    let userData = null;

    if (provider === 'naver') {
      userData = await authService.getNaverUserInfo(accessToken);
    } else if (provider === 'kakao') {
      userData = await authService.getKakaoUserInfo(accessToken);
    } else if (provider === 'apple') {
      console.log('🌟 3. Apple 로그인 처리 시작');
      const decodedToken = await verifyAppleToken(accessToken);
      console.log('🌟 4. Apple Token 검증 결과:', decodedToken);

      const appleUserId = decodedToken.sub;
      let email = decodedToken.email || `${appleUserId}@privaterelay.appleid.com`;
      console.log('🌟 5. 추출된 정보 - ID:', appleUserId, 'Email:', email);

      userData = { snsId: appleUserId, snsProvider: "apple", email };
      console.log('🌟 6. 생성된 userData:', userData);
    } else {
      throw new Error('Invalid provider');
    }

    // ✅ 내부 로그인 처리 및 응답 (JWT 토큰 발급)
    if (!userData) throw Error('SNS Login Failed.');
    console.log('== SNS 사용자 데이터: ', userData);

    let token = jwtUtil.sign({
      userId: userData.snsId,
      email: userData.email,
      provider: userData.snsProvider,
    });

    return res.json({ accessToken: token });
  } catch (e) {
    console.error("❌ SNS 로그인 오류:", e);
    res.status(500).json({ success: false, error: "SNS Login Failed", message: e.message });
  }
});





// 콜백 URL 처리
router.get('/callback', async (req, res) => {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'Sns login callback'
    #swagger.responses[200] = {
        schema: { accessToken: '' }
    }
  */
  const { code, state } = req.query;
  console.log('== sns login callback: ', code, state);
  try {
    let userData = null;
    if (state === 'naver') {
      // 네이버
      const accessToken = await authService.getNaverToken(code, state);
      userData = await authService.getNaverUserInfo(accessToken);
    } else if (state === 'kakao') {
      // 카카오
      const accessToken = await authService.getKakaoToken(code);
      userData = await authService.getKakaoUserInfo(accessToken);
    } else {
      throw new Error('Invalid provider');
    }

    // 내부 로그인 처리 및 응답
    if(! userData) throw Error('SNS Login Failed.');
    console.log('== sns user data: ', userData);
    let token = await authService.snsLogin(req, res, userData);
    res.json({ accessToken: token });
  } catch (e) {
    res.json(error.message(e)); 
  }
});

// save image
router.post('/profileImage/:fileId', authCheck.checkLogin, async (req, res) => {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'save my image'
    #swagger.description = 'save my image'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== userRouter:profileImage - body:`, req.params);
  let rs = null;
  try {
    rs = await userService.update({
      id: req.tokenPayload.userId, 
      profileImage: req.params.fileId
    });
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete image
router.delete('/profileImage', authCheck.checkLogin, async (req, res) => {
  /*
    #swagger.tags= ['Auth']
    #swagger.summary = 'delete my image'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== userRouter:delete profileImage`);
  let rs = null;
  try {
    let userId = req.tokenPayload.userId;
    let user = await userService.get(userId)
    await userService.update({
      id: userId, 
      profileImage: null
    });
    if(user) await fileService.delete(user.profileImage);
    res.json(true);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
