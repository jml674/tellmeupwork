var Server= {
  getDomForParser:function(url){
    return new Promise(function(resolve, reject) {
      $.get(url,function(result){
        var parser = new DOMParser();
        var doc = parser.parseFromString(result,"text/html");
        resolve(doc);
      },"html").fail(function(jqXHR, textStatus, errorThrown){
          console.log("Can't get "+url);
          reject({httpCode:jqXHR.status});
        }
      );
    });
  },
  get:function(url){
    return new Promise(function(resolve, reject) {
      $.get(url,function(result){
        
        resolve(result);
      },"html").fail(function(jqXHR, textStatus, errorThrown){
          console.log("Can't get "+url);
          reject({httpCode:jqXHR.status});
        }
      );
    });
  },
  put:function(url, data){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'PUT',
        processData : false,
        contentType : "text/plain",
        success: function(result){
          resolve(result); 
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });    
    });
  },
  delete:function(url, data){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'DELETE',
        processData : false,
        contentType : "text/plain",
        success: function(result){
          resolve(result); 
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });    
    });
  },
  post:function(url, data){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'POST',
        processData : false,
        contentType : "text/plain",
        success: function(result){
          resolve(result); 
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });    
    });
  },

  getJSON:function(url){
    console.log("getJSON url: "+url)
    return new Promise(function(resolve, reject) {
      $.get(url,function(result){
          resolve(result); // TBC
      },"json").fail(function(jqXHR, textStatus, errorThrown){
          reject({httpCode:jqXHR.status});
      });
    });
  }
};