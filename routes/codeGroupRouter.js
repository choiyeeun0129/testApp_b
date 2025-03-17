const express = require('express');
const router = express.Router();
const codeGroupService = require('../service/codeGroupService.js'); 
const utils = require('../utils/default');
const error = require('../utils/error');
const authCheck = require('../middlewares/auth');

router.use(authCheck.checkLogin);

// read
router.get('/find/:grpCode', async (req, res) => {
  /*
    #swagger.tags = ['CodeGroup']
    #swagger.summary = 'find CodeGroup info'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/CodeGroup' }
    }
  */
  console.debug(`== codeGroupRouter:get - param:`, req.params);
  let rs = null;
  try {
    rs = await codeGroupService.get(req.params.grpCode);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// list(pagination)
router.get('/list', async (req, res) => {
  /*
    #swagger.tags = ['CodeGroup']
    #swagger.summary = 'get CodeGroup list'

    #swagger.parameters['grpCode'] = {
          in: 'query',
          description: 'Group Code',
          required: false,
          type: 'number'
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
  console.debug(`== codeGroupRouter:list - query:`, req.query);
  let rs = [];
  try {
    rs = await codeGroupService.list(utils.validateParam(req.query));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// create / update
router.post('/', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags = ['CodeGroup']
    #swagger.summary = 'save CodeGroup'
    #swagger.description = 'upsert (create/update)'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/CodeGroup' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/CodeGroup' }
    }
  */
  console.debug(`== codeGroupRouter:upsert - body:`, req.body);
  let rs = null;
  try {
    rs =await codeGroupService.upsert(utils.validateParam(req.body));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete
router.delete('/:grpCode', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags = ['CodeGroup']
    #swagger.summary = 'delete CodeGroup'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/CodeGroup' }
    }
  */
  console.debug(`== codeGroupRouter:delete - param:`, req.params);
  let rs = null;
  try {
    rs = await codeGroupService.delete(req.params.grpCode);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete list
router.post('/delete', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags = ['CodeGroup']
    #swagger.summary = 'delete CodeGroup'
    #swagger.responses[200] = {
        schema: {  }
    }
  */
  console.debug(`== codeGroupRouter:deleteList - body:`, req.body)
  let rs = null;
  try {
    rs = await codeGroupService.deleteList(req.body);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
