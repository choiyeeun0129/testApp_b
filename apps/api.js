/**
 * api-server app.
 * 
 */

require('dotenv').config({ path: '/Users/pbnt01/Desktop//testApp/testApp_be/.env.development' });

console.log("🔥 [DEBUG] 환경 변수 적용 전 SERVER_PORT:", process.env.SERVER_PORT);
console.log("🔥 [DEBUG] MARIADB_DB 환경 변수:", process.env.MARIADB_DB);
console.log("🔥 [DEBUG] NODE_ENV 환경 변수:", process.env.NODE_ENV);
console.log("🔥 [DEBUG] MARIADB_URL 환경 변수:", process.env.MARIADB_URL);

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('../env/config');
const mariadb = require('../config/mariadb.js');

const authCheck = require('../middlewares/auth'); 
const configService = require('../service/configService.js'); 

// router
const configRouter = require('../routes/configRouter');
const authRouter = require('../routes/authRouter');
const codeRouter = require('../routes/codeRouter');
const codeGroupRouter = require('../routes/codeGroupRouter');
const userRouter = require('../routes/userRouter');
const favoritesRouter = require('../routes/favoritesRouter');
// const userDepartmentRouter = require('../routes/userDepartmentRouter');
const documentRouter = require('../routes/documentRouter');
const fileRouter = require('../routes/fileRouter');

// 초기화
(async () => {
    console.log('system start', `Start api server..`)
    await mariadb.connect();
    await configService.setEnv();
})();

setTimeout(async () => {
    // run on start
    start();
  
  }, 1000 * 2);

const app = express();
app.use(cookieParser());
app.set('port', config.SERVER_PORT || 3000);
app.set('host', '0.0.0.0');
app.use(express.json({
    limit: "500mb"
}));
app.use(cors({
    origin: '*', //'http://localhost:8080', 
    credentials: true, 
}));

// swagger
if(process.env.NODE_ENV != 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerFile = require('../swagger/swagger-output.json');
    app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { 
        explorer: true,
        persistAuthorization: true,
        cacheControl: false,
    }));
}

// router 등록
app.use('/api/config/', configRouter);
app.use('/api/auth/', authRouter);
console.log("authRouter간다");
app.use('/api/code/', codeRouter);
app.use('/api/codeGroup/', codeGroupRouter);
app.use('/api/user/', userRouter);
app.use('/api/favorites/', favoritesRouter);
// app.use('/api/userDepartment/', userDepartmentRouter);
app.use('/api/document/', documentRouter);
app.use('/api/file/', fileRouter);

app.get('/', (req, res) => {
    /*
      #swagger.ignore = true
    */
    res.send('Bad Request..')
});


function start() {
    app.listen(app.get('port'), app.get("host"), ()=>{
        console.log('system start', `api server listening at ${app.get('port')} port ..`)
    });
}
