const express = require('express');
const router = express.Router();
const favoritesService = require('../service/favoritesService.js'); 
const utils = require('../utils/default.js');
const error = require('../utils/error.js');
const authCheck = require('../middlewares/auth.js');

router.use(authCheck.checkLogin);

// list(pagination)
router.get('/list/:userId', async (req, res) => {
  /*
    #swagger.tags = ['Favorite']
    #swagger.summary = 'find favorite list'
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
    
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Pagination' }
    }
  */
  console.debug(`== favoritesRouter:list - query:`, req.params, req.query);
  let rs = [];
  try {
    rs = await favoritesService.list(req.params.userId, utils.validateParam(req.query));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// create / update
router.post('/:targetId', async (req, res) => {
  /*
    #swagger.tags = ['Favorite']
    #swagger.summary = 'save favorites'
    #swagger.description = 'upsert (create/update)'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Favorite' }
    }
  */
  console.debug(`== favoritesRouter:upsert - body:`, req.params);
  let rs = null;
  try {
    rs =await favoritesService.upsert({ 
      userId: req.tokenPayload?.userId,
      targetId: req.params.targetId
    });
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete
router.delete('/:userId/target/:targetId', async (req, res) => {
  /*
    #swagger.tags = ['Favorite']
    #swagger.summary = 'delete Favorite'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/Favorite' }
    }
  */
  console.debug(`== favoritesRouter:delete - param:`, req.params);
  let rs = null;
  try {
    rs = await favoritesService.delete(req.params);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
