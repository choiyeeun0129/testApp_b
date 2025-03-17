const express = require('express');
const router = express.Router();
const configService = require('../service/configService.js'); 
const utils = require('../utils/default');
const error = require('../utils/error');
const authCheck = require('../middlewares/auth');

router.use(authCheck.checkLogin);

// list(pagination)
router.get('/list', async (req, res) => {
  /*
    #swagger.tags = ['Config']
    #swagger.summary = 'get config list'
    
    #swagger.responses[200] = {
        schema: [{ $ref: '#/definitions/SystemConfig' }]
    }
  */
  console.debug(`== configRouter:list - query:`, req.query);
  let rs = {};
  try {
    rs = await configService.list(utils.validateParam(req.query));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// update
router.post('/', async (req, res) => {
  /*
    #swagger.tags = ['Config']
    #swagger.summary = 'save config'
    #swagger.description = 'upsert (create/update)'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/SystemConfig' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/SystemConfig' }
    }
  */
  console.debug(`== configRouter:update - body:`, req.body.length);
  
  let rs = null;
  try {
    rs = await configService.updateList(utils.validateParam(req.body));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
