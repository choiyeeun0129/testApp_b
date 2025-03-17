const express = require('express');
const router = express.Router();
const documentService = require('../service/documentService.js'); 
const utils = require('../utils/default.js');
const error = require('../utils/error.js');
const authCheck = require('../middlewares/auth.js');

router.use(authCheck.checkLogin);

// read
router.get('/find/:id', async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'find Document info'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Document' }
    }
  */
  console.debug(`== documentRouter:get - param:`, req.params);
  let rs = null;
  try {
    rs = await documentService.get(req.params.id);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

router.get('/notice', async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'find notice list'
    #swagger.responses[200] = [
        schema: { $ref: '#/definitions/Document' }
    ]
  */
  console.debug(`== documentRouter:notice`);
  let rs = null;
  try {
    let param = utils.validateParam(req.query);
    param.typeCode = 'DOC_NOTICE';
    rs = await documentService.list(param);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

router.get('/help', async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'find help list'
    #swagger.responses[200] = [
        schema: { $ref: '#/definitions/Document' }
    ]
  */
  console.debug(`== documentRouter:help`);
  let rs = null;
  try {
    let param = utils.validateParam(req.query);
    param.typeCode = 'DOC_HELP';
    rs = await documentService.list(param);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

router.get('/policy', async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'find policy list'
    #swagger.responses[200] = [
        schema: { $ref: '#/definitions/Document' }
    ]
  */
  console.debug(`== documentRouter:policy`);
  let rs = null;
  try {
    let param = utils.validateParam(req.query);
    param.typeCode = 'DOC_POLICY';
    rs = await documentService.list(param);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// list(pagination)
router.get('/list', async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'get Document list'

    #swagger.parameters['Type code'] = {
          in: 'query',
          description: '타입 코드',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['Title'] = {
          in: 'query',
          description: '제목',
          required: false,
          type: 'string'
    } 
    #swagger.parameters['Content'] = {
          in: 'query',
          description: '내용',
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
  console.debug(`== documentRouter:list - query:`, req.query);
  let rs = {};
  try {
    rs = await documentService.list(utils.validateParam(req.query));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// create / update
router.post('/', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'save Document'
    #swagger.description = 'upsert (create/update)'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/Document' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Document' }
    }
  */
  console.debug(`== documentRouter:upsert - body:`, req.body);
  let rs = null;
  try {
    rs = await documentService.upsert(utils.validateParam(req.body));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete
router.delete('/:id', authCheck.checkLoginWithRole('admin'), async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'delete Document'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Document' }
    }
  */
  console.debug(`== documentRouter:delete - param:`, req.params);
  let rs = null;
  try {
    rs = await documentService.delete(req.params.id);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete list
router.post('/delete', async (req, res) => {
  /*
    #swagger.tags= ['Document']
    #swagger.summary = 'delete Documents'
    #swagger.responses[200] = {
        schema: {  }
    }
  */
  console.debug(`== documentRouter:deleteList - body:`, req.body)
  let rs = null;
  try {
    rs = await documentService.deleteList(req.body);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
