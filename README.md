# LOKE ORM

Custom ORM based on Bookshelf / Knex, mostly to fix some elements of Bookshelf we weren't happy with.

Designed to work with MySQL and a Unit or Work pattern.

*Currently in early alpha stages. NOTE: many-to-many relations no supported yet.*

## Overview

*Step 1:*

Create a new repository provider:

```js
var config = {
  host: 'localhost',
  user: 'root',
  password: 'mypassword',
  database: 'test'
};

var provider = require('loke-orm').createRepositoryProvider(config);
```

*Step 2:*

Define repositories:

```js
provider.addRepository('stuff', {
    // This is the table name in the database
    table: 'things',
    // Define the properties, and the database columns they map to
    fields: {id:'id', stuffName: 'stuff_name'}
});
```

Alternatively you can provide the repositories when calling `createRepositoryProvider()`. If you define the repositories in a JSON file or similar this is the best option.

```js
var repos = {
    stuff: {
        // This is the table name in the database
        table: 'things',
        // Define the properties, and the database columns they map to
        fields: {id:'id', stuffName: 'stuff_name'}
    }
};

var provider = require('loke-orm').createRepositoryProvider(config, repos);
```

*Step 2a (optional):*

Define the primary key by specifying the database column as an object:

```js
var repos = {
    stuff: {
        // This is the table name in the database
        table: 'things',
        // The primary key (note: only supports single column at present)
        primaryKey: 'id',
        // Define the properties, and the database columns they map to
        fields: {
            id: 'id',
            stuffName: 'stuff_name'
        }
    }
};
```

*Step 2b (optional):*

Define relational properties / methods using the relations property:

```js
var repos = {
    stuff: {
        // This is the table name in the database
        table: 'things',
        // Define the properties, and the database columns they map to
        fields: {
            id:{column:'id', primaryKey:true},
            blobId:{column:'id', foreignKey:'blobs', },
            stuffName: 'stuff_name'
        },
        relations: {
            blobs: {foreignKey:'blobId', table:''}
        }
    }
};
```

*Step 3:*

Start a new Unit of Work:

```js
var uow = provider.startUow();
```

*Step 4:*

Use the repositories through the Unit of Work. Use the add/update/delete methods. Note the actions won't take place just yet, this just prepares the transaction:

```js
var s = uow.stuff.create();
uow.add(s);

uow.stuff.getById(1)
.then(function(s) {
    s.stuffName = 'New Name';
    uow.update(s);
});

uow.stuff.getById(2)
.then(function(s) {
    uow.delete(s);
});
```

*Step 5:*

Commit the transaction:

```js
uow.commit()
.then(function() {
    console.log('Done!');
})
.fail(function(err) {
    console.error('Failed:', err);
});
```

*Step 6:*

You'll need to destroy the provider when you app shuts down, else there will still be connections to the database.

```js
provider.destroy()
.then(function() {
    console.log('Ready to close!'); 
});
```