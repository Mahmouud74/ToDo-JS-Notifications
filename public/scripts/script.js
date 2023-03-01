var taskTitle=document.getElementById("taskTitle");
var hours = document.getElementById("hours");
var minutes = document.getElementById("minutes");
var day = document.getElementById("day");
var month = document.getElementById("month");
var year = document.getElementById("year");
var addButton = document.getElementById("add");
function changetTimeOut(){
    dbConn.showTasks().then(function(tasks){
        tasks.forEach((elem)=>{
            if(elem.status=="unDone"){
                setTimeout(function(){
                    app.displayNotification({body:elem.name,data:{dateOfArrival:elem.date.getTime()}});
                    elem.status="done";
                    dbConn.doneTask(elem);
                    document.getElementById(elem.name).style.textDecorationLine= "line-through";
                },elem.date.getTime()-(new Date))
            }
            else{
                document.getElementById(elem.name).style.textDecorationLine= "line-through";
            }
        })
    })
}
addButton.addEventListener("click",()=>{
    //console.log(taskTitle.value);2015-03-25T12:05:00Z
    let item = {name:taskTitle.value,status:"unDone",date:new Date(`${year.value}-${month.value}-${day.value}T${hours.value}:${minutes.value}:00`)}
    console.log(item.date);
    let items = [item];
    console.log(items);
    dbConn.addTask(items);
})


/// displaying tasks


// array of all tasks
var arrayOfTasks=[];
var tasksLength = document.getElementById("taskss").children.length;


var dbConn=(function(){

    //checking for indexed db in window
    if(!('indexedDB' in window)){
        console.log('This browser does not support indexedDB')
        return;
      }
      //Creating the DataBase
      //var dbPromise = idb.open('toDo');
      var dbPromise = idb.open('toDo',2,function(upgradeDB){
        switch(upgradeDB.oldVersion){
          case 0:
            case 1:
              console.log('creating tasks table')
              upgradeDB.createObjectStore('tasks',{keyPath:'name'})
              break;
    
          case 2:
            console.log('creating name index')
            var store = upgradeDB.transaction.objectStore('tasks')
            store.createIndex('name','name',{unique:true})
            break;
        }
      })
      /// add Tast
      function addTask(items) {

        // TODO 3.3 - add objects to the tasks store
        dbPromise.then(function(db){
          var tx = db.transaction('tasks','readwrite')
          var store = tx.objectStore('tasks');

          return Promise.all(items.map(function(item){
            console.log('Adding item',item)
            return store.add(item)
          }))
          .catch(function(e){
            tx.abort()
          })
          .then(function(){
            dbConn.displayTasks();
            console.log('All items added')
          })
        })
      }

      ///show all tasks
      function showTasks(){
        return dbPromise.then(function(db){
            var tx = db.transaction('tasks','readonly')
            var store = tx.objectStore('tasks')
            return store.getAll();
          })
      }
      function displayTasks() {

        let s;
        showTasks().then(function(tasksArray) {
          if (!tasksArray.length) {return;}
          //console.log(tasksArray);
          changetTimeOut();
          document.getElementById("taskss").innerHTML=``;
          for (let i = 0; i < tasksArray.length; i++) {
            document.getElementById("taskss").innerHTML+=`
            <p id="${tasksArray[i].name}">${tasksArray[i].name} &nbsp;<input type="button" value="X" id="delete${tasksArray[i].name}"></p>`
          }

            for (let i = 0; i < tasksArray.length; i++) {
                document.getElementById("delete"+tasksArray[i].name).addEventListener('click',function(){
                    dbConn.deleteTask(tasksArray[i].name);
                    console.log("XX");
                    displayTasks();
                })    
            }
        }).then(function() {
          if (document.getElementById("taskss")===``){
            document.getElementById('taskss').innerHTML = `<p> no tasks<p>`;
          }
        });
      }      
      /// get by name
      function getByName(key) {

        // TODO 4.3 - use the get method to get an object by name
        return dbPromise.then(function(db){
          var tx = db.transaction('tasks','readonly')
          var store = tx.objectStore('tasks')
          return store.get(key)
        })
      }
      function doneTask(tasks){
    

        // TODO 5.7 - update the items in the 'tasks' object store
        dbPromise.then(function(db){
          var tx = db.transaction('tasks','readwrite')
          var store = tx.objectStore('tasks')
          return store.put(tasks)
          .catch(function(e){
            tx.abort()
          })
          .then(function(){
            console.log("Done operation")
          })
       
      }).then(function() {
        console.log('task Done successfully!');

      });
    }

        //getByName(key).then        
      
      /// delete task
      function deleteTask(key){
        dbPromise.then(function(db){
            var tx = db.transaction('tasks','readwrite')
            var store = tx.objectStore('tasks');
            store.delete(key);
            //displayTasks();
        }).catch(function(e){
            tx.abort();
        }).then(function(){
            console.log("deleted");
        })

        //getByName(key).then
      }
      return {
        dbPromise: (dbPromise),
        addTask: (addTask),
        getByName: (getByName),
        showTasks:(showTasks),
        displayTasks:(displayTasks),
        deleteTask:(deleteTask),
        doneTask:(doneTask)
      };
    })();

    dbConn.displayTasks();



    const app = (() => {
        'use strict';
        let swRegistration = null;
        const notifyButton = document.querySelector('.js-notify-btn');
        document.getElementById("request").addEventListener("click", () => {

          });
        // TODO 2.1 - check for notification support
        Notification.requestPermission((status) => {
            console.log("Notification permission status:", status);
          });
       if(!('Notification' in window)){
          console.log('This browser does not support notification')
          return;
       }
        // TODO 2.2 - request permission to show notifications

       
        function displayNotification(options) { 
          // TODO 2.3 - display a Notification
          if(Notification.permission == 'granted'){
            navigator.serviceWorker.getRegistration().then(reg=>{
              let date =new Date(2024, 1, 27, 20, 25); // 0-indexed month
              console.log(date);
              reg.showNotification('Time for Task',options)
            })
          }
        }
        
      
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => { 
              // console.log('Service Worker and Push is supported');
        
              navigator.serviceWorker.register('sw.js')
              .then(swReg => {
                console.log('Service Worker is registered', swReg);
        
                swRegistration = swReg;
        
                // TODO 3.3a - call the initializeUI() function
              })
              .catch(err => {
                console.error('Service Worker Error', err);
              });
            });
          } else {
            console.warn('Push messaging is not supported');
          }
        
      return {
        displayNotification:(displayNotification)
      }
      })();
      