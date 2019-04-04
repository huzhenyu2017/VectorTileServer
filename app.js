"use strict";

var express = require('express');
var app = express();
var cluster = require('cluster');//加载clustr模块
//var logger = require('morgan');
var log4js = require('./log');//实际生产环境中使用log4js日志系统
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log = log4js.logger("app");

//var config = require('./config');
var TileService = require('./modules/TileService');//需要进行实例化才能调用TileService的方法

var routeHandlers = {
	getTile: function(req, res, next) {
		var tileService = new TileService(req);
		tileService.getTile(function(err, tile, headers) {
			if (err) return res.status(404).send(err.message);
			res.set(headers);
			res.send(tile);
			//测试多进程
			//log.info('worker' + cluster.worker.id + ',PID:'+process.pid + ' getTile:' +req.params.z + '/' + req.params.x +'/'+req.params.y);
		});
	},
	getInfo: function(req, res, next) {
		var tileService = new TileService(req);
		tileService.getInfo(function(err, info) {
			if (err) return res.status(404).send(err.message);
			res.json(info);
		});
	},
	// ping也属于一个通信协议，是TCP/IP协议的一部分,利用“ping”命令可以检查网络是否连通
	ping: function(req, res, next){
		res.send('TileServer says pong!');
	},
	// 对空白访问服务'/'时提供健康状态响应,避免因此出现异常
	healthStatus: function(req, res, next){
		res.send(':) TileServer is running!');
	},
};


// X-Powered-By是网站响应头信息其中的一个，出于安全的考虑一般禁用这个信息
app.disable('x-powered-by'); //如果不禁用,响应头会出现X-Powered-By Express

// app.use()为调用中间件的方法(处理HTTP请求的函数，用来完成特定任务，比如检查用户是否登录、分析数据、以及其他在需要最终将数据发送给用户之前完成的任务)
// 当发生http请求时,先执行app.use()的中间件操作,再执行route()的路由操作!
app.use('*', function(req, res, next) {
    // 设置CORS跨域资源共享(若不设置允许跨域,则无法访问瓦片)
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	//console.log('app.use execute!');
	next();//next的作用是将请求转发，这个必须有，如果没有，请求到这就挂起了
});

//app.use(logger('dev'));
log4js.configure();
app.use(log4js.useLog());//设置日志输出格式
//app.use(log4js.connectLogger(this.logger('[def]'), {level:'auto', format:':method :url'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 托管静态资源(符号+字体)
app.use('/sprite',express.static(__dirname + '/public/sprite'));
app.use('/fonts',express.static(__dirname + '/public/fonts'));
//app.use('/css',express.static(__dirname + '/public/css'));
//app.use('/scripts',express.static(__dirname + '/public/scripts'));


// app.route()返回一个单例模式的路由的实例
// 这里的':ts',':z'等均为request对象的参数名,用request.parms.z获取参数值
app.route('/:ts/:z/:x/:y.*').get(routeHandlers.getTile);
app.route('/:ts/meta.json').get(routeHandlers.getInfo);
app.route('/ping').get(routeHandlers.ping);
app.route('/').get(routeHandlers.healthStatus);

//测试多进程集群是否正常使用(目前windows环境中测试失败,linux测试成功)
app.route('/cluster').get(function(req,res){
	res.send('worker'+cluster.worker.id+',PID:'+process.pid);
	log.info('worker'+cluster.worker.id+',PID:'+process.pid);
});
/*app.listen(config.PORT, config.IPADDRESS, function() {
	console.info('TileServer on http://%s:%s', config.IPADDRESS, config.PORT);
});*/

// 输出模型app
module.exports = app;
