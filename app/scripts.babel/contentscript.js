'use strict';
var jq = jQuery.noConflict();

var BASE_URL = '';
var username = '';
var allFilePatternString = '';
var allFilePattern = '';
var lastPagePatternString = '';
var lastPagePattern = '';
var filePatternString = '';
var filePattern = '';
var allFilePatternStringWithoutUsername = '';

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  'from a content script:' + sender.tab.url :
                  'from the extension');
      if(request.action == 'deleteFiles') {
        console.log('files to be deleted are ' + request.numberOfFiles);
        setLocalStorage('numberOfFilesToDelete', parseInt(request.numberOfFiles));
        setLocalStorage('baseTeamName', request.teamName);
        // deleteFiles();
        debugger;
        window.open(allFilePatternStringWithoutUsername ,'_self'); 
      }
    }
  );

jq(document).ready(function() {
  init();
  deleteFiles();
});

var setLocalStorage = function(key, value) {
  localStorage.setItem(key, value);
}

var init = function() {
  console.log(localStorage.getItem('baseTeamName'));
  if(localStorage.getItem('baseTeamName') == null){
    BASE_URL = 'slack.com';
  }else{
    BASE_URL = localStorage.getItem('baseTeamName')+'.slack.com';
  }

  allFilePatternStringWithoutUsername = "https:\/\/"+BASE_URL+"\/files"
  username = jq("#user_menu_name").html();
  allFilePatternString = "https:\/\/"+BASE_URL+"\/files\/"+username
  allFilePattern = new RegExp(allFilePatternString);
  lastPagePatternString = "https:\/\/"+BASE_URL+"\/files\/"+username+"\\?page=(.*)"
  lastPagePattern = new RegExp(lastPagePatternString);
  filePatternString = "https:\/\/"+BASE_URL+"\/files\/"+username+"\/(.*)"
  filePattern = new RegExp(filePatternString);

}

var deleteFiles = function() {
  if(localStorage.getItem('numberOfFilesToDelete') && parseInt(localStorage.getItem('numberOfFilesToDelete')) > 0) {
    if (window.location.href.indexOf(BASE_URL+'/files') != -1) {
      if(window.location.href.match(allFilePattern) != null) {
        if(window.location.href.match(filePattern) == null) {
          if(window.location.href.match(lastPagePattern) != null && 
            window.location.href.match(lastPagePattern)[1] == jq(".pagination li:nth-last-child(2) a").html()){
            // Do nothing
          }else{
            window.open("/files/rajesh1211?page="+jq(".pagination li:nth-last-child(2) a").html() ,'_self')
            return;
          }

          var goToItem = function(list) {
            console.log('go now');
            list.last().click();
          }

          // set up the mutation observer
          var observer = new MutationObserver(function (mutations, me) {
            // `mutations` is an array of mutations that occurred
            // `me` is the MutationObserver instance
            var list = jq('.contents');
            if (list.length != 0) {
              goToItem(list);
              me.disconnect(); // stop observing
              return;
            }
          });

          // start observing
          observer.observe(document, {
            childList: true,
            subtree: true
          });  
        }else{
          setTimeout(function() {
            // jq('.action_cog').click();
            document.getElementsByClassName('ts_icon_cog')[0].click();
            jq('#delete_file').click();
            // jq("button:contains('Yes, delete this file')").click()
            localStorage.setItem('numberOfFilesToDelete', parseInt(localStorage.getItem('numberOfFilesToDelete')) - 1);
            window.open(allFilePatternString ,'_self');    
          }, 2000);
          
        }
      }else{
        window.open(allFilePatternString ,'_self');
      }  
    }  
  }
}
