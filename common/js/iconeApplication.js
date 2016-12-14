var IconApplicationMgr={
  set:function(property){
    var iconeFile = "";
    if (property.loggedIn == true){
      iconeFile = "common/icons/recann-48x48-bgd.png"
    }
    else{
      iconeFile = "common/icons/recann-48x48-bgd-loggedout.png"
    }
    chrome.browserAction.setIcon({path:iconeFile}, function(){});
  }
}