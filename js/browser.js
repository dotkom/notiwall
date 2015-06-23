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

  getBadgeText: function(callback) {
    if (typeof callback == 'undefined') {
      console.error(this.msgCallbackMissing);
    }
    else {
      if (this.name == 'Chrome' || this.name == 'Opera') {
        chrome.browserAction.getBadgeText({}, function(badgeText) {
          callback(badgeText);
        });
      }
      else {
        console.error(this.msgUnsupported);
      }
    }
  },

  setBadgeText: function(text) {
    if (typeof text == 'undefined' || text == null || isNaN(Number(text)) || Number(text) <= 0) {
      text = '';
    }
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.browserAction != undefined) {
        text = String(text);
        chrome.browserAction.setBadgeText({text: text});
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

}

// Detect name and version
Browser._detect_();
