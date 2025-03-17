const moment = require('moment');
const coolsms = require('coolsms-node-sdk').default;
const config = require('../env/config');

var smsUtil = {

    send: async function(receiver, contnet){
        if(! receiver || receiver.trim().length == 0) throw new Error('Empty sms receiver.');
        if(! contnet || contnet.trim().length == 0) throw new Error('Empty sms contnet.');

        let messageService = new coolsms(config.SMS_API_KEY, config.SMS_API_SECRET);
        const result = await messageService.sendOne({
    	    to: receiver,
      	 	from : `${config.SMS_SENDER}`,
      	 	text : contnet
 	    });
    	// console.log(result);
    },

    sendAuthToken: async function(receiver, token){
        if(! token || token.trim().length == 0) throw new Error('Empty token.');
        let content = `요청하신 인증번호는 [${token}]입니다. \nGNU MOT Members. `;
        await this.send(receiver, content);
    },

};

module.exports = smsUtil;