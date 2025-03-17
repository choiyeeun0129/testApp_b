/**
 * Batch test.
 */
const moment = require("moment");
const dates = require('../utils/dates');
const utils = require('../utils/default');
const userService = require('../service/userService.js'); 
const favoritesService = require('../service/favoritesService.js'); 

jest.setTimeout(1000 * 60 * 10); 

describe('batch', () => {
  beforeEach(() => {
  });
  
  afterEach(() => {
  });

  test.skip('user test skip', async () => {
    console.log('== user test skip');
  });

  test.skip('user regist test', async () => {
    console.log('== user regist test');

    for(let i=2; i<=300; i++) {
      
      let data = {
        loginId: `user${i}`,
        email: `user_${i}@pbnt.kr`,
        name: `user_${i}`,
        password: `1q2w#E$R`,
        mobileNumber: `010-1111-${utils.padNumber(i, 4)}`
      };
      // console.log('== new user: ', data);
      await userService.upsert(data);
      console.log('== new user: ', i);
    }

    console.log('user regist finished.')
  });

  test('user list test', async () => {
    console.log('== user list test');

    userService.list('');

    console.log('user list finished.')
  });
});

test('favorites regist test', async () => {
  console.log('== favorites regist test');

  for(let i=1; i<=300; i++) {
    let user = await userService.first({ name: `user_${i}`})
    if(! user) continue;

    for(let j=1; j<=100; j++) {
      let random = Math.floor(Math.random() * 300) + 1;
      let target = await userService.first({ name: `user_${random}`})
      console.log('== favorite: ', random, target?.name);
      if(! target) continue;
      let data = {
        userId: user.id,
        targetId: target.id
      };
      await favoritesService.upsert(data);
      // console.log('== favorite: ', data);

    }
    console.log('== favorite: ', i);
  }

  console.log('user regist finished.')
});
