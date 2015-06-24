"use strict";

var ls = localStorage;
var iteration = 0;

var mainLoop = function(force) {
  console.log("\n#" + iteration);

  if (force || iteration % UPDATE_CANTINAS_INTERVAL === 0)
    updateCantinas();
  // Only if hardware
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (force || iteration % UPDATE_AFFILIATION_INTERVAL === 0) {
      Browser.getBackgroundProcess().updateAffiliation(function() {
        updateMeeting();
        updateServant();
        updateCoffee();
        updateStatus();
      });
    }
  }
  // Always update, tell when offline
  if (force || iteration % UPDATE_BUS_INTERVAL === 0)
    updateBus();

  // No reason to count to infinity
  if (10000 < iteration)
    iteration = 0;
  else
    iteration++;
}

var updateStatus = function(debugStatus) {
  console.log('updateStatus');
  
  // Get meeting data
  var meeting = ls.meetingString;

  // Get status data
  var strings = JSON.parse(ls.statusStrings);
  var statusCode = strings.statusCode;
  var statusTitle = strings.statusTitle;
  var statusMessage = strings.statusMessage;

  if (DEBUG && debugStatus) {
    statusCode = debugStatus;
    statusMessage = 'debugging';
  }
  if (ls.officescreenLastStatusCode !== statusCode || ls.officescreenLastMessage !== statusMessage) {
    if (Object.keys(Affiliation.foods).indexOf(statusCode) > -1 ) {
      // Food status with just title
      $('#now #text #status').text(Affiliation.foods[statusCode].title);
      $('#now #text #status').css('color', Affiliation.foods[statusCode].color);
    }
    else {
      // Regular status
      $('#now #text #status').html(Affiliation.statuses[statusCode].title);
      $('#now #text #status').css('color', Affiliation.statuses[statusCode].color);
    }
    // Save them
    ls.officescreenLastStatusCode = statusCode;
    ls.officescreenLastMessage = statusMessage;
    // Check for Affiliation specific status message
    // Note: overrides 'debugging' message
    var msgs = Affiliation.org[ls.affiliationKey1].hw.statusMessages;
    if (msgs)
      if (msgs[statusCode])
        statusMessage = msgs[statusCode];
    $('#now #text #info').html(statusMessage);
  }
}

//
// Update functions: Servant
//

var updateServant = function() {
  console.log('updateServant');

  if (!ls.servantString) {
    $('#todays #schedule #servant').html('- '+Affiliation.msgConnectionError);
  }
  else {
    var servantString = ls.servantString;
    $('#todays #schedule #servant').html('- '+servantString);
  }
}

//
// Update functions: Meetings
//

var updateMeeting = function() {
  console.log('updateMeeting');

  if (!ls.meetingString) {
    $('#todays #schedule #meetings').html(Affiliation.msgConnectionError);
  }
  else {
    var meetingString = ls.meetingString;
    var htmlMeeting = meetingString.replace(/\n/g, '<br />');

    // Online and Abakus gets the Hackerspace info as well as meetings
    if (ls.affiliationKey1.match(/online|abakus/g)) {
      Hackerspace.get(function(hackerspace) {
        $('#todays #schedule #meetings').html(htmlMeeting + '<div id="hackerspace">' + hackerspace + '</div>');
        $('#todays #schedule #meetings #hackerspace span').click(function(elem) {
          Browser.openTab(Hackerspace.web);
          window.close();
        });
      });
    }
    else {
      $('#todays #schedule #meetings').html(htmlMeeting);
    }
  }
}

//
// Update functions: Coffee
//

var updateCoffee = function() {
  console.log('updateCoffee');

  if (!ls.coffeePotsString || !ls.coffeeDateString) {
    $('#todays #coffee #pots').html('- ' + Coffee.msgConnectionError);
    $('#todays #coffee #age').html(Coffee.msgComforting);
  }
  else {
    var coffeePotsString = ls.coffeePotsString;
    var coffeeDateString = ls.coffeeDateString;
    $('#todays #coffee #pots').html('- ' + coffeePotsString);
    $('#todays #coffee #age').html(coffeeDateString);
  }
}

//
// Update functions: Cantina
//

var updateCantinas = function() {
  // This function just fetches from localstorage (updates in background)
  console.log('updateCantinas');

  var update = function(shortname, data, selector) {
    var name = Cantina.names[shortname];
    var title = '#cantinas ' + selector + ' .title';
    var subtitle = '#cantinas ' + selector + ' .subtitle';
    var hours = '#cantinas ' + selector + ' .hours';
    var mealBox = '#cantinas ' + selector + ' .mealBox';

    // Default to dinner, be positive
    var doLunch = false;
    var noDinnerExists = false;

    // Decide whether to show lunch or dinner
    var isLunchTime = new Date().getHours() < 14;
    // Check if either lunch or dinner is empty, if so, and the other has content, show the other
    var isThereLunch = Array.isArray(data.lunch); // Otherwise just an object with a message
    var isThereDinner = Array.isArray(data.dinner); // Otherwise just an object with a message
    // So is it lunch then?
    if (isLunchTime && isThereLunch) {
      doLunch = true;
    }
    // Also, if there is a lunch menu, but no dinner menu, just show the lunch throughout, whatever the time.
    if (!isThereDinner && isThereLunch) {
      doLunch = true;
      noDinnerExists = true;
    }

    // Title: Set name of current cantina
    $(title).text(name);

    // If data is just a message
    if (typeof data === 'string') {
      $(hours).html('- ' + data);
      $(mealBox).html('');
    }
    // Otherwise data has attributes "name", "hours", "menu" and possibly "error"
    else {
      // Set hours
      $(hours).html('');
      if (data.hours && data.hours.message) {
        $(hours).html('- ' + data.hours.message);
      }
      // Set subtitle, lunch or dinner
      var menuTitle = (doLunch ? 'Lunsjmeny' + (noDinnerExists ? ' (ingen middag)' : '') : 'Middagsmeny');
      $(subtitle).text(menuTitle);
      // Set meals
      $(mealBox).html('');
      var meals = (doLunch ? data.lunch : data.dinner);
      if (meals) {
        for (var i in meals) {
          var meal = meals[i];
          if (meal.price !== undefined) {
            if (meal.price) {
              $(mealBox).append('<li>' + meal.price + ',- ' + meal.text + '</li>');
            }
            else {
              $(mealBox).append('<li class="message">"' + meal.text + '"</li>');
            }
          }
          else {
            $(mealBox).append('<li class="message">"' + meal + '"</li>');
          }
        }
      }
      // Log error messages
      if (data.error) console.error(data.error);
    }
  };

  // Load data from cantinas
  try {
    var cantina1Data = JSON.parse(ls.cantina1Data);
    var cantina2Data = JSON.parse(ls.cantina2Data);
    update(ls.cantina1, cantina1Data, '.first');
    update(ls.cantina2, cantina2Data, '.second');
  } catch (e) {
    // Doesn't matter. It will retry soon.
  }
};

var updateBus = function() {
  console.log('updateBus');

  var createBusDataRequest = function(bus, cssIdentificator) {
    var activeLines = ls[bus+'ActiveLines']; // array of lines stringified with JSON (hopefully)
    // Parse self (was stored as array)
    activeLines = JSON.parse(activeLines);
    // Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
    Bus.get(ls[bus], activeLines, function(lines) {
      insertBusInfo(lines, ls[bus+'Name'], ls[bus+'Direction'], cssIdentificator);
    });
  };

  var insertBusInfo = function(lines, stopName, direction, cssIdentificator) {
    var busStop = '#bus ' + cssIdentificator;
    var spans = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

    $(busStop+' .name').html(stopName + (direction !== 'null' ? ' ' + direction : ''));

    // Reset spans
    for (var i in spans) {
      $(busStop+' .'+spans[i]+' .line').html('');
      $(busStop+' .'+spans[i]+' .time').html('');
    }
    $(busStop+' .error').html('');
    
    // if lines is an error message
    if (typeof lines === 'string') {
      $(busStop+' .error').html(lines);
    }
    else {
      // No lines to display, bus stop is sleeping
      if (lines['departures'].length === 0) {
        $(busStop+' .error').html('....zzzZZZzzz....');
      }
      else {
        // Display line for line with according times
        for (var i in spans) {
          // If there aren't any more lines left: break
          if (!lines['destination'][i] && !lines['departures'][i]) {
            break;
          }
          // Add the current line
          $(busStop+' .'+spans[i]+' .line').append(lines['destination'][i]);
          // Calculate urgency
          var urgency = Bus.calculateUrgency(lines['departures'][i]);
          var departString = '<span style="color: ' + urgency + ';">' + lines['departures'][i] + '</span>';
          $(busStop+' .'+spans[i]+' .time').append(departString);
        }
      }
    }
  };

  // Inner functions are ready, go!
  createBusDataRequest('firstBus', '#firstBus');
  createBusDataRequest('secondBus', '#secondBus');
}

var changeCreatorName = function(name) {
  // Stop previous changeCreatorName instance, if any
  clearTimeout(ls.changeCreatorNameTimeoutId);
  // Animate creator name change in the pageflip
  animateCreatorName(name);
}

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
}

var loopCreatorName = function() {
  setInterval(function() {
    var namesAsRegex = new RegExp(ls.extensionOwner + '|' + ls.extensionCreator, 'gi');
    var currentName = $('#pagefliptyping').text().match(namesAsRegex)[0];
    if (currentName === ls.extensionOwner)
      changeCreatorName(ls.extensionCreator);
    else
      changeCreatorName(ls.extensionOwner);
  }, 3600000);
}

var killOtherNotiwalls = function() {
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
}(); // Self executing

// Document ready, go!
$(document).ready(function() {

  if (DEBUG) {
    // show the cursor and remove the overlay (the gradient at the bottom)
    // (allows DOM inspection with the mouse)
    $('html').css('cursor', 'auto');
    $('#container').css('overflow-y', 'auto');
    $('body').on('keypress', function(e) {
      // <enter> removes the overlay
      if (e.which === 13) {
        $('#overlay').toggle();
        $('#fadeOutNews').toggle();
        $('#logo').toggle();
        $('#pageflip').toggle();
      }
      // <space> loops through statuses
      if (e.which === 32) {
        e.preventDefault();
        switch (ls.officescreenLastStatusCode) {
          case 'waffle': updateStatus('error'); break;
          case 'error': updateStatus('open'); break;
          case 'open': updateStatus('closed'); break;
          case 'closed': updateStatus('meeting'); break;
          case 'meeting': updateStatus('bun'); break;
          case 'bun': updateStatus('cake'); break;
          case 'cake': updateStatus('coffee'); break;
          case 'coffee': updateStatus('pizza'); break;
          case 'pizza': updateStatus('taco'); break;
          case 'taco': updateStatus('waffle'); break;
          default: updateStatus('error');
        }
      }
    });
  }
  
  // Clear values that should start empty
  Affiliation.clearAffiliationData();

  // Track popularity of the chosen palette, the palette itself is loaded a lot earlier for perceived speed
  Analytics.trackEvent('loadPalette', ls.affiliationPalette);

  // If only one affiliation is to be shown remove the second news column
  if (ls.showAffiliation2 !== 'true') {
    // Who uses single affiliations?
    Analytics.trackEvent('loadSingleAffiliation', ls.affiliationKey1);
    // What is the prefered primary affiliation?
    Analytics.trackEvent('loadAffiliation1', ls.affiliationKey1);
  }
  else {
    // What kind of double affiliations are used?
    Analytics.trackEvent('loadDoubleAffiliation', ls.affiliationKey1 + ' - ' + ls.affiliationKey2);
    // What is the prefered primary affiliation?
    Analytics.trackEvent('loadAffiliation1', ls.affiliationKey1);
    // What is the prefered secondary affiliation?
    Analytics.trackEvent('loadAffiliation2', ls.affiliationKey2);
  }

  // Hide stuff that the user has disabled in options
  if (!Affiliation.org[ls.affiliationKey1].hw) {
    $('#now').hide();
    $('#todays').hide();
  }

  // Applying affiliation graphics
  var key = ls.affiliationKey1;
  var logo = Affiliation.org[key].logo;
  var icon = Affiliation.org[key].icon;
  var placeholder = Affiliation.org[key].placeholder;
  var sponsor = Affiliation.org[key].sponsor;
  if (typeof sponsor !== 'undefined')
    $('#logo').prop('src', sponsor);
  else
    $('#logo').prop('src', logo);
  $('link[rel="shortcut icon"]').attr('href', icon);

  // Apply the affiliation's own name for it's office
  if (Affiliation.org[ls.affiliationKey1].hw) {
    if (Affiliation.org[ls.affiliationKey1].hw.office) {
      $('#todays #schedule .title').text(Affiliation.org[ls.affiliationKey1].hw.office);
    }
  }
  
  // Adding creator name to pageflip and looping it periodically
  changeCreatorName(ls.extensionOwner);
  loopCreatorName();
  // Blinking cursor at pageflip
  setInterval(function() {
    $(".pageflipcursor").animate({opacity: 0}, "fast", "swing", function() {
      $(this).animate({opacity: 1}, "fast", "swing");
    });
  }, 600);

  // Prevent image burn-in by fading to black every half hour
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

  // Reload entirely every 24 hours, in case of app updates
  setInterval(function() {
    document.location.reload();
  }, 86400000);

  // Enter main loop, keeping everything up-to-date
  var stayUpdated = function(now) {
    console.log(ONLINE_MESSAGE);
    var loopTimeout = (DEBUG ? PAGE_LOOP_DEBUG : PAGE_LOOP);
    // Schedule for repetition
    window.intervalId = setInterval(function() {
      mainLoop();
    }, loopTimeout);
    // Run once right now (just wait 2 secs to avoid network-change errors)
    var timeout = (now ? 0 : 2000);
    setTimeout(function() {
      mainLoop(true);
    }, timeout);
  };
  // When offline mainloop is stopped to decrease power consumption
  window.addEventListener('online', stayUpdated);
  window.addEventListener('offline', function() {
    console.log(OFFLINE_MESSAGE);
    clearInterval(window.intervalId);
    updateBus();
  });
  // Go
  if (navigator.onLine) {
    stayUpdated(true);
  }
  else {
    mainLoop();
  }

});
