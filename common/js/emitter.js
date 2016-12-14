var Emitter = {
  events:[],
  on:function(target,eventName){
    var result = false;
    this.events.forEach(event=>{
      if (event.name == eventName){
        result = true;
      }
    });
    if (!result){
      this.events[eventName]={};
      this.events[eventName].targets = [];
    }
    this.events[eventName].targets.push(target);
  },
  emit:function(eventName, value){
    if (this.events[eventName]){
      this.events[eventName].targets.forEach(target => {
        var method = "_onEvent"+eventName;
        if (target[method]){
          target[method](value);
        }
        else{
          console.log("ERROR: emit: target has no method "+method);
        }
      });
    }
    else{
      console.log("ERROR: emit: event is not registered by any target "+eventName);
    }
  },
};