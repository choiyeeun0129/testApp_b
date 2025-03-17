const express = require('express');
const router = express.Router();
const userDepartmentService = require('../service/userDepartmentService.js'); 
const utils = require('../utils/default.js');
const error = require('../utils/error.js');
const authCheck = require('../middlewares/auth.js');

router.use(authCheck.checkLogin);

// read
router.get('/find/:id', async (req, res) => {
  /*
    #swagger.tags= ['UserDepartment']
    #swagger.summary = 'find UserDepartment info'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/UserDepartment' }
    }
  */
  console.debug(`== UserDepartmentRouter:get - param:`, req.params);
  let rs = null;
  try {
    rs = await userDepartmentService.get(req.params.id);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// list(pagination)
router.get('/list/:userId', async (req, res) => {
  /*
    #swagger.tags= ['UserDepartment']
    #swagger.summary = 'get UserDepartment list'

    #swagger.parameters['Name'] = {
          in: 'query',
          description: '부서명',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['Degree code'] = {
          in: 'query',
          description: '학위 코드',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['Office Number'] = {
          in: 'query',
          description: '전화 번호',
          required: false,
          type: 'string'
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
  console.debug(`== UserDepartmentRouter:list - query:`, req.params.userId, req.query);
  let rs = {};
  try {
    rs = await userDepartmentService.list(req.params.userId, utils.validateParam(req.query));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// create / update
router.post('/', async (req, res) => {
  /*
    #swagger.tags= ['UserDepartment']
    #swagger.summary = 'save UserDepartment'
    #swagger.description = 'upsert (create/update)'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/UserDepartment' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/UserDepartment' }
    }
  */
  console.debug(`== UserDepartmentRouter:upsert - body:`, req.body);
  let rs = null;
  try {
    rs = await userDepartmentService.upsert(utils.validateParam(req.body));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete
router.delete('/:id', async (req, res) => {
  /*
    #swagger.tags= ['UserDepartment']
    #swagger.summary = 'delete UserDepartment'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/UserDepartment' }
    }
  */
  console.debug(`== UserDepartmentRouter:delete - param:`, req.params);
  let rs = null;
  try {
    rs = await userDepartmentService.delete(req.params.id);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete list
router.post('/delete', async (req, res) => {
  /*
    #swagger.tags= ['UserDepartment']
    #swagger.summary = 'delete UserDepartments'
    #swagger.responses[200] = {
        schema: {  }
    }
  */
  console.debug(`== UserDepartmentRouter:deleteList - body:`, req.body)
  let rs = null;
  try {
    rs = await userDepartmentService.deleteList(req.body);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
