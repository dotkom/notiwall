// This file is a utility library for all Notiwalls

//
// Full Reload
// (executes itself once)
//

(function dailyReload() {
  // Reload page entirely every 24 hours, in case of memory
  // leaks or other problems (browsers have bugs too)
  setInterval(function() {
    document.location.reload();
  }, 86400000);
}());

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
// NOTE: Include the HTML and CSS for a div#overlay in your Notiwall
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

//
// Pageflip
// (executes itself once)
// NOTE: Include the HTML and CSS for the pageflip in your Notiwall
//

(function() {

  var changeCreatorName = function(name) {
    // Stop previous changeCreatorName instance, if any
    clearTimeout(ls.changeCreatorNameTimeoutId);
    // Animate creator name change in the pageflip
    animateCreatorName(name);
  };

  var animateCreatorName = function(name, build) {
    // Animate it
    var text = $('#pagefliptyping').text();
    if (text.length === 0) {
      build = true;
      name = name + " with <3";
    }
    var random = Math.floor(350 * Math.random() + 50);
    if (!build) {
      $('#pagefliptyping').text(text.slice(0, text.length-1));
      ls.animateCreatorNameTimeoutId = setTimeout(function() {
        animateCreatorName(name);
      }, random);
    }
    else {
      if (text.length !== name.length) {
        if (text.length === 0) {
          $('#pagefliptyping').text(name.slice(0, 1));
        }
        else {
          $('#pagefliptyping').text(name.slice(0, text.length+1));
        }
        ls.animateCreatorNameTimeoutId = setTimeout(function() {
          animateCreatorName(name, true);
        }, random);
      }
    }
  };

  var loopCreatorName = function() {
    setInterval(function() {
      var namesAsRegex = new RegExp(ls.extensionOwner + '|' + ls.extensionCreator, 'gi');
      var currentName = $('#pagefliptyping').text().match(namesAsRegex)[0];
      if (currentName === ls.extensionOwner)
        changeCreatorName(ls.extensionCreator);
      else
        changeCreatorName(ls.extensionOwner);
    }, 3600000);
  };

  // Adding creator name to pageflip and looping it periodically
  changeCreatorName(ls.extensionOwner);
  loopCreatorName();
  // Blinking cursor at pageflip
  setInterval(function() {
    $(".pageflipcursor").animate({opacity: 0}, "fast", "swing", function() {
      $(this).animate({opacity: 1}, "fast", "swing");
    });
  }, 600);

}());
