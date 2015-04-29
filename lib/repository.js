var Q = require('q');

function Repository(bookshelf, def, getRepository) {
  var self = this;

  var table = def.table;
  var fields = def.fields;
  var relations = def.relations;
  var primaryKey = def.primaryKey;

  var bookselfDef = {
    tableName: table,
    parse: createMapper(fields,false),
    format: createMapper(fields,true)
  };

  var methods = {};

  getRepository('test');

  for (var rname in relations) {
    bookselfDef[rname] = self._createRelation(relations[rname],getRepository);
    methods['get'+capitalizeFirstLetter(rname)] = createGetRelated(rname);
  }

  var model = bookshelf.Model.extend(bookselfDef);

  var Model = require('./model')(methods);

  Object.defineProperty(this, '_Model',     {enumerable:false, writable:false, value:Model});
  Object.defineProperty(this, '_model',     {enumerable:false, writable:false, value:model});
  Object.defineProperty(this, '_fields',    {enumerable:false, writable:false, value:fields});
  Object.defineProperty(this, '_idField',   {enumerable:false, writable:false, value:primaryKey});
}

Repository.prototype.getDbModel = function() {
  return this._model;
};

Repository.prototype.create = function(initialVals) {
  var instance = this._model.forge(initialVals);
  return new this._Model(this._fields, instance);
};

Repository.prototype.getById = function(id, opts) {
  var query = {};
  query[this._idField] = id;
  return this.findOne(query, opts);
};

/**
 * [findOne description]
 * @param  {Object|Function}  query Query definition
 * @param  {Object}           opts  Fetch options
 * @return {Promise<Object>}        The results
 */
Repository.prototype.findOne = function(query, opts) {
  var self = this;
  console.log(opts);
  return Q.when(this._createQuery(query).fetch(opts))
    .then(function(instance) {
      if (!instance) return null;
      return new self._Model(self._fields, instance);
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
        return new self._Model(self._fields, instance);
      });
    });
};

Repository.prototype._createQuery = function(query) {
  return typeof query === 'function' ?
    this._model.query(query) :
    this._model.where(query);
};

module.exports = exports = Repository;






Repository.prototype._createRelation = function(opts, getRepository) {
  if (opts.hasOne) return this._createOneToOne(opts, getRepository);
  else if (opts.hasMany) return this._createOneToMany(opts, getRepository);
  else if (opts.belongsTo) return this._createParent(opts, getRepository);
  else if (opts.belongsToMany) return this._createManyToMany(opts, getRepository);
};

Repository.prototype._createOneToOne= function(opts, getRepository) {
  return function() {
    return this.hasOne(getRepository(opts.hasOne).getDbModel(), opts.foreignKey);
  };
};

Repository.prototype._createOneToMany = function(opts, getRepository) {
  return function() {
    var repo = getRepository(opts.hasMany).getDbModel();
    console.log(repo);
    console.log(opts);
    return this.hasMany(getRepository(opts.hasMany).getDbModel(), opts.foreignKey);
  };
};

Repository.prototype._createParent = function(opts, getRepository) {
  return function() {
    var repo = getRepository(opts.belongsTo).getDbModel();
    console.log(repo);
    console.log(opts);
    return this.belongsTo(getRepository(opts.belongsTo).getDbModel(), opts.foreignKey);
  };
};

Repository.prototype._createManyToMany = function(opts) {
  var getRepository = this._getRepository;
  return function() {
    return this.belongsToMany(getRepository(opts.belongsToMany).getDbModel(), opts.table, opts.foreignKey, opts.otherKey);
  };
};

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

function createGetRelated(rname) {
  return function() {
    return this._data.related(rname);
  };
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
}

