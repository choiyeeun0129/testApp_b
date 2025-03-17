const moment = require('moment');
const config = require("../env/config");

var utils = {

    ts : function(){
        return Date.now();
    },    
    
    tsLog : function(start, end, fix = 3){
        return ((end-start)/1000).toFixed(fix);
    },

    hourTs: function(str, count = 0){
        let dt = moment(str, 'YYYYMMDDHH');
        if(count != 0) dt = dt.add(count, 'hours');
        return dt.valueOf();
    },

    lastHourTs: function(){
        let dt = moment().format('YYYYMMDDHH');
        return moment(dt, 'YYYYMMDDHH').valueOf();
    },

    lastMinuteTs: function(){
        let dt = moment().format('YYYYMMDDHHmm');
        return moment(dt, 'YYYYMMDDHHmm').valueOf();
    },

    isZeroSecond: function(ts){
        let second = moment(ts).format('ss');
        if(second == '00') return true;
        else return false;
    },
    
    str2Ts: function(str, format = 'YYYY-MM-DD HH:mm:ss'){
        return moment(str, format).valueOf();
    },
    
    str2TsUtc: function(str, format = 'YYYY-MM-DD HH:mm:ss'){
        return moment.utc(str, format).valueOf();
    },

    ts2Str: function(ts, format = 'YYYY-MM-DD HH:mm:ss'){
        return moment(ts).format(format);
    },

    isoStr : function(ts){
        if(! ts) ts = this.ts();
        return moment(ts).toISOString();
    },

    utcStr: function(ts, format = 'YYYY-MM-DD HH:mm:ss'){
        if(! ts) ts = this.ts();
        return moment(ts).utc().format(format);
    },

    utcYmd: function(ts){
        if(! ts) ts = this.ts();
        return this.utcStr(ts, 'YYYYMMDD')
    },

    isExpired: function(from, to, term){
        if((to - from) <= term * 1000) return false;
        else return true;
    },

    isExpiredFromStr: function(from, to, term, format = 'YYYY-MM-DD HH:mm:ss'){
        let _from = moment(from, format).valueOf();
        let _to = moment(to, format).valueOf();
        if((_to - _from) <= term * 1000) return false;
        else return true;
    },

    isExpiredDay: function(from, term){
        if(isNaN(from) || term <= 0) return false;
        let _from = moment(from, 'YYYYMMDD').valueOf();
        let _to = moment().valueOf();
        if(isNaN(_from) || _from <= 0) return false;
        if((_to - _from) <= term * 1000 * 60 * 60 * 24) return false;
        else return true;
    },
};

module.exports = utils;