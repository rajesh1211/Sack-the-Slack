'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

// chrome.browserAction.setBadgeText({text: '\'Sack the Slack!'});

console.log('Sack the Slack');


function check(tabId, data, tab) {
  if(tab.url.indexOf('slack.com') > -1) {
    chrome.pageAction.show(tabId);
  }
}

chrome.tabs.onUpdated.addListener(check);