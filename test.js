var orm = require('./lib');

var config = {
  host: 'localhost',
  user: 'root',
  database: 'test'
};

var repos = {
  merchants: {
    fields: {
      id:'ID',
      name:'Name'
    },
    table: 'Merchants'
  },
  customers: {
    fields: {

    },
    table: 'Customers'
  }
};


//// BEGIN TEST ////

// This should be done once per application
var repoProvider = orm.createRepositoryProvider(config, repos);

// This should be done once per request
var uow = repoProvider.startUow();
var merchant = uow.merchants.create();

merchant.name = 'Testing Merchant';

uow.merchants.getById(1)
.then(function(merchant1) {
  console.log(JSON.stringify(merchant));
  merchant1.name = merchant1.name + '_';
  uow.update(merchant1);
})
.then(function() {
  uow.add(merchant);

  // this will commit both the new merchant, plus the updated merchant
  return uow.commit();
})
.then(function() {
  console.log('Saved');
})
.fail(function(err) {
  console.error(err);
})
.then(function() {
  return repoProvider.destroy();
})
.then(function() {
  console.log('Done');
});