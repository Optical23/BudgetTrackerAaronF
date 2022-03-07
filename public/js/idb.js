let db;

const request = indexedDB.open('budge-tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(e) {
    // save a reference to the database 
    const db = e.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('newTransaction', { autoIncrement: true });
};

  // upon a successful 
request.onsuccess = function(e) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = e.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
      // we haven't created this yet, but we will soon, so let's comment it out for now
      uploadTransaction();
    }
  };
  
  request.onerror = function(e) {
    //Console.log error
    console.log(e.target.errorCode);
};

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['newTransaction'], 'readwrite');
  
    // access the object store for `budget-data`
    const budgetObjectStore = transaction.objectStore('newTransaction');
  
    // add record to your store with add method
    budgetObjectStore.add(record);
};

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['newTransaction'], 'readwrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('newTransaction');

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
    //On successful getAll
    getAll.onsuccess = function(){
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk')
        }
    }
}