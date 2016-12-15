log = Function.prototype.bind.call(console.log,console);

//TODO: extract domain using library
function getDomainFromUrl(url){
  var domain = url.replace(/(http|https)?:\/\/(www\.)?/,"");
  domain = domain.replace(/\/.*/,"");
  return domain;
}

function startWaitWindowResponse(delay,resolve,reject,window){
  console.log("startWaitWindowResponse delay:"+delay);
  var timeoutID = setTimeout(function(){
    
    if (window) chrome.windows.remove(window.id);
    console.log("Cancelling window extraction after delay expiration "+delay+" timeout:"+timeoutID)
    resolve("");
  },delay);
  console.log("startWaitWindowResponse delay:"+delay+" timeout:"+timeoutID);
  return timeoutID;
}
function stopWaitWindowResponse(timeoutID){
  console.log("stopWaitWindowResponse clearing:"+timeoutID);
  clearTimeout(timeoutID);
}
function now(){
  var now = new Date();
  return "("+now.getUTCDate()+"/"+(now.getUTCMonth() + 1) +")("+
        pad(now.getUTCHours()) +":"+
        pad(now.getUTCMinutes()) +":"+
        pad(now.getUTCSeconds())+")";
}
function pad(x){
  if (x<10) return "0"+x;
  else return x.toString();
}