var IconApplicationMgr={
  initialize:function(){
    Emitter.on(this,"JobsFound");
  },
  _onEventJobsFound:function(value){
    console.log("upworkAddonMgr: _onEventJobsFound "+value);
    IconApplicationMgr.set({number:value});
  },  
  set:function(property){
    var iconeFile = "";
    if (property.number){
      this._setBadge(property);
    }
    else{ 
    }
  },
  _setIcon:function(property){
    var iconeFile = "";
    if (property.loggedIn == true){
      iconeFile = "common/icons/recann-48x48-bgd.png"
    }
    else{
      iconeFile = "common/icons/recann-48x48-bgd-loggedout.png"
    }
    chrome.browserAction.setIcon({path:iconeFile}, function(){});
  },
  _setBadge:function(property){
    chrome.browserAction.setBadgeText({text:property.number});
  }
}
IconApplicationMgr.initialize();