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
  return Q(self._bookshelf.transaction(function(transaction) {
    return Q.all(self._watched.map(function(i) {
      if (i.action === 'destroy') {
        return i.entity.getDbEntity()[i.action]({transacting: transaction});
      } else {
        return i.entity.getDbEntity()[i.action](null, {transacting: transaction});
      }
    }));
  }));
};

Uow.prototype.add = Uow.prototype.update = function(entity) {
  this._watched.push({action:'save',entity:entity});
};

Uow.prototype.delete = function(entity) {
  this._watched.push({action:'destroy',entity:entity});
};

module.exports = exports = Uow;
