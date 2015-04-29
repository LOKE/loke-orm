var RepositoryProvider = require('./repository-provider');
var knex = require('knex');
var bookshelf = require('bookshelf');

function createProvider(dbConfig, repositories) {
  var knexConn = knex({
    client:'mysql',
    connection: {
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: dbConfig.charset || 'utf8'
    }
  });

  knexConn.on('query', function(query) { console.log(query); });

  return new RepositoryProvider(bookshelf(knexConn), repositories);
}

exports.createProvider = createProvider;
