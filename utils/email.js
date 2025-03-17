const moment = require('moment');
const nodemailer = require('nodemailer');
const dates = require('../utils/dates');
const config = require('../env/config');

var emailUtil = {

    sendAuthToken: async function(receiver, token){
        if(! token || token.trim().length == 0) throw new Error('Empty token.');
        let subject = 'GNU MOT Members';
        let content = `요청하신 인증번호는 [${token}]입니다. \nGNU MOT Members. `;
        this.send(receiver, subject, content);
    },

    sendLeaveMsg: async function(user, admin){
        if(! user) throw new Error('Empty user info.');
        let subject = '[MOT Members] 회원 탈퇴 요청.';
        let content = `회원 탈퇴 요청. \n\nID: ${user.loginId} \n이름: ${user.name}\n모바일: ${user.mobileNumber}\n요청일시: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n\nGNU MOT Members. `;
        console.log('== email contents: ', content);

        // 관리자 이메일로 전송
        this.send(admin.email, subject, content);
    },

    send: function(receiver, subject, text){
        // SMTP 설정
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Gmail SMTP 서버 주소
            port: 587, // TLS 포트
            secure: false, // TLS 사용
            auth: {
                user: config.EMAIL_SENDER, // 카카오 이메일 주소
                pass: config.EMAIL_PW, // 카카오 이메일 비밀번호 또는 앱 비밀번호
            },
        });
        
        if(! subject) subject = 'GNU MOT Members.';

        // 이메일 옵션 설정
        const mailOptions = {
            from: config.EMAIL_SENDER, // 발신자 이메일
            to: receiver, // 수신자 이메일
            subject: subject, // 이메일 제목
            text: text, // 이메일 내용 (텍스트)
            // html: '<h1>이것은 HTML 포맷입니다.</h1>', // HTML 포맷 사용 가능
        };
        
        // 이메일 전송
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('이메일 전송 실패:', error);
            } else {
                console.log('이메일 전송 성공:', info.response);
            }
        });
    },

};

module.exports = emailUtil;