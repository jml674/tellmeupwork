var Messenger = {
	_methodPrefix:"_onMessage_",
	_receivers : [],
	_registerHandlers(){
        chrome.runtime.onMessage.addListener(this._onMessage.bind(this));
    },
    initialize:function(){
        this._registerHandlers();
    },
    addReceiver: function(receiverName,receiver){
    	this._receivers[receiverName] = receiver;
    },
    _onMessage: function(message, from, reply){
        var error;
        if (typeof message !== "object") {
            log(error = "Got non-object message", message);
        } else if (!message.action) {
            log(error = "Message has no action", message);
        } else if (typeof message.action !== "string") {
            log(error = "Wrong action type", message);
        } //else if (!from || !from.tab || !from.tab.id) {
          //  log(error = "Only messages from tabs with available 'id' are served");
        //}
        if (error) {
            return reply({error});
        }

        var [receiver,method] = message.action.split(".");
        var promise = Promise.resolve();
        if (receiver === "self") {
            promise = promise.then(()=>{
                return new Promise((resolve, reject)=>{
                    chrome.tabs.sendMessage(
                        from.tab.id,
                        Object.assign({}, message, {action: method}),
                        result=>{
                            if (chrome.runtime.lastError) {
                                return reject(chrome.runtime.lastError);
                            }
                            if (result.error) {
                                return reject(result.error);
                            }
                            resolve(result.data);
                        }
                    )
                })
            });
        } else {
            var computedMethodName = this._methodPrefix+method;
            if (!this._receivers[receiver]) {
                log(error = `Got no receiver '${receiver}'`);
            } else if (!method) {
                log(error = "Empty method name", message);
            } else if (!this._receivers[receiver][computedMethodName]) {
                log(error = `Receiver '${receiver}' has no method '${method}'`);
            }
            if (error) {
                return reply({error});
            }

            promise = promise.then(()=>{
                // we can run sync and async methods
                //setting frame id if not set yet.
                if (from.tab){
                  from.tab.frameId = from.tab.frameId || from.frameId;
                }
                return this._receivers[receiver][computedMethodName](message.data, from, reply);
            });
        }
        log(`got call of '${message.action}'`);

        promise.then(data=>{
            reply({ok: true, data});
        }, error=>{
            if (typeof error === "object" && error.message) {
                return reply({error: error.message});
            }
            reply({error});
        });

        // we are async
        return true;
    },
    sendToMainPage: function (tabId,name,action,data){
      return new Promise(function(resolve, reject) {
        chrome.tabs.sendMessage(tabId, 
          {name:name, action:action,data:data},
          {frameId: 0},
          function(result){
            if (chrome.runtime.lastError) {
              log("got error "+chrome.runtime.lastError.message+" "+tabId);
              reject(new Error("Can't send "+action+" to tab "+tabId));
            }
            else{
              resolve(result);
            }
          });
      });
    },
    sendToSidebar: function (tabId,action,data){
      return new Promise(function(resolve, reject) {
        console.log("sending "+action+ " to Sidebar frameId="+Injector.getSidebarFrameId())
        chrome.tabs.sendMessage(tabId, 
          {action:action,data:data},
          {frameId: Injector.getSidebarFrameId() },
          function(result){
            if (chrome.runtime.lastError) {
              log("got error "+chrome.runtime.lastError.message+" "+tabId);
              reject(new Error("Can't send "+action+" to tab "+tabId));
            }
            else{
              resolve(result);
            }
          });
      });
    }
};
Messenger.initialize();