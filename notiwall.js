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

//
// Prevent Image Burn In
// (executes itself once)
// NOTE: Have a div#overlay in your Notiwall, see other Notiwall's LESS files
//

(function preventBurnIn() {

  // Prevent image burn-in by fading to black every half hour.
  // This is important because even LCD screens burn in after a long enough time.
  var linebreaks = function() {
    var random = Math.ceil(Math.random() * 25);
    var br = '';
    for (var i = 0; i < random; i++) {
      br += '<br />';
    };
    return br;
  };
  setInterval(function() {
    $('#overlay').html(linebreaks() + 'preventing image burn-in...');
    $('#overlay').css('opacity', 1);
    setTimeout(function() {
      $('#overlay').css('opacity', 0);
    }, 3500);
  }, 1800000);

}());
