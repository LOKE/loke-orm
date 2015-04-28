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
  var primaryKey = def.primaryKey;

  var bookselfDef = {
    tableName: table,
    parse: createMapper(fields,false),
    format: createMapper(fields,true)
  };
  var model = bookshelf.Model.extend(bookselfDef);

  Object.defineProperty(this, '_model', {enumerable:false, writable:false, value:model});
  Object.defineProperty(this, '_fields', {enumerable:false, writable:false, value:fields});
  Object.defineProperty(this, '_idField', {enumerable:false, writable:false, value:primaryKey});

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
  var query = {};
  query[this._idField] = id;
  return this.findOne(query);
};

/**
 * [findOne description]
 * @param  {Object|Function}  query Query definition
 * @param  {Object}           opts  Fetch options
 * @return {Promise<Object>}        The results
 */
Repository.prototype.findOne = function(query, opts) {
  var self = this;
  return Q.when(this._createQuery(query).fetch(opts))
    .then(function(instance) {
      if (!instance) return null;
      return new Model(self._fields, instance);
    });
};

/**
 * [find description]
 * @param  {Object|Function}  query Query definition
 * @param  {Object}           opts  Fetch options
 * @return {Promise<Array<Object>>} The results
 */
Repository.prototype.find = function(query, opts) {
  var self = this;
  return Q.when(this._createQuery(query).fetchAll(opts))
    .then(function(collection) {
      return collection.map(function(instance) {
        return new Model(self._fields, instance);
      });
    });
};

Repository.prototype._createQuery = function(query) {
  return typeof query === 'function' ?
    this._model.query(query) :
    this._model.where(query);
};

module.exports = exports = Repository;
