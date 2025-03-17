const express = require('express');
const router = express.Router();
const userService = require('../service/userService.js'); 
const utils = require('../utils/default');
const error = require('../utils/error');
const authCheck = require('../middlewares/auth');

router.use(authCheck.checkLogin);

// read
router.get('/find/:id', async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'find user info'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== userRouter:get - param:`, req.params);
  let rs = null;
  try {
    rs = await userService.get(req.params.id);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

router.get('/list/role/:code', async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'find user list by roleCode'
    #swagger.responses[200] = [
        schema: { $ref: '#/definitions/User' }
    ]
  */
  console.debug(`== userRouter:role`);
  let rs = null;
  try {
    let param = utils.validateParam(req.query);
    param.roleCode = req.params.code;
    rs = await userService.list(param);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

router.get('/list/batch/:code', async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'find user list by batchCode'
    #swagger.responses[200] = [
        schema: { $ref: '#/definitions/User' }
    ]
  */
  console.debug(`== userRouter:batch`);
  let rs = null;
  try {
    let param = utils.validateParam(req.query);
    param.batchCode = req.params.code;
    rs = await userService.list(param);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// list(pagination)
router.get('/list', async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'get user list'

    #swagger.parameters['Role Code'] = {
          in: 'query',
          description: '그룹 코드',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['Batch Code'] = {
          in: 'query',
          description: '기수 코드',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['keyword'] = {
          in: 'query',
          description: '이름, 직장',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['loginId'] = {
          in: 'query',
          description: '로그인 ID',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['name'] = {
          in: 'query',
          description: '사용자 이름',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['mobileNumber'] = {
          in: 'query',
          description: '핸드폰 번호',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['email'] = {
          in: 'query',
          description: '이메일',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['isPublic'] = {
          in: 'query',
          description: '공개 여부',
          required: false,
          type: 'boolean'
    } 
    #swagger.parameters['enabled'] = {
          in: 'query',
          description: '사용 여부',
          required: false,
          type: 'boolean'
    } 
    #swagger.parameters['page'] = {
          in: 'query',
          description: 'page number',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['perPage'] = {
          in: 'query',
          description: 'limit count',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['sortColumn'] = {
          in: 'query',
          description: 'sort column',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['sortAsc'] = {
          in: 'query',
          description: 'sort ascending',
          required: false,
          type: 'boolean'
    } 
    
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Pagination' }
    }
  */
  console.debug(`== userRouter:list - query:`, req.query);
  let rs = {};
  try {
    rs = await userService.list(utils.validateParam(req.query));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// create / update
router.post('/', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'save user'
    #swagger.description = 'upsert (create/update)'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/User' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== userRouter:upsert - body:`, req.body);
  let rs = null;
  try {
    rs = await userService.upsert(utils.validateParam(req.body));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// update
router.put('/', async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'update user'
    #swagger.description = 'update'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/User' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== userRouter:update - body:`, req.body);
  let rs = null;
  try {
    rs = await userService.update(utils.validateParam(req.body));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete
router.delete('/:id', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'delete user'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/User' }
    }
  */
  console.debug(`== userRouter:delete - param:`, req.params);
  let rs = null;
  try {
    rs = await userService.delete(req.params.id);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete list
router.post('/delete', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags= ['User']
    #swagger.summary = 'delete users'
    #swagger.responses[200] = {
        schema: {  }
    }
  */
  console.debug(`== userRouter:deleteList - body:`, req.body)
  let rs = null;
  try {
    rs = await userService.deleteList(req.body);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
