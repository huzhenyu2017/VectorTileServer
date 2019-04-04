"use strict";

var config = require('../config');
var MBTiles = require('mbtiles');
var path = require('path');
var fs = require('fs');

var TileService = function(query) {
	this.q = query;
};

TileService.prototype.getInfo = function(done) {
  this._initMBTiles(function(err, mbtiles) {
    if (err) return done(err);
    mbtiles.getInfo(function(err, info) {
      if (err) return done(new Error('cannot get metadata'));
      done(null, info);
    });
  });
};

TileService.prototype.getTile = function(done) {
  var that = this;
  that._initMBTiles(function(err, mbtiles) {
    if (err) return done(err);
    mbtiles.getTile(that.q.params.z, that.q.params.x, that.q.params.y, function(err, tile, headers) {
      if (err) return done(err);
      done(null, tile, headers);
    });
  });
};


//初始化mbtiles对象,如果初始化正常,返回mbtiles对象
TileService.prototype._initMBTiles = function(done) {
  var mbtilesfile = path.join(config.TILES_DIR, this.q.params.ts + '.mbtiles');
  fs.exists(mbtilesfile, function (exists) {
    if (!exists) return done(new Error('cannot find MBTiles file on server: ' + mbtilesfile));
    new MBTiles(mbtilesfile, function(err, mbtiles) {
      if (err) return done(new Error('cannot initialize MBTiles object'));
      done(null, mbtiles);//将done()函数作为参数传递,并调用(传回MBTiles对象mbtiles)
    });
  });
};

module.exports = TileService;//把TileService类暴露给外部调用
