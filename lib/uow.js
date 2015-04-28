var Q = require('q');

function Uow(bookshelf, repos) {
  Object.defineProperty(this, '_bookshelf', {enumerable:false, writable:false, value:bookshelf});
  for (var repoName in repos) {
    Object.defineProperty(this, repoName, {enumerable:true, writable:false, value:repos[repoName]});
  }
  this._watched = [];
}

Uow.prototype.commit = function() {
  var self = this;
  return Q(self._bookshelf.transaction(function(t) {
    return Q.all(self._watched.map(function(i) {
      return i.getEntity().save(null, {transacting: t});
    }));
  }));
};

Uow.prototype.add = Uow.prototype.update = function(entity) {
  this._watched.push(entity);
};

module.exports = exports = Uow;
