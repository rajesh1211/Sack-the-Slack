'use strict';
(function () {
  var $ = jQuery.noConflict();
  var init = function(){

  }

  var initBindings = function(){
    $("#btnGoToFiles").click(function(){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'GoToFiles'}, function(response) {});
      });
    })

    $("#btnStopDelete").click(function(){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'StopDelete'}, function(response) {});
      });
    })    
  }

  $(document).ready(function(){
    init();
    initBindings();
  })
})();  
