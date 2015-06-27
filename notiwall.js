// This file is a utility library for all Notiwalls

//
// Kill Other Notiwalls
// (executes itself once)
//

(function killOtherNotiwalls() {
  // Get all tabs
  chrome.tabs.query({}, function(list){
    // Filter away all tabs whose URL does not contain the extensionID
    var extensionID = chrome.app.getDetails().id;
    list = list.filter(function(tab) {
      return tab.url.match(extensionID) !== null;
    });
    // Only tabs in Online Notiwall are left
    var notiwallIDs = [];
    list = list.filter(function(tab) {
      return !tab.active;
    });
    // Kill all the inactive Notiwalls! There may be only one.
    for (var i = 0; i < list.length; i++) {
      if (DEBUG) {
        console.warn('DEBUG is on, I deferred from killing other Notiwall with ID:', list[i].id, "- There may be room for others.");
      }
      else {
        console.warn('Killing other Notiwall with ID:', list[i].id, "- There may be only one!");
        chrome.tabs.remove(list[i].id);
      }
    };
  });
}());

//
// Show Cursor On MouseMove
// (executes itself once)
// NOTE: Use CSS "cursor: none" in the body of your Notiwall
//

(function showCursorOnMove() {
  $('body').mousemove(function() {
    clearTimeout(window._showMouseTimeout_);
    $(this).css('cursor', 'auto');
    window._showMouseTimeout_ = setTimeout(function() {
      $('body').css('cursor', '');
    }, 1500);
  });
}());
