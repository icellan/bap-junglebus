"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.getDB=void 0;var _regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")),_mongodb=_interopRequireDefault(require("mongodb")),_config=require("../config"),db=null,getDB=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(){var b;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(db){a.next=5;break}return b=new _mongodb["default"].MongoClient(_config.mongoUrl,{useNewUrlParser:!0,useUnifiedTopology:!0,keepAlive:1}),a.next=4,b.connect()["catch"](function(a){console.log(a),process.exit(-1)});case 4:db=b.db(_config.dbName);case 5:return a.abrupt("return",db);case 6:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.getDB=getDB;