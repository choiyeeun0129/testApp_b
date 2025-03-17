const moment = require('moment');

var utils = {

    toBool: function(val){
        if(! val) return false;
        if(val === true || val === 1 || val === '1' || val === 'true') return true;
        else return false;
    },

    validateParam: function(param){
        if(! param) return {}
        for (const [key, val] of Object.entries(param)) {
            if(val=='undefined') param[key]='';
            if(val=='null') param[key] = null;
            if(val=='false') param[key]=false;
            try{
                if(! this.empty(param[key])) {
                    param[key] = param[key].trim();
                    if(key === 'mobile') param[key] = param[key].replace(/\D/g, "")
                }
            } catch(e) {}
        }
        return param;
    },

    removeTag : function(str){
        return str.replace(/(<([^>]+)>)/ig,"");
    },

    empty : function(value){

        if (value === null) return true;
        if (value == 'undefined') return true;
        if (typeof value === 'undefined') return true; 
        if (typeof value === 'string' && value === '') return true;
        if (Array.isArray(value) && value.length < 1) return true; 
        if (typeof value === 'object' && value.constructor.name === 'Object' && Object.keys(value).length < 1 && Object.getOwnPropertyNames(value) < 1) return true;
        if (typeof value === 'object' && value.constructor.name === 'String' && Object.keys(value).length < 1) return true; // new String() 
        return false;
    },
    
    random : function(min, max) {
        var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
        return ranNum;
    },

    isNum : function (p){
        return ! isNaN( Number(p) );
    },

    toNum : function (p){
        if(! p) return 0;
        try {
            p = p.replace(/[^0-9\.\-]/g, '');
            p = Number(p);
        } catch(e){
            p = 0;
        }
        return p
    },

    getDistance: function(p1, p2){
        try {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            return Math.sqrt(dx * dx + dy * dy).toFixed(3);
        } catch(e) {
            return 0;
        }
    },
    
    padNumber: function(num, len = 2){
        return num.toString().padStart(len, '0');
    },
    
    // 전화번호 변환 함수: 국제 형식을 국내 형식으로 변환
    convertToLocalFormat: function(phone) {
        if (phone.startsWith('+82')) {
        return phone.replace('+82', '0'); // +82를 0으로 변경
        }
        return phone; // 이미 국내 형식인 경우 그대로 반환
    },
  
    // 하이픈 추가 함수
    addHyphen: function(phone) {
        const withoutHyphen = phone.replace(/-/g, ''); // 하이픈 제거
        if (withoutHyphen.length === 11) {
        return `${withoutHyphen.slice(0, 3)}-${withoutHyphen.slice(3, 7)}-${withoutHyphen.slice(7)}`;
        }
        return phone; // 길이가 맞지 않으면 원래 값 반환
    },

    /**
     * 특정 컬럼들만 복사한 새로운 객체를 반환하는 함수
     * @param {Object} source - 원본 객체
     * @param {Array<string>} keys - 복사할 키 배열
     * @returns {Object} 선택한 키만 포함된 새로운 객체
     */
    copyObj: function(source, keys) {
        if (!source || typeof source !== 'object') {
            throw new Error('source는 객체여야 합니다.');
        }
    
        if (!Array.isArray(keys)) {
            throw new Error('keys는 배열이어야 합니다.');
        }
    
        return keys.reduce((result, key) => {
            if (key in source) {
                result[key] = source[key];
            }
            return result;
        }, {});
    },

};

module.exports = utils;