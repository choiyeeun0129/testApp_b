const express = require('express');
const router = express.Router();
const fileService = require('../service/fileService.js'); 
const utils = require('../utils/default');
const error = require('../utils/error');
const authCheck = require('../middlewares/auth');

router.use(authCheck.checkLogin);

const upload = fileService.upload();
let uploadFile = function(req, res, next){
  let upload = fileService.upload().single('file');
  upload(req, res, function(e){
    if(e) res.json(error.message(e)); 
    else next();
  });
};

let checkUploadDir = function(req, res, next){
  console.debug(`== checkUploadDir`);
  fileService.checkDir();
  next();
};

// upload
router.post('/upload', checkUploadDir, uploadFile, async (req, res) => {
  /*
    #swagger.tags= ['File']
    #swagger.summary = 'upload file'
    #swagger.description = 'upload file'
    #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/File' }
    } 
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/File' }
    }
  */
  console.debug(`== fileRouter:upload - new:`, req.file);
  console.debug(`== fileRouter:upload - body:`, req.body);

  // upload new file
  let rs = null;
  try {
    rs = await fileService.save(utils.validateParam(req.file));
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

// delete
router.delete('/:id', async (req, res) => {
  /*
    #swagger.tags= ['File']
    #swagger.summary = 'delete file'
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/File' }
    }
  */
  console.debug(`== fileRouter:delete - param:`, req.params);
  let rs = null;
  try {
    rs = await fileService.delete(req.params.id);
    res.json(rs);
  } catch(e) {
    res.json(error.message(e));
  }
});

module.exports = router;
