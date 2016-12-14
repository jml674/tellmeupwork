var Injector = {
	_injectedTabs:{},
	_promises: [],
  _sidebarFrameId: -1,
	_automaticInjectionScripts:["common/vendor/js/jquery.min.js","content_scripts/injection.js"],
  _injectionsStyle:"#iframe {\n"+
      "position: fixed !important;\n"+
      "z-index: 2147483647 !important;\n"+
      "width: 415px !important;\n"+
      "height: 100% !important;\n"+
      "top: 0 !important;\n"+
      "right: 0 !important;\n"+
      "border: none !important;\n"+
      "outline: 0;\n"+
      "display: inline;\n"+
  "}\n",


	registerHandlers:function(){
    let onDestroy = this._onContextDestroy.bind(this);
    let onReplace = this._onTabReplace.bind(this);
    chrome.webNavigation.onBeforeNavigate.addListener(onDestroy);
    chrome.tabs.onRemoved.addListener(onDestroy);
    chrome.tabs.onReplaced.addListener(onReplace);
  },
  _makeInjectionPromise:function(tabId, details) {
    return new Promise((resolve, reject)=> {
        chrome.tabs.executeScript(tabId, details, result=> {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            return resolve(result);
        });
    });
  },

  _newContext:function(event) {
      if (!event.tabId) {
          return;
      }

      if (event.frameId === 0) {
          log(`Top frame loading finished, tabId: ${event.tabId}`);                  
      }
      else return;

      let promises = this._automaticInjectionScripts.map(file => {
          log(`Injecting '${file}' into main frame of tabId '${event.tabId}'`);
          return this._makeInjectionPromise(event.tabId, {file, allFrames: false});
      });

      Promise.all(promises)
          .catch(err=> {
              log(err);
          });
  },
  _onTabReplace:function(addedTabId, removedTabId) {
      this._onContextDestroy({
          tabId: removedTabId
      });
  },
  _onContextDestroy:function(event){
      if (!event.tabId) {
          return;
      }
      if (event.frameId == 0) {
        log("_onContextDestroy called");
        delete this._promises[event.tabId];
        delete this._injectedTabs[event.tabId];
      }
      //this.toggle(event.tabId, "sidebar");  
  },
_runInjector:function(tabId){
      if (this._hasInjector(tabId)) {
          return Promise.reject(new Error(`Tab '${tabId}' already has injector`));
      }
      if (this._promises[tabId]) {
          return this._promises[tabId];
      }

      return this._promises[tabId] = Promise.resolve()
          .then(()=> {
              let promises = this._automaticInjectionScripts.map(file => {
                  log(`Injecting '${file}' into main frame of tabId '${tabId}'`);
                  return this._makeInjectionPromise(tabId, {file, allFrames: false});
              });
              return Promise.all(promises)
                      .catch(err=> {
                      log(err);
              });
          })
          .then(()=> {
              delete this._promises[tabId];
              this._injectedTabs[tabId] = [];
          }, err=> {
              delete this._promises[tabId];
              log(err);
              return Promise.reject(err);
          });
  },
  _runInjection:function(tabId, name){
      if (!this._hasInjector(tabId)) {
          return Promise.reject(new Error(`Tab '${tabId}' has no injector`));
      }
      if (this._hasInjection(tabId, name)) {
          return Promise.reject(new Error(`Tab '${tabId}' already has injection '${name}'`))
      }

      return new Promise((resolve, reject)=>{
          chrome.tabs.sendMessage(tabId, {
              action: "inject",
              name,
              src: chrome.runtime.getURL("pages/sidebar.html"),
              style: this._getStyle(name)
          }, message=>{
              if (chrome.runtime.lastError) {
                  log("got error", chrome.runtime.lastError);
                  return reject(chrome.runtime.lastError);
              }
              if (message.error) {
                  log("got error", message.error);
                  return reject(new Error(message.error));
              }
              this._injectedTabs[tabId].push(name);
              resolve(message);
          });
      });
  },    
toggle:function(tabId, name){
      console.log("toggling")
      return this.sendFrameAction(tabId, name, "toggle");
  },
  _hasInjector:function(tabId){
      return Boolean(this._injectedTabs[tabId]);
  },

  _hasInjection:function(tabId, name){
      return this._hasInjector(tabId) && (this._injectedTabs[tabId] || []).indexOf(name) !== -1;
  },
  sendFrameAction: function(tabId, name, action){
      if (this._hasInjection(tabId, name)) {
           return this._sendFrameMessage(tabId, name, action);
      }

      if (this._hasInjector(tabId)) {
          return this._runInjection(tabId, name)
          .then(() => this._sendFrameMessage(tabId, name, action));
      }

      return this._runInjector(tabId)
          .then(()=>{
              return this._runInjection(tabId, name);
          })
          .then(() => this._sendFrameMessage(tabId, name, action))
          .catch(log);
  },
  _sendFrameMessage:function(tabId, name, action) {
      return new Promise((resolve, reject)=>{
          chrome.tabs.sendMessage(tabId, {
              action,
              name
          },
          {frameId: 0},
          message=>{
              if (chrome.runtime.lastError) {
                  return reject(chrome.runtime.lastError);
              }
              if (message.error) {
                  log("got error", message.error);
                  return reject(new Error(message.error));
              }
              return resolve(message);
          });
      });
  },
  _getStyle:function(name){
      return this._injectionsStyle;
  },
  inject:function(scriptName,tabId){
    chrome.tabs.executeScript(tabId, {file:scriptName, allFrames: false, runAt:"document_end"}, result=> {
          });
  },
  setSidebarFrameId:function(frameId){
    this._sidebarFrameId = frameId;
  },

  getSidebarFrameId:function(){
    return this._sidebarFrameId;
  },
  
};
Injector.registerHandlers();