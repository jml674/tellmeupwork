const extensionName ="upwork";
const POPUP_STATE="minimized";
const POPUP_FOCUSED=false;
const POPUP_TYPE="normal";
const SCAN_PERIOD=1800000;
//const SCAN_PERIOD=60000;

const GAP='UA-39332177-5';
const APP_ID = 'Tellmeupwork';

var service = analytics.getService(APP_ID);
var tracker = service.getTracker(GAP);  // Supply your GA Tracking ID.

chrome.identity.getProfileUserInfo(function(userInfo) {
 /* Use userInfo.email, or better (for privacy) userInfo.id
    They will be empty if user is not signed in in Chrome */
    console.log(now(),"userInfo:",userInfo);
    //tracker.sendAppView("StartingExtension");
    chrome.runtime.onInstalled.addListener(function(details){
      tracker.sendEvent('system-'+details.reason,"tmu-"+chrome.runtime.getManifest().version, userInfo.email);
    }); 
});

// context menu
chrome.contextMenus.create({contexts:["all"],title:"Add Url to watch list ",id:"TellMeUpwork-AddUrl",documentUrlPatterns:["https://www.upwork.com/ab/find-work/*"]}, function(){

});
chrome.contextMenus.onClicked.addListener(function(info,tab){
  if(info.menuItemId == "TellMeUpwork-AddUrl"){
    console.log(now(),"Adding url "+tab.url);
    Options.get().then(options=>{
      var _options = options.inputUrls.split(",");
      if (!_options.find(function(element){
        return element == tab.url;
      })){
        options.inputUrls+=(options.inputUrls.length?",":"")+tab.url;
        Options.set({inputUrls:options.inputUrls});  
      }
      else{
        alert("url already monitored !!");
      }
      
    });
  }
}); 

// show sidebar
chrome.browserAction.onClicked.addListener(tab=>{
 
});

//Messenger.addReceiver("Search",Search);

var UpworkAddonMgr = {
  _window:null,
  _criteria:null,
  _callbackForWindow: null,  
  _lastJobs:[],
  _onMessage_jobs: function(data,from){
    if (this._callbackForWindow){
      this._callbackForWindow(data);
      this._callbackForWindow = null;
    }
  },
  _onMessage_ready: function(data,from,reply){
    reply({criteria : this._criteria});
  },
  
  initialize:function(){
    //Emitter.emit("LoggedInOutUpwork",false);
    
    Options.get().then(options=>{
      var urls=options.inputUrls.split(",");
      //urls.push("https://www.upwork.com/ab/find-work/712161");
      //urls.push("https://www.upwork.com/ab/find-work/695557");
      var jobs1=[];
      CookieMgr.get("https://.upwork.com/ab/account-security","master_refresh_token").then(cookie=>{
        if (cookie){
          if(options.inputUrls.length!=0) {
            this.scanPage(urls,0,jobs1,options);
          }
        }
        else{
          chrome.tabs.create({url:"https://www.upwork.com/ab/account-security/login"}, function (){})
        }
      });
      setInterval(()=>{
        var jobs2=[];
        Options.get().then(options=>{
          urls=options.inputUrls.split(",");
          CookieMgr.get("https://.upwork.com/ab/account-security","master_refresh_token").then(cookie=>{
            if (cookie){
              if(options.inputUrls.length!=0){
                this.scanPage(urls,0,jobs2,options);
              }
            }
            else{
              chrome.tabs.create({url:"https://www.upwork.com/ab/account-security/login"}, function (){})
            }
          });
        });
      },SCAN_PERIOD);
    })
  },
  scanPage:function(urls,index,jobs,options){
      //if (index==0){
          this.createWindow(urls[index]).then(result=>{
            this._window = result.window;
            console.log(now(),"scanPage1 jobs",result.jobs);
            jobs = jobs.concat(result.jobs);
            //if (index==urls.length-1){
              if (this._window) chrome.windows.remove(this._window.id);
              if (index<urls.length-1) this.scanPage(urls,index+1,jobs,options);
              else this.processJobs(jobs,options); 
              //this.processJobs(jobs);
            /*}
            else{
              this.scanPage(urls,index+1,jobs);
            }*/
          });
      //}
      /*else{
        this.updateWindow(urls[index]).then(result=>{
            console.log(now(),"scanPage2 jobs",result.jobs);
            jobs = jobs.concat(result.jobs);
            if (index==urls.length-1){
              if(this._window) chrome.windows.remove(this._window.id);
              this.processJobs(jobs);
            }
            else{
              this.scanPage(urls,index+1,jobs);
            }
          });
      }*/
  },
  createWindow:function(url){
    return new Promise((resolve, reject) => {
      console.log(now(),"Creating window for url:"+url)
      chrome.windows.create({type: POPUP_TYPE ,state:POPUP_STATE,url:url+"&upworkFlag"},(window)=>{
        this._callbackForWindow = function(reply){
          resolve({window:window,jobs:reply});
        };
        chrome.tabs.executeScript(window.tabs[0].id, {file:"common/vendor/js/jquery.min.js", allFrames: false, runAt:"document_end"}, result=> {
          chrome.tabs.executeScript(window.tabs[0].id, {file:"content_scripts/processUpwork.js", allFrames: false, runAt:"document_end"}, result=> {
            
          });
        });
      });
    });
  },
  updateWindow:function(url){ // DOE NOT WORK, FOR SPME REASON JQUERY SCRIPT IS NOT INJECTED
    return new Promise((resolve, reject) => {
      chrome.windows.get(this._window.id,{populate:true},(window)=>{
        this._callbackForWindow = function(reply){
                resolve({window:window,jobs:reply});
        };
        setTimeout(()=>{
          chrome.tabs.update(window.tabs[0].id,{url:url+"&upworkFlag"},(tab)=>{
            chrome.tabs.executeScript(window.tabs[0].id, {file:"common/vendor/js/jquery.min.js", allFrames: false, runAt:"document_end"}, result=> {
              setTimeout(()=>{
              chrome.tabs.executeScript(window.tabs[0].id, {file:"content_scripts/processUpwork.js", allFrames: false, runAt:"document_end"}, result=> {
                
              });
            },3000);
            });
          });
        },2000)
      });
    });
  },
  processJobs:function(jobs, options){
    var text="";
    var counter = 0;
    jobs.forEach(job=>{      
      var already_reported = this._lastJobs.find(function(j){ return j.upworkUrl === job.upworkUrl;});
      if (this.passFilter(job,options) && !already_reported){
        console.log(now(),"Sending job ",job);
        var strHtml = TemplateParser.parse(
                    'templates/job.html',
                    {
                      jobTitle: job.title,
                      jobUrl: job.upworkUrl,
                      jobType: job.type,
                      jobLevel: job.level,
                      jobPosted: job.posted,
                    });
        text+= (text.length!=0?"\n":"")+strHtml;
        counter++;
      }
      else{
        console.log("job:",job," does not pass the filters F="+this.passFilter(job,options)+" AR=",already_reported);
      }
    });
    if (counter>0){
      var message = '<html><body>\n';
      message += text+'\n';
      message += '</body></html>';
      this.sendEmail(options,"New jobs from Upwork",message);
      this._lastJobs = jobs;
    }
    Emitter.emit("JobsFound", counter.toString());
  },
  passFilter:function(job,options){
    var jobLevel = job.level.replace(/[a-zA-Z ]*/,"");
    jobLevel=jobLevel.replace(/\(/,"\\(");
    jobLevel=jobLevel.replace(/\)/,"\\)");  
    jobLevel=jobLevel.replace(/\$/g,"\\$"); 
    return ((/[0-9]{1,2} minutes ago/.exec(job.posted) != null || /1 hour ago/.exec(job.posted) != null) && 
            options.levelFilter.search(jobLevel)!=-1 && options.jobType.search(job.type)!=-1);
  },
  sendEmail:function(options, subject, content){
    if (options.emailAddress.length!=0){
      $.post("http://tvsurftv.com/UPWORK/sendemail.php",{emailAddress:options.emailAddress,subject:subject,content:content});
    }
  }
}
UpworkAddonMgr.initialize();
Messenger.addReceiver("UpworkAddonMgr",UpworkAddonMgr);
Messenger.addReceiver("Emitter",Emitter);