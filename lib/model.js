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


Model.prototype.getEntity = function() {
  return this._data;
};
module.exports = exports = Model;

