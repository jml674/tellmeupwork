var CookieMgr = {
  getAll:function(){
    chrome.cookies.getAll({}, cookies => {
      console.log("getAll: nb of cookies="+cookies.length)
      cookies.forEach((c,i) => {
      });
    })
  },
  get:function(url,cookieName){
    return new Promise(function(resolve, reject) {
      chrome.cookies.get({url:url,name:cookieName}, cookie => {
        resolve(cookie);
      });
    });
  }
};