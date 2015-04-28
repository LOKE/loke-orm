var Q = require('q');
var Repository = require('./repository');
var Uow = require('./uow');

function RepositoryProvider(bookshelf, repositories) {
  var self = this;

  Object.defineProperty(this, '_bookshelf', {enumerable:false, writable:false, value:bookshelf});
  Object.defineProperty(this, '_repositories', {enumerable:false, writable:false, value:{}});

  if (repositories) {
    for (var name in repositories) {
      self.addRepository(name, repositories[name]);
    }
  }
}

RepositoryProvider.prototype.destroy = function() {
  return Q.ninvoke(this._bookshelf.knex, 'destroy');
};

RepositoryProvider.prototype.startUow = function() {
  return new Uow(this._bookshelf, this._repositories);
};

RepositoryProvider.prototype.addRepository = function(name, def) {
  // use repo name as table name if not defined
  def.table = def.table || name;
  this._repositories[name] = new Repository(this._bookshelf, def);
};

module.exports = exports = RepositoryProvider;
