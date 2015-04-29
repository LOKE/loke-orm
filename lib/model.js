module.exports = exports = function(methods) {

  function Model(fields, bookshelfModel) {
    var self = this;

    Object.defineProperty(this, '_data', {enumerable:false, writable:false, value:bookshelfModel});

    for (var id in fields) {
      Object.defineProperty(this, id, {enumerable:true, get:getProp.bind(this,id), set:setProp.bind(this,id)});
    }

    function getProp(colName) {
      return bookshelfModel.get(colName);
    }

    function setProp(colName, value) {
      bookshelfModel.set(colName, value);
    }
  }


  Model.prototype.getDbEntity = function() {
    return this._data;
  };

  for (var name in methods) {
    Model.prototype[name] = methods[name];
  }

  return Model;
};

