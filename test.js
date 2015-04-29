var orm = require('./lib');

var config = {
  host: 'localhost',
  user: 'root',
  database: 'test'
};

var repos = {
  
  merchants: {
    table: 'Merchants',
    primaryKey: 'id',
    fields: {
      id:'ID',
      name:'Name'
    },
    relations: {
      customers: {
        hasMany: 'customers',
        foreignKey: 'merchantId'
      }
    }
  },

  customers: {
    table: 'Customers',
    primaryKey: 'id',
    fields: {
      id:'ID',
      firstName:'FirstName',
      lastName:'LastName',
      merchantId:'MerchantID'
    },
    relations: {
      merchant: {
        belongsTo: 'merchants',
        foreignKey: 'merchantId'
      }
    }
  }

};


//// BEGIN TEST ////

// This should be done once per application
var repoProvider = orm.createRepositoryProvider(config, repos);

// This should be done once per request
var uow = repoProvider.startUow();
var merchant = uow.merchants.create();
merchant.name = 'Testing Merchant';
uow.add(merchant);

uow.customers.getById(1, {withRelated: ['merchant'], require:true})
.then(function(cust1) {
  console.log('cust1' ,JSON.stringify(cust1));
  try {
    console.log('cust1', cust1.getMerchant().get('name'));
  } catch(err) {
    console.error(err.stack);
  }
})
.fail(function(err) {
  console.error(err.stack);
});


// uow.merchants.getById(10)
// .then(function(merchant1) {
//   console.log('merchant1',JSON.stringify(merchant1));
//   if (merchant1 === null) return;
//   merchant1.name = merchant1.name + '_';
//   uow.update(merchant1);

//   return uow.merchants.findOne({name:'Testing Merchant'});
// })
// .then(function(merchantTest) {
//   console.log('deleting:',JSON.stringify(merchantTest));
//   uow.delete(merchantTest);
// })
// .then(function() {
//   // this will commit both the new merchant, plus the updated merchant
//   //return uow.commit();
// })
// .then(function() {
//   console.log('Saved');
// })
// .fail(function(err) {
//   console.error('COMMIT ERROR!',err.stack);
// })
// .then(function() {
//   return repoProvider.destroy();
// })
// .then(function() {
//   console.log('Done');
// });