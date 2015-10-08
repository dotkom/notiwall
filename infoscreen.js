"use strict";

var iteration = 0;

var newsLimit = 6; // Any more will never be visible on the screen

var mainLoop = function(force) {
  console.log("\n#" + iteration);

  if (force || iteration % UPDATE_CANTINAS_INTERVAL === 0)
    updateCantinas();
  if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
    updateAffiliationNews('1');
  if (ls.showAffiliation2 === 'true')
    if (force || iteration % UPDATE_NEWS_INTERVAL === 0)
      updateAffiliationNews('2');
  // Only if hardware
  if (Affiliation.org[ls.affiliationKey1].hardware) {
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
};

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
  if (Object.keys(Affiliation.foods).indexOf(statusCode) > -1) {
    if (typeof Affiliation.foods[statusCode].image !== 'undefined') {
      // Food status with image
      $('#office #status img').attr('src', Affiliation.foods[statusCode].image);
      $('#office #status #text').hide();
      $('#office #status img').show();
    }
    else {
      // Food status with just title
      $('#office #status #text').text(Affiliation.foods[statusCode].title);
      $('#office #status #text').css('color', Affiliation.foods[statusCode].color);
      $('#office #status img').hide();
      $('#office #status #text').show();
    }
  }
  else {
    // Regular status
    $('#office #status #text').html(Affiliation.statuses[statusCode].title);
    $('#office #status #text').css('color', Affiliation.statuses[statusCode].color);
    $('#office #status img').hide();
    $('#office #status #text').show();
  }
  // Save them
  ls.infoscreenLastStatusCode = statusCode;
  ls.infoscreenLastMessage = statusMessage;
  // Check for Affiliation specific status message
  // Note: overrides 'debugging' message
  var msgs = Affiliation.org[ls.affiliationKey1].hardware.statusMessages;
  if (msgs)
    if (msgs[statusCode])
      statusMessage = msgs[statusCode];
  $('#office #subtext').html(statusMessage);
};

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
};

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
      });
    }
    else {
      $('#todays #schedule #meetings').html(htmlMeeting);
    }
  }
};

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
};

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

//
// Update functions: Bus
//

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
    var spans = ['first', 'second', 'third', 'fourth'];

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
};

//
// Update functions: Affiliation News
//

var updateAffiliationNews = function(number) {
  console.log('updateAffiliationNews'+number);

  var displayItems = function(items, selector) {

    // Get feedkey
    var feedKey = items[0].feedKey;

    // Prepare a column for our elements
    var column = $();

    // Add feed items
    $.each(items, function (index, item) {

      if (index < newsLimit) {

        var descLimit = 140;
        if (ls.showAffiliation2 === 'true') {
          descLimit = 100;
        }
        if (item.description.length > descLimit) {
          item.description = item.description.substr(0, descLimit) + '...';
        }

        var htmlItem = '';

        if (ls.showAffiliation2 === 'true') {
          htmlItem = [
            '<article data="' + item.link + '">',
              '<img class="flashy" src="' + item.image + '" />',
              '<div class="title flashy">' + item.title + '</div>',
              '<div class="author flashy">&ndash; Av ' + item.creator + '</div>',
            '</article>',
          ].join('\n');
        }
        else {
          htmlItem = [
            '<article data="' + item.link + '">',
              '<img class="regular" src="' + item.image + '" />',
              '<div class="title">' + item.title + '</div>',
              item.description,
              '<br /><div class="author">&ndash; Av ' + item.creator + '</div>',
            '</article>',
          ].join('\n');
        }

        column = column.add(htmlItem);
      }
    });

    // Remove old news, add fresh news
    $('#news ' + selector + ' article').remove();
    $('#news ' + selector).append(column);
  }

  // Get the news feed (prefetched by the background page)
  var news = ls['affiliationNews'+number];
  
  // Detect selector
  var selector = (number === '1' ? '#left' : '#right');
  if (ls.showAffiliation2 !== 'true') {
    selector = '#full';
  }

  // Set affiliation name
  var name = Affiliation.org[ls['affiliationKey'+number]].name;
  $('#news '+selector+' .title').html(name);

  // Parse and display news
  if (typeof news !== 'undefined') {
    news = JSON.parse(news);
    displayItems(news, selector);
  }
  else {
    // Offline or unresponsive
    var key = ls['affiliationKey'+number];
    var name = Affiliation.org[key].name;
    $('#news '+selector+' article').remove(); // Remove all existing articles
    $('#news '+selector).append('<article>Frakoblet fra nyhetsstrøm</article>');
    $('#news '+selector+' article').click(function() {
      // Link to affiliation website
      Browser.openTab(Affiliation.org[key].web);
    });
  }
};

//
// Rotate Office Status Font
// (executes itself once)
//

(function officeFontRotate() {

  var rotate = function() {
    var fonts = ['cardo','fondamento','oleoscript','sourcesans'];
    var chosenFont = fonts[Math.floor(Math.random() * fonts.length)];
    $('#office #status #text').prop('class', chosenFont);
    if (DEBUG) {
      $('#office #subtext').html(ls.infoscreenLastMessage + '<br />' + chosenFont);
    }
  }

  // Randomize font in the office status
  rotate();
  setInterval(function(rotate) {
    rotate();
  }, 1800000);
  
}());

//
// Document ready function
//

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
        switch (ls.infoscreenLastStatusCode) {
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
    $('#news #right').hide();
    $('#news #left').attr('id', 'full');
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
  if (!Affiliation.org[ls.affiliationKey1].hardware) {
    $('#office').hide();
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
  $('#news .post img').attr('src', placeholder);

  // Apply the affiliation's own name for it's office
  if (Affiliation.org[ls.affiliationKey1].hardware) {
    if (Affiliation.org[ls.affiliationKey1].hardware.office) {
      $('#todays #schedule .title').text(Affiliation.org[ls.affiliationKey1].hardware.office);
    }
  }

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
