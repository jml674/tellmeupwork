var _options=null;
$("#btn-eye-password").click(function(){
  console.log("btn-eye clicked");
  $("#input-password").attr("type","text");
})
$("#btn-cancel").click(function(){
  console.log("btn-cancel clicked");
  window.close();
})

$("#btn-ok").click(function(){  
  console.log("btn-ok clicked");
  var $inputUrls = $("#input-urls").val().trim();
  $inputUrls =$inputUrls.replace(";",",");
  $inputUrls =$inputUrls.replace("","");
  var options = {bullhornPassword:$("#input-password").val(),
                bullhornUserName:$("#input-username").val(),
                inputUrls:$inputUrls};
  if ($.data(options) != $.data(_options)) {
    Options.set(options)
    .then(()=>{
        chrome.runtime.sendMessage({ action: "BullhornMgr.optionsChanged", data:{options}}, result=> {
            console.log("Got reply:", result);
        }); 
        chrome.runtime.sendMessage({ action: "EmailHunter.optionsChanged", data:{options}}, result=> {
            console.log("Got reply:", result);
            window.close();
        }); 
    });
  }
  else window.close();
});
$(function() {
    console.log( "ready!" );
    Options.get().then(options=>{
      _options = options;
      $("#input-username").val(options.bullhornUserName);
      $("#input-password").val(options.bullhornPassword);
      $("#input-urls").val(options.inputUrls);
    })
});
