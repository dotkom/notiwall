"use strict";

var Defaults = {

  _autoLoad_: function() {
  
    var ls = localStorage;

    // Clear previous thoughts
    if (DEBUG) ls.clear();

    // Clear errors from previous versions: undefined objects that
    // may have been saved to localStorage, it did happen once.
    // Thanks to Kristoffer Iversen for finding it.
    for (var i in ls) {
      // It's all strings, but in case browsers allow other
      // datatypes in the future, we'll check for string
      if (typeof ls[i] === 'string') {
        if (ls[i] === 'undefined') {
          // Remove the "undefined"-string
          ls.removeItem(i);
        }
      }
    }
    
    // Set default choices if undefined, in the same order as on the options page

    // These two names will be shown in a loop, both can be max 8 letters because of styling
    ls.extensionOwner = 'Online';
    ls.extensionCreator = 'appKom';

    // Note install time for future reference
    if (ls.installTime === undefined)
      ls.installTime = new Date().getTime();

    // Primary affiliation
    if (ls.affiliationNewsList1 === undefined)
      ls.affiliationNewsList1 = JSON.stringify([]);
    
    if (ls.affiliationPalette === undefined)
      ls.affiliationPalette = 'online';

    // Secondary affiliation
    if (ls.affiliationNewsList2 === undefined)
      ls.affiliationNewsList2 = JSON.stringify([]);
    
    // Bus - If any of these properties are undefined we'll reset all of them
    var firstBusProps = [
      ls.firstBus,
      ls.firstBusName,
      ls.firstBusDirection,
      ls.firstBusActiveLines,
      ls.firstBusInactiveLines,
    ]
    var secondBusProps = [
      ls.secondBus,
      ls.secondBusName,
      ls.secondBusDirection,
      ls.secondBusActiveLines,
      ls.secondBusInactiveLines,
    ]
    var firstBusOk = true;
    var secondBusOk = true;
    for (var prop in firstBusProps) {
      if (firstBusProps[prop] === undefined) {
        firstBusOk = false;
      }
    }
    for (var prop in secondBusProps) {
      if (secondBusProps[prop] === undefined) {
        secondBusOk = false;
      }
    }
    if (!firstBusOk) {
      ls.firstBus = 16011333;
      ls.firstBusName = 'Gløshaugen Nord';
      ls.firstBusDirection = 'til byen';
      ls.firstBusActiveLines = JSON.stringify([5, 22]);
      ls.firstBusInactiveLines = JSON.stringify([169]);
    }
    if (!secondBusOk) {
      ls.secondBus = 16010333;
      ls.secondBusName = 'Gløshaugen Nord';
      ls.secondBusDirection = 'fra byen';
      ls.secondBusActiveLines = JSON.stringify([5, 22]);
      ls.secondBusInactiveLines = JSON.stringify([169]);
    }
    
    // Coffee
    if (ls.coffeePots === undefined)
      ls.coffeePots = 0;
    
    // Notiwall
    if (ls.whichScreen === undefined)
      ls.whichScreen = 'infoscreen';
  }(),

  // Whenever we need to remove an existing affiliation,
  // this little heartsaver comes to our rescue. Just go
  // ahead and uncomment that affiliation in Affiliation.js !
  resetAffiliationsIfNotExist: function(key1, key2, affiliationKeys) {

    var ls = localStorage;

    var gotoOptions = function(key) {
      alert('Online Notiwall beklager:\n\n"'+key+'" er borte fra Notiwall :(\n\nTrolig fordi foreningens nettside ikke finnes lenger.\n\nÅpne innstillingene ved å klikke på Notiwalls ikon øverst til høyre i Chrome, og velg en annen nyhetskilde.');
    }
    if (affiliationKeys.indexOf(key1) === -1) {
      ls.affiliationKey1 = 'online';
      gotoOptions(key1);
    }
    if (affiliationKeys.indexOf(key2) === -1) {
      ls.affiliationKey2 = 'dusken';
      gotoOptions(key2);
    }
  },
  
}
