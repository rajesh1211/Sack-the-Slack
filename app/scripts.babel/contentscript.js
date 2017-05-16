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
      if(request.action == 'GoToFiles') {
        window.open('/files/'+localStorage.getItem('username') ,'_self'); 
      }

      if(request.action == 'StopDelete') {

        localStorage.setItem('numberOfFilesToDelete', 0);
        localStorage.setItem('lastNFilesDeleting', 0);
        list = [];
        localStorage.setItem('fileDeleteList', JSON.stringify(list));
        localStorage.setItem('deletingInProgress', 0);
        window.location.reload();
      } 
    }
  );  

  var setLocalStorage = function(key, value) {
    localStorage.setItem(key, value);
  }

  var deleteIndividualFile = function() {
    setTimeout(function() {
      $('.action_cog').click();
      document.getElementsByClassName('ts_icon_cog')[0].click();
      $('#delete_file').click();
      $("button:contains('Yes, delete this file')").click()
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
    }, 3000);
  }

  var init = function() {
    allFilePatternStringWithoutUsername = BASE_URL+"\/files"
    username = $("#user_menu_name").html();
    localStorage.setItem('username', username);
    allFilePatternString = BASE_URL+"\/files\/"+username
    allFilePattern = new RegExp(allFilePatternString);
    lastPagePatternString = BASE_URL+"\/files\/"+username+"\\?page=(.*)"
    lastPagePattern = new RegExp(lastPagePatternString);
    filePatternString = BASE_URL+"\/files\/"+username+"\/(.*)[.](.*)"
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
        <div class="sts-row">
          <p class="sts-title">Files deleter for Slack</p>
        </div>
        <div class="sts-action-btn-area">
          <div class="sts-row">
            <div class="sts-col">
              <div class="selected-files">
                <p>No. of files in the bucket to delete: 
                <span id="filesInBucket">5</span>
                <span><a id="btnResetBucket" href="javascript:void(0)">Reset Bucket</a></span>
                </p>
              </div>  
            </div>
            <div class="sts-col">  
              <button class="btn" id="deleteSelectedFiles">Delete Selected Files</button>
            </div>  
          </div>
          <div class="sts-row"><p>Or</p></div>
          <div class="sts-row">
            <div class="sts-col">
              <input type="number" id="deleteLast" placeholder="Delete last n files"/>
            </div>
            <div class="sts-col">  
              <button class="btn" id="deleteFiles">Delete</button>
            </div>  
          </div>  
        </div>  
      </div>
    `
    if($(".pagination").val() == "") {
      $('.pagination').after(html)  
    }else{
      $('#files_list').after(html)  
    }
    
    $('#filesInBucket').html(list.length);

    observeElement(".file_list_item", function(listOfItems) {
      $("#files_div").prepend('<label class="select-all-label"><input type="checkbox" id="btnSelectAllFilesToDelete">   Select All </input> </label>');
      listOfItems.each(function(index) {
        var file_link = $(this).find('.title a').attr('href');
        var html = '<span class="sts-select-span" id="sts-select-span-'+index+'"> <input type="checkbox" id="sts-select-'+index+'" class="sts-select" data-link="'+file_link+'"/></span>';
        $(this).prepend(html);
      });

      $(".sts-select-span").click(function(e) {
          e.stopPropagation();
      });

      $(".sts-select").click(function(e) {
          e.stopPropagation();
      });

      $(".sts-select").click(function() {
        var ischecked= $(this).is(':checked');
        if(!ischecked){
          deleteItemFromList($(this));  
        }else{
          addItemsToList($(this));
        }
      }); 

      $("#btnSelectAllFilesToDelete").click(function(){
        var ischecked= $(this).is(':checked');
          if(!ischecked){
            deselectAllCheckboxes();
          }else{
            selectAllCheckboxes();
          }
      });

      $("#btnResetBucket").click(function() {
        list = [];
        updateListinLocalStorage();
        deselectAllCheckboxes();
      });
    });

    $(".file_list_item").click(function(e) {
      e.stopPropagation();
    });
  }

  var selectAllCheckboxes = function() {
    $(".sts-select").each(function(){
      addItemsToList($(this));
    });
  }

  var deselectAllCheckboxes = function() {
    $(".sts-select").each(function(){
      deleteItemFromList($(this));  
    });
  }

  var deleteItemFromList = function(obj) {
    list.splice(list.indexOf(obj.data('link')), 1);
    updateListinLocalStorage();
    obj.prop("checked", false);
  }

  var addItemsToList = function(obj) {
    if(list.indexOf(obj.data('link')) < 0){
      list.push(obj.data('link'));
      updateListinLocalStorage();    
      obj.prop("checked", true);
    }
  }

  var updateListinLocalStorage = function() {
    localStorage.setItem('fileDeleteList', JSON.stringify(list));
    $('#filesInBucket').html(list.length);
  }

  var addBindings = function() {
    if(localStorage.getItem('deletingInProgress') == "1") {
      $("#deleteIndicator").show();
    }else{
      $("#deleteIndicator").hide();
    }

    $("#deleteFiles").click(function() {
      if($("#deleteLast").val() != "") {
        if(confirm("Are you sure you want to delete files")) {
          setLocalStorage('numberOfFilesToDelete', parseInt($("#deleteLast").val()));
          setLocalStorage('lastNFilesDeleting', 1);
          list = [];
          localStorage.setItem('fileDeleteList', JSON.stringify(list));
          startDeleting();      
        }  
      }else{
        alert("Please enter how many older files you want to delete");
      }
    });

    $("#deleteSelectedFiles").click(function() {
      if(list.length != 0) {
        if(confirm("Are you sure you want to delete files in the bucket")) {
          setLocalStorage('lastNFilesDeleting', 0);
          startDeleting();      
        }  
      }else{
        alert("Please add some files to delet bucket");
      }  
    });
  }

  var startDeleting = function() {
    setLocalStorage('deletingInProgress', 1);
    deleteFiles();
  }

  var deleteFiles = function() {
    if (localStorage.getItem('deletingInProgress') == "1") {
      if(window.location.href.match(allFilePattern) != null) {
        if(window.location.href.match(filePattern) == null) {
          if(localStorage.getItem('lastNFilesDeleting') == 1) {
            if(parseInt(localStorage.getItem('numberOfFilesToDelete')) > 0) {

              if($(".pagination li:nth-last-child(2) a").html() == null) {
                $(".file_list_item").last().click();
              }else{
                if(window.location.href.match(lastPagePattern) != null && 
                  window.location.href.match(lastPagePattern)[1] == $(".pagination li:nth-last-child(2) a").html()){
                  var goToItem = function(list) {
                    console.log('go now');
                    list.last().click();
                  }  
                  observeElement(".file_list_item", goToItem);
                }else{
                  if($(".pagination li:nth-last-child(2) a").val()){
                    window.open("/files/"+username+"?page="+$(".pagination li:nth-last-child(2) a").html() ,'_self')
                    return;
                  }else{
                    deleteIndividualFile();
                  }  
                }
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
    BASE_URL = window.location.origin;
    if (window.location.href.indexOf(BASE_URL+'/files/'+localStorage.getItem('username')) != -1) {
      init();
      addPluginBlocks();
      addBindings();
      deleteFiles();
    }
  });

})();
