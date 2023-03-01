self.addEventListener('notificationclick',event=>{
    const notification = event.notification
    const primaryKey = notification.data.primaryKey
    const action = event.action
    if(action === 'close'){
        notification.close()
    }
    else{
        notification.close()
}

})