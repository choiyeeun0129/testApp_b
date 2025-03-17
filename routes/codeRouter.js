const express = require('express');
const router = express.Router();
const codeService = require('../service/codeService.js'); 
const utils = require('../utils/default');
const error = require('../utils/error');
const authCheck = require('../middlewares/auth');

router.use(authCheck.checkLogin);

// read
router.get('/find/:code', async (req, res) => {
  /*
    #swagger.tags = ['Code']
    #swagger.summary = 'find Code info'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Code' }
    }
  */
  console.debug(`== codeRouter:get - param:`, req.params);
  let rs = null;
  try {
    rs = await codeService.get(req.params.code);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

router.get('/list/:grpCode', async (req, res) => {
  /*
    #swagger.tags = ['Code']
    #swagger.summary = 'find code list by grpCode'
    #swagger.responses[200] = [
        schema: { $ref: '#/definitions/Code' }
    ]
  */
  console.debug(`== codeRouter:get - list by grpCode:`, req.params);
  let rs = null;
  try {
    rs = await codeService.list({ grpCode: req.params.grpCode, perPage: 10000 });
    res.json(rs.contents || []);
  } catch(e) {
    res.json(error.message(e));
  }
});


router.get('/batchCodes', async (req, res) => {
  /*
    #swagger.tags = ['Code']
    #swagger.summary = 'find batch code list'
    #swagger.responses[200] = [
        schema: { $ref: '#/definitions/Code' }
    ]
  */
  console.debug(`== codeRouter:list batch`);
  let rs = null;
  try {
    rs = await codeService.list({ grpCode: 'BATCH_TY', perPage: 10000 });
    res.json(rs.contents || []);
  } catch(e) {
    res.json(error.message(e));
  }
});

// list(pagination)
router.get('/list', async (req, res) => {
  /*
    #swagger.tags = ['Code']
    #swagger.summary = 'get Code list'

    #swagger.parameters['grpCode'] = {
          in: 'query',
          description: 'Group Code',
          required: false,
          type: 'number'
    } 
    #swagger.parameters['code'] = {
          in: 'query',
          description: 'Code',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['name'] = {
          in: 'query',
          description: 'name',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['enabled'] = {
          in: 'query',
          description: 'enabled',
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
  console.debug(`== codeRouter:list - query:`, req.query);
  let rs = [];
  try {
    rs = await codeService.list(utils.validateParam(req.query));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// create / update
router.post('/', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags = ['Code']
    #swagger.summary = 'save Code'
    #swagger.description = 'upsert (create/update)'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/Code' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Code' }
    }
  */
  console.debug(`== codeRouter:upsert - body:`, req.body);
  let rs = null;
  try {
    rs =await codeService.upsert(utils.validateParam(req.body));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete
router.delete('/:code', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags = ['Code']
    #swagger.summary = 'delete Code'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Code' }
    }
  */
  console.debug(`== codeRouter:delete - param:`, req.params);
  let rs = null;
  try {
    rs = await codeService.delete(req.params.code);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete list
router.post('/delete', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags = ['Code']
    #swagger.summary = 'delete codes'
    #swagger.responses[200] = {
        schema: {  }
    }
  */
  console.debug(`== codeRouter:deleteList - body:`, req.body)
  let rs = null;
  try {
    rs = await codeService.deleteList(req.body);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
