var notification= {
  notificationIds:[],
  display:function(title,message,permanent){
    chrome.notifications.create({
            type: 'basic',
            iconUrl: 'common/icons/recann-32.png',
            title: title,
            message: message
          }, function (id) {
            if (permanent){
              notification.notificationIds.push({id:id,title:title,message:message});
            }
            console.log("Notif id:"+ id);
            return id;
          });
  },
  getById:function(notificationId){
    var result = null;
    this.notificationIds.forEach((value,index)=>{
      if (value.id == notificationId){
        result={index:index,title:value.title,message:value.message};
      }
    })
    return result;
  }
}
chrome.notifications.onClosed.addListener((notificationId,byUser)=>{
  console.log("Notification closed: "+notificationId+" "+byUser);
  var notif = notification.getById(notificationId);
  if (notif){
    notification.notificationIds.splice(notif.index,1);
    if(!byUser){
      notification.display(notif.title,notif.message,true);
    }
  }
})