const JOB_TYPE_FIXED = "Fixed-Price";
const JOB_TYPE_HOURLY = "Hourly";

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
  var levelFilter="";
  var jobType="";
  var $inputUrls = $("#input-urls").val().trim();
  $inputUrls =$inputUrls.replace(";",",");
  $inputUrls =$inputUrls.replace("","");

  if ($("#input-beginner")[0].checked){
    levelFilter+=(levelFilter.length?",":"")+"($)";
  }
  if ($("#input-intermediate")[0].checked){
    levelFilter+=(levelFilter.length?",":"")+"($$)";
  }
  if ($("#input-expert")[0].checked){
    levelFilter+=(levelFilter.length?",":"")+"($$$)";
  }
  if ($("#input-jobType-"+JOB_TYPE_FIXED)[0].checked){
    jobType+=(jobType.length?",":"")+JOB_TYPE_FIXED;
  }
  if ($("#input-jobType-"+JOB_TYPE_HOURLY)[0].checked){
    jobType+=(jobType.length?",":"")+JOB_TYPE_HOURLY;
  }
  var options = {bullhornPassword:$("#input-password").val(),
                bullhornUserName:$("#input-username").val(),
                emailAddress: $("#input-email-address").val(),
                inputUrls:$inputUrls,
                levelFilter: levelFilter,
                jobType: jobType
              };
  if ($.data(options) != $.data(_options)) {
    Options.set(options)
    .then(()=>{
        chrome.runtime.sendMessage({ action: "Emitter.emit", data:{data:options,event:"OptionsChanged"}}, result=> {
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
      $("#input-email-address").val(options.emailAddress);
      $("#input-urls").val(options.inputUrls);
      if (options.levelFilter.search("\\(\\$\\)")!=-1){
          $("#input-beginner")[0].checked = true;
      }
      if (options.levelFilter.search("\\(\\$\\$\\)")!=-1){
          $("#input-intermediate")[0].checked = true;
      }
      if (options.levelFilter.search("\\(\\$\\$\\$\\)")!=-1){
          $("#input-expert")[0].checked = true;
      }
      if (options.jobType.search(JOB_TYPE_FIXED)!=-1){
          $("#input-jobType-"+JOB_TYPE_FIXED)[0].checked = true;
      }
      if (options.jobType.search(JOB_TYPE_HOURLY)!=-1){
          $("#input-jobType-"+JOB_TYPE_HOURLY)[0].checked = true;
      }
    })
});
