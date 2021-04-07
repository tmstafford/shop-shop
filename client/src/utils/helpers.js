export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to db
    const request = window.indexedDB.open('shop-shop', 1);

    // create variables to hold reference to the db, transaction, and object store
    let db, tx, store;

    // if version has changed, run this and create the three object stores
    request.onupgradeneeded = function(e) {
      const db = request.result;
      // create object store for each type of data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    // handle any errors with connecting
    request.onerror = function(e) {
      console.log('There was an error');
    };

    // on success
    request.onsuccess = function(e) {
      // save reference of db to variable
      db = request.result;
      // open transaction to whatever we pass into storeName
      tx = db.transaction(storeName, 'readwrite');
      // save reference to that object store
      store = tx.objectStore(storeName);

      db.onerror = function(e) {
        console.log('error', e);
      };

      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No valid method');
          break;
      }

      // when transaction is complete, close the connection
      tx.oncomplete = function() {
        db.close();
      };
    };
  });
}