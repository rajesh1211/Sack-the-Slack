'use strict';

(function () {
  var $ = jQuery.noConflict();
  var BASE_URL = '';
  var username = '';
  var allFilePatternString = '';
  var allFilePattern = '';
  var lastPagePatternString = '';
  var lastPagePattern = '';
  var filePatternString = '';
  var filePattern = '';
  var allFilePatternStringWithoutUsername = '';
  var list = [];

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.action == 'deleteFiles') {
        console.log('files to be deleted are ' + request.numberOfFiles);
        setLocalStorage('numberOfFilesToDelete', parseInt(request.numberOfFiles));
        setLocalStorage('baseTeamName', request.teamName);
        window.open(allFilePatternStringWithoutUsername ,'_self'); 
      }
    }
  );

  var setLocalStorage = function(key, value) {
    localStorage.setItem(key, value);
  }

  var deleteIndividualFile = function() {
    setTimeout(function() {
      // $('.action_cog').click();
      document.getElementsByClassName('ts_icon_cog')[0].click();
      $('#delete_file').click();
      // $("button:contains('Yes, delete this file')").click()
      if (localStorage.getItem('lastNFilesDeleting') == "1") {
        var remainingFiles = parseInt(localStorage.getItem('numberOfFilesToDelete')) - 1
        localStorage.setItem('numberOfFilesToDelete', remainingFiles);
        if(remainingFiles == 0) {
          localStorage.setItem('deletingInProgress', 0);
        }
      }else{
        if(list.length > 0) {
          list.splice(list.indexOf(window.location.href), 1);
          localStorage.setItem('fileDeleteList', JSON.stringify(list));
          if (list.length == 0) {
            localStorage.setItem('deletingInProgress', 0);   
          }
        }
      } 
      window.open(allFilePatternString ,'_self');    
    }, 2000);
  }

  var init = function() {
    console.log(localStorage.getItem('baseTeamName'));
    if(localStorage.getItem('baseTeamName') == null){
      BASE_URL = 'slack.com';
    }else{
      BASE_URL = localStorage.getItem('baseTeamName')+'.slack.com';
    }

    allFilePatternStringWithoutUsername = "https:\/\/"+BASE_URL+"\/files"
    username = $("#user_menu_name").html();
    allFilePatternString = "https:\/\/"+BASE_URL+"\/files\/"+username
    allFilePattern = new RegExp(allFilePatternString);
    lastPagePatternString = "https:\/\/"+BASE_URL+"\/files\/"+username+"\\?page=(.*)"
    lastPagePattern = new RegExp(lastPagePatternString);
    filePatternString = "https:\/\/"+BASE_URL+"\/files\/"+username+"\/(.*)"
    filePattern = new RegExp(filePatternString);

    if(localStorage.getItem('fileDeleteList') == null) {
      list = [];
    }else{
      list = JSON.parse(localStorage.getItem('fileDeleteList'));
    }
  }

  var addPluginBlocks = function() {
    var deletIndicatorHtml = '<span class="delete-indicator" id="deleteIndicator"> Delete in Progress ... </span>'
    $("#page_contents").prepend(deletIndicatorHtml);
    var html = `
      <div class='sts-action-area'>
        <div>
          <button class="btn btn-blue" id="addToDeleteList">Add to delete list</button> 
          No. of files in the bucket to delete: <span id="filesInBucket">5</span>
        <div>
        <div>Or</div>
        <div>   
          <input type="number" id="deleteLast" placeholder="Delete last n files"/>
        </div>
        <div>
          <button class="btn" id="deleteFiles">Delete</button>
        </div>  
      </div>
    `

    $('.pagination').after(html)
    $('#filesInBucket').html(list.length);

    observeElement(".file_list_item", function(list) {
      list.each(function() {
        var file_link = $(this).find('.title a').attr('href');
        var html = '<span class="sts-select-span"> <input type="checkbox" class="sts-select" data-link="'+file_link+'"/></span>';
        $(this).prepend(html);
        $(".sts-select-span").click(function(e) {
            e.stopPropagation();
        });

        $(".sts-select").click(function(e) {
            e.stopPropagation();
        });
      })
    });

    $(".file_list_item").click(function(e) {
      e.stopPropagation();
    });
  }

  var addBindings = function() {
    if(localStorage.getItem('deletingInProgress') == "1") {
      $("#deleteIndicator").show();
    }else{
      $("#deleteIndicator").hide();
    }
    
    $("#addToDeleteList").click(function() {
      $(".sts-select:checked").each(function(){
        console.log($(this).data)
        list.push($(this).data('link'));
      })
      localStorage.setItem('fileDeleteList', JSON.stringify(list));
      $('#filesInBucket').html(list.length);
    });

    $("#deleteFiles").click(function() {
      if($("#deleteLast").val() != "") {
        setLocalStorage('numberOfFilesToDelete', parseInt($("#deleteLast").val()));
        setLocalStorage('lastNFilesDeleting', 1);
      }else{
        setLocalStorage('lastNFilesDeleting', 0);
      }
      setLocalStorage('deletingInProgress', 1);
      deleteFiles();
    });
  }

  var deleteFiles = function() {
    if (localStorage.getItem('deletingInProgress') == "1") {
      if(window.location.href.match(allFilePattern) != null) {
        if(window.location.href.match(filePattern) == null) {
          if(localStorage.getItem('lastNFilesDeleting') == 1) {
            if(parseInt(localStorage.getItem('numberOfFilesToDelete')) > 0) {
              if(window.location.href.match(lastPagePattern) != null && 
                window.location.href.match(lastPagePattern)[1] == $(".pagination li:nth-last-child(2) a").html()){
                var goToItem = function(list) {
                  console.log('go now');
                  list.last().click();
                }  
                observeElement(".file_list_item", goToItem);
              }else{
                window.open("/files/"+username+"?page="+$(".pagination li:nth-last-child(2) a").html() ,'_self')
                return;
              }
            }  
          }else{
            if(window.location.href != list[0]) {
              window.open(list[0], '_self');
            }else{
              deleteIndividualFile();  
            }
          }    
        }else{
          deleteIndividualFile();
        }
      }else{
        window.open(allFilePatternString ,'_self');
      }  
    } 
  }

  var observeElement = function(element, callback) {
    var observer = new MutationObserver(function (mutations, me) {
      var list = $(element);
      if (list.length != 0) {
        callback(list);
        me.disconnect();
        return;
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  $(document).ready(function() {
    if (window.location.href.indexOf(BASE_URL+'/files') != -1) {
      init();
      addPluginBlocks();
      addBindings();
      deleteFiles();
    }  
  });
})();
