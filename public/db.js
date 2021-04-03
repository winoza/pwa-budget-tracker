const indexedDB = 
    window.indexedDB ||
    window.mozIndexedDB || window.webkitIndexedDB || 
    window.msIndexedDB || window.shimIndexedDB;
    
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || 
    window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || 
    window.webkitIDBKeyRange || window.msIDBKeyRange
 
if (!window.indexedDB) {
   window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

let db;

const request = indexedDB.open("budget", 1);
request.onerror = function(event) {
    console.log("Why didn't you allow my web app to use IndexedDB?!");
  };
  request.onsuccess = function(event) {
    db = event.target.result;
  };

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
      checkDatabase();
    }
};

request.onerror = (e) => {
    console.log("Something went wrong! " + e.target.errorCode);
};

saveRecord = (record) => {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
  
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => {        
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
      }
    };
  }

window.addEventListener("online", checkDatabase);