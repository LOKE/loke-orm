var Model = require('./model');
var Q = require('q');

function createMapper(fields, reverse) {
  var fieldArr = [];
  for (var id in fields) {
    if (reverse) {
      fieldArr.push([fields[id], id]);
    } else {
      fieldArr.push([id, fields[id]]);
    }
  }
  return function(obj) {
    var res = {};
    fieldArr.forEach(function(f) {
      var prop = f[1];
      var val = obj[prop];
      if (val !== undefined) {
        res[f[0]] = val;
      }
    });
    return res;
  };
}

function Repository(bookshelf, def) {
  var table = def.table;
  var fields = def.fields;
  var relations = def.relations;

  var bookselfDef = {
    tableName: table,
    parse: createMapper(fields,false),
    format: createMapper(fields,true)
  };
  var model = bookshelf.Model.extend(bookselfDef);

  Object.defineProperty(this, '_model', {enumerable:false, writable:false, value:model});
  Object.defineProperty(this, '_fields', {enumerable:false, writable:false, value:fields});

  // model.parse = function(attrs) {
  //   console.log('parse2',attrs);
  //   return attrs;
  // };
  // model.format = function(attrs) {
  //   console.log('format2',attrs);
  //   return attrs;
  // };
}

Repository.prototype.create = function(initialVals) {
  var instance = this._model.forge(initialVals);
  return new Model(this._fields, instance);
};

Repository.prototype.getById = function(id) {
  var self = this;
  var BookshelfModel = self._model;
  return Q.when(new BookshelfModel({i: id}).fetch())
    .then(function(instance) {
      return new Model(self._fields, instance);
    });
};

Repository.prototype.find = function(query) {
  // body...
};

Repository.prototype.update = function(entity) {
  // body...
};

module.exports = exports = Repository;
