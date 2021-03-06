"use strict";

var Browser = {
  debug: 0,
  msgCallbackMissing: 'Callback is missing',
  msgUnsupported: 'Unsupported browser',

  name: 'Unknown', // Changed automatically at the end of this file with Browser.detect()
  version: 0,

  _detect_: function() {
    if (navigator.userAgent.indexOf('Chrome') !== -1 && navigator.userAgent.indexOf('OPR') === -1) {
      var verOffset = navigator.userAgent.indexOf("Chrome/");
      if (verOffset !== -1) {
        this.version = parseInt(navigator.userAgent.substring(verOffset + 7));
      }
      this.name = 'Chrome';
    }
    else if (navigator.userAgent.indexOf('Chrome') !== -1 && navigator.userAgent.indexOf('OPR') !== -1) {
      var verOffset = navigator.userAgent.indexOf("OPR/");
      if (verOffset !== -1) {
        this.version = parseInt(navigator.userAgent.substring(verOffset + 4));
      }
      this.name = 'Opera';
    }
    else {
      console.error(this.msgUnsupported);
      this.name = 'Unknown';
    }
  },

  onMac: function() {
    return navigator.platform.toLowerCase().indexOf('mac')!==-1;
  },

  onLinux: function() {
    return navigator.platform.toLowerCase().indexOf('linux')!==-1;
  },

  onWindows: function() {
    return navigator.platform.toLowerCase().indexOf('win')!==-1;
  },

  setIcon: function(path) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setIcon({
          path: {
            "19": path,
            "38": path,
          }
        });
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  setTitle: function(title) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setTitle({title: title});
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  openTab: function(url) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: true});
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  openBackgroundTab: function(url) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: false});
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  getUrl: function(url) {
    // Allows you to get an accessible URL for a resource in the extension, e.g. an image
    if (this.name == 'Chrome' || this.name == 'Opera') {
      return chrome.extension.getURL(url);
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  getBackgroundProcess: function() {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.extension != undefined) {
        return chrome.extension.getBackgroundPage();
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  getAppVersion: function() {
    try {
      if (this.name == 'Chrome' || this.name == 'Opera') {
        return chrome.app.getDetails().version;
      }
    } catch (err) {
      // Do nothing
    }
    console.error(this.msgUnsupported);
    return 'Unknown';
  },

  inProduction: function() {
    // Is the app in production? If so, there will be an update URL
    try {
      if (this.name === 'Chrome' || this.name === 'Opera') {
        if (chrome.app.getDetails().id === 'ockmkaidddgbbababholkkhlmppnacjm') {
          return true;
        }
        else if (typeof chrome.app.getDetails().update_url === 'string') {
          return true;
        }
        else {
          return false;
        }
      }
    } catch (err) {
      // Do nothing
    }
    console.error(this.msgUnsupported);
    return false; // assume dev mode
  },

  killOtherNotiwalls: function(DEBUG) {
    DEBUG = DEBUG || false;
    try {
      if (this.name === 'Chrome' || this.name === 'Opera') {
        // Get all tabs
        chrome.tabs.query({}, function(list){
          // Filter away all tabs whose URL does not contain the extensionID
          var extensionID = chrome.app.getDetails().id;
          list = list.filter(function(tab) {
            return tab.url.match(extensionID) !== null;
          });
          // Only tabs in Online Notiwall are left
          list = list.filter(function(tab) {
            return !tab.active;
          });
          // Kill all the inactive Notiwalls! There may be only one.
          for (var i = 0; i < list.length; i++) {
            if (DEBUG) {
              console.warn('DEBUG is on, I deferred from killing other Notiwall with ID:', list[i].id, "- There may be room for others.");
            }
            else {
              if (DEBUG) console.warn('Killing other Notiwall with ID:', list[i].id, "- There may be only one!");
              chrome.tabs.remove(list[i].id);
            }
          };
        });
      }
      else {
        console.error(this.msgUnsupported);
      }
    } catch (err) {
      // Do nothing
    }
  },

  reloadAllNotiwalls: function(DEBUG) {
    DEBUG = DEBUG || false;
    try {
      if (this.name === 'Chrome' || this.name === 'Opera') {
        chrome.tabs.query({}, function(list){
          // Filter away all tabs whose URL does not contain the extensionID
          var extensionID = chrome.app.getDetails().id;
          list = list.filter(function(tab) {
            return tab.url.match(extensionID) !== null;
          });
          // Only tabs in Online Notiwall are left
          for (var i = 0; i < list.length; i++) {
            // Send a message to Notiwalls about reloading themselves
            if (DEBUG) console.warn('Telling Notiwall', list[i].id, 'to reload itself.');
            chrome.tabs.reload(list[i].id);
          };
        });
      }
      else {
        console.error(this.msgUnsupported);
      }
    } catch (err) {
      // Do nothing
    }
  },

}

// Detect name and version
Browser._detect_();
