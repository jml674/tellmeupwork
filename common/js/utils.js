function ReplaceKeywords(str,obj){
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      var regexp = new RegExp("{"+i+"}","g")
      var replacement=obj[i].replace(/\$/g,"$$$$");
      str = str.replace(regexp,replacement);
    }
  }
  return str;
}
var browserAPI = {
  resources:{
    getImage: function(path){
      return chrome.extension.getURL(path);
    },
    get: function(path){
      var that_data = null;
      var url = chrome.extension.getURL("resources/"+path);
      $.ajax({
        type:"GET",
        url:url,
        success: function(data, textStatus, jqXHR){
          //console.log("Got the template!");
          //console.log(data);
          that_data = data;
        },
        async: false,
        type: "html"
      });
      return that_data;
    }
  }
}
var TemplateParser = {
    _cachedTemplates: {},
    parse: function (resourcePath, data) {
      // Get the template from the resources
      var templateString = browserAPI.resources.get(resourcePath);
      templateString = ReplaceKeywords(templateString,data);
      
      return templateString;
    }
};
function splitName(fullname){
  return fullname.split(" ");
}
var country_list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
function findCountry(value){
  return value.toLowerCase() === this.toLowerCase();
}
function processLocality(locality){
  var split = locality.split(",");
  switch (split.length){
    case 0: return ["","United Kingdom"];
    case 1: if (country_list.find(findCountry,split[0].trim()))
            {
              return ["","United Kingdom"];
            }
            else return [split[0].trim(),"United Kingdom"];
    break;
    case 2: return [split[0].trim(),split[1].trim()];
    // Keep only first member of the address
    case 3: return [split[0].trim(),split[2].trim()];
  }
}