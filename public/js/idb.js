let db;
const request = indexedDB.open('budge_tracker', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

  // upon a successful request
request.onsuccess = function(e) {
  db = e.target.result;
  
  // check if app is online, if yes run uploadPizza()
  if (navigator.onLine) {
    uploadTransaction();
  }
};
  //error catch
request.onerror = function(e) {
  console.log(e.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    // access the object store
    const budgetObjectStore = transaction.objectStore('new_transaction');
    // add record to your store with add method
    budgetObjectStore.add(record);
};

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access your object store
    const budgetObjectStore = transaction.objectStore('new_transaction');
    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
    //On successful getAll
    getAll.onsuccess = function(){
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
              method: 'POST',
              body: JSON.stringify(getAll.result),
              headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              }
            })
              .then(response => {
                return response.json();
              })
              .then(() => {
                // open one more transaction
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                // access the newTransaction object store
                const budgetObjectStore = transaction.objectStore('new_transaction');
                // clear all items in your store
                budgetObjectStore.clear();
      
                alert('All saved transactions has been submitted!');
              })
              .catch(err => {
                console.log(err);
              })
        }
    }
}

window.addEventListener('online', uploadTransaction);