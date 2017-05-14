'use strict';
console.log('Sack the slack!');
var jq = jQuery.noConflict();
jq(document).ready(function() {
  jq('#teamNameDiv').hide();
  jq('#fileDeleteDiv').hide();
  if(localStorage.getItem('teamName') == null) {
    jq('#teamNameDiv').show();
  }else{
    jq('#fileDeleteDiv').show();
  }

  jq('#submitTeamName').click(function() {
    var teamName = jq('#teamName').val()
    localStorage.setItem('teamName', teamName);
    jq('#teamNameDiv').hide();
    jq('#fileDeleteDiv').show();   
  })

  jq('#delete').click(function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'deleteFiles', numberOfFiles: jq("#numberOfFiles").val(), teamName: localStorage.getItem('teamName')}, function(response) {
        // todo
      });
    });
  })  
});