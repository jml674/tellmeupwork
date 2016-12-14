
var Parser = {
  _actions : ["nextSearch"],
  _criteria : null,
  
  initialize:function(){
    this._registerHandler();
  },    
    _registerHandler:function(){
    chrome.runtime.onMessage.addListener(this._onMessage.bind(this));
  },
  _onMessage:function(message, sender, reply){
    if (!message.name || !message.action || this._actions.indexOf(message.action) === -1) {
        return false;
    }
    this[`_${message.action}`](message.data, sender, reply);
      return true; //async reply
  },
  _parseResults: function(){
    var jobs=[];
    var $results = $("div[data-job-tile-medium]");
    $results.each((index,li)=>{
      debugger;
      var job = this.parseResult($(li));
      jobs.push(job)
    });
    return jobs;
  },
  _nextResult:function($results,percentage){
    if (percentage != 100){
      this._parseResults();
    }
    else{
      console.log("async ops OVER");
      chrome.runtime.sendMessage({ action: "Search.allResultsProcessed", data:null}, result=> {
            console.log("Got reply:", result);       
      });
    }
  },

  _nextSearch:function(data,from, reply){
    console.log("Triggering next search");
    
    if ($("li.next a.page-link").length){
      reply(true);
      var href = $("li.next a.page-link").first().attr("href");
      if (href.search("&recannFlag")===-1){
        href = $("li.next a.page-link").first().attr("href")+"&recannFlag";
      }
      //$("li.next a.page-link").first().attr("href",href);
      //$("li.next a.page-link")[0].click();  
      location.href = href;
    }
    else reply(false);
    
  },
  parseResult:function($li){
    var job = {};
    job.title = $li.find("h2").text().trim();
    job.upworkUrl = "https://www.upwork.com"+$li.find(".job-title-link").attr("href");
    job.type= $li.find("div.col-md-12 small span[data-job-type]").text().trim();
    job.level = $li.find("div.col-md-12 small span[data-job-tier]").text().trim()
    if (job.level[0]=="-"){
      job.level=job.level.substr(1,job.level.length-1).trim()
    }
    job.amount = $li.find("div.col-md-12 small span[data-itemprop]").text().trim()
    job.posted = $li.find("[data-itemprop='datePosted']").text().trim()
    console.log("parseResult ",job)
    return job;
  },
  setSearchCriteria: function(criteria){
    this._criteria = criteria;
  }
};

Parser.initialize();
if (document.URL.match(/upworkFlag/)){
  chrome.runtime.sendMessage({ action: "UpworkAddonMgr.ready", data:null}, result=> {
    console.log("Got reply:", result);
    setTimeout(()=>{
      Parser.setSearchCriteria(result.criteria);
      var jobs = Parser._parseResults();
      chrome.runtime.sendMessage({ action: "UpworkAddonMgr.jobs", data:jobs}, result=> {});
    },3000)

  });
  
}
