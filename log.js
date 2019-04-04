var path = require("path");
var log4js = require("log4js");

/**
 * 日志配置
 */
exports.configure = function() {
    // 单进程的配置项
    log4js.configure(path.join(__dirname, "./logs/log4js.json"));
    // if (mode === "master") {
    //     log4js.configure(path.join(__dirname, "./log4js-master.json"));
    // } else {
    //     // 多进程的配置项
    //     log4js.configure(path.join(__dirname, "./log4js-worker.json"));
    // } 
}

/**
 * 暴露到应用的日志接口，调用该方法前必须确保已经configure过
 * @param name 指定log4js配置文件中的category。依此找到对应的appender。
 *              如果appender没有写上category，则为默认的category。可以有多个
 * @returns {Logger}
 */
exports.logger = function(name) {
    var dateFileLog = log4js.getLogger(name);
    //dateFileLog.setLevel(log4js.levels.INFO);
	//console.log = dateFileLog.info.bind(dateFileLog);
    return dateFileLog;
}

/**
 * 用于express中间件，调用该方法前必须确保已经configure过
 * @returns {Function|*}
 */
exports.useLog = function() {
    return log4js.connectLogger(log4js.getLogger("app"), {level:'auto',format:'[:remote-addr] :method-:status :url :content-length bytes :response-time ms'});//如果想要简化,可以添加设置format:':method :url'
} 