var Options = {
  set(options){
    
    return this.get().then(_options=>{
        for (var prop in options) {
          //console.log("obj." + prop + " = " + options[prop]);
          _options[prop]=options[prop];
        }
        chrome.storage.local.set( _options, function() {
          // Update status to let user know options were saved.
          return true;
        });
    });
  },
  get(){
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get({
        bullhornPassword: "",
        bullhornUserName: "",
        emailHunterApiKey: "",
        mailBox:"me",
        fwSenderAllowed:"",
        mailAddressReporting :"",
        delay:1,
        silentMode:false,
        inputUrls:"" 
      }, function(options) {
        resolve(options);
      });
    });
  }
};
