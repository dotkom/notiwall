"use strict";

var ls = localStorage;

var showSavedNotification = function() {
  $("#notification").fadeIn(200);
  setTimeout(function() {
    $("#notification").fadeOut(200);
  }, 800);
}

var bindAffiliationSelector = function(number, isPrimaryAffiliation) {
  var id = 'affiliationKey'+number;
  var affiliationKey = ls[id];
  // Default values, set only the chosen affiliation as selected, because it is the Chosen One
  $('#'+id).val(affiliationKey);
  // React to change
  $('#'+id).change(function() {
    var affiliationKey = $(this).val();
    var oldAffiliation = ls[id];
    // Save the change
    ls[id] = affiliationKey;

    if (!isPrimaryAffiliation) {
      // Symbol
      var symbol = Affiliation.org[ls.affiliationKey2].symbol;
      $('#affiliation2Symbol').attr('style', 'background-image:url("'+symbol+'");');
      // Website link
      var web = Affiliation.org[ls.affiliationKey2].web
      $('#affiliation2Symbol').unbind('click');
      $('#affiliation2Symbol').click(function() {
        Browser.openTab(web);
      });
    }
    else {
      // Check if switching from or to an affiliation with fancy features
      var old_has_hardware = (Affiliation.org[oldAffiliation].hw ? true : false);
      var new_has_hardware = (Affiliation.org[affiliationKey].hw ? true : false);
      if (old_has_hardware && !new_has_hardware) {
        disableHardwareFeatures();
      }
      else if (!old_has_hardware && new_has_hardware) {
        enableHardwareFeatures();
      }
      // either way, change the icons shown in the office status feature
      if (new_has_hardware) {
        // Clear and update affiliation data
        Affiliation.clearAffiliationData();
        Browser.getBackgroundProcess().updateAffiliation();
      }

      // Palette
      var palette = Affiliation.org[affiliationKey].palette;
      if (typeof palette !== 'undefined') {
        $('#affiliationPalette').val(palette);
        ls.affiliationPalette = palette;
        // Applying chosen palette
        $('#palette').attr('href', Palettes.get(palette));
      }

      // Extension icon
      var icon = Affiliation.org[affiliationKey].icon;
      Browser.setIcon(icon);
      // Favicon
      $('link[rel="shortcut icon"]').attr('href', icon);
      // Symbol
      var symbol = Affiliation.org[affiliationKey].symbol;
      $('#affiliation1Symbol').attr('style', 'background-image:url("'+symbol+'");');
      // Website link
      var web = Affiliation.org[affiliationKey].web;
      $('#affiliation1Symbol').unbind('click');
      $('#affiliation1Symbol').click(function() {
        Browser.openTab(web);
      });
      // Name to badge title and localstorage
      var name = Affiliation.org[affiliationKey].name;
      Browser.setTitle(name + ' Notiwall');
    }

    // Throw out old news
    ls.removeItem('affiliationNews'+number);

    if (ls['showAffiliation'+number] === 'true') {
      // Update to new feed
      Browser.getBackgroundProcess().updateAffiliationNews(number);
    }

    // Display Saved<3
    showSavedNotification();
    // Analytics
    Analytics.trackEvent('clickAffiliation'+number, affiliationKey);
  });
}

var bindPaletteSelector = function() {
  // Default values
  $('#affiliationPalette').val(ls.affiliationPalette);
  // React to change
  $('#affiliationPalette').change(function() {
    // Get newly set value
    var palette = $(this).val();
    // Save it
    ls.affiliationPalette = palette;
    // Applying palette to options page
    console.log('Applying chosen palette', palette);
    $('#palette').attr('href', Palettes.get(palette));
    // Display Saved<3
    showSavedNotification();
    // Analytics
    Analytics.trackEvent('clickPalette', palette);
  });
}

var disableHardwareFeatures = function(quick) {
  if (quick) {
    $('div.hardwareFeatures').hide();
  }
  else {
    $('div.hardwareFeatures').slideUp();
  }
}

var enableHardwareFeatures = function(quick) {
  if (quick) {
    $('div.hardwareFeatures').show();
  }
  else {
    $('div.hardwareFeatures').slideDown();
  }
  Browser.getBackgroundProcess().updateStatusAndMeetings(true);
}

var bindCantinaSelector = function(selector) {
  // Default values
  $('#' + selector).val(ls[selector]);
  // React to change
  $('#' + selector).change(function() {
    var cantina = $(this).prop('value');
    ls[selector] = cantina;
    Analytics.trackEvent('clickCantina', cantina);
    Browser.getBackgroundProcess().updateCantinas();
  });
}

var bindBusFields = function(busField) {
  var cssSelector = '#' + busField;
  // console.log('Binding bus fields for ' + cssSelector);

  var stop = $(cssSelector + ' input');
  var direction = $(cssSelector + ' select');

  // Load users saved buses
  loadBus(busField);

  // Stop field -> Focus

  $(stop).focus(function() {
    // Clear stop field on click
    console.log('focus - clear field and show saved value as placeholder');
    // Show suggestion sheet
    $('div#busSuggestions').slideDown();
    // Keep the stop that has been "clicked away"
    ls.busStopClickedAway = ls[busField+'Name'];
    $(stop).val('');
    $(stop).attr('placeholder', ls.busStopClickedAway);
  });

  // Stop field -> Lose focus

  $(stop).focusout(function() {

    // Lost focus, suggestions on busstops?
    var partialStop = $(stop).val();
    var suggestions = Stops.partialNameToPotentialNames(partialStop);

    // No input, revert to the busstop that was clicked away
    if (partialStop === '' || suggestions.length === 0) {
      console.log('focusout - empty field or invalid input, return to last saved value');
      if (ls.busStopClickedAway !== null) {
        $(stop).val(ls.busStopClickedAway);
      }
      clearSuggestions();
    }
    // 1 suggestion, go for it!
    else if (suggestions.length === 1) {
      console.log('focusout - 1 suggestion, save it');
      var correctStop = suggestions[0];
      $(stop).val(correctStop);
      $('div#suggestions').html('<div class="correct">' + correctStop + '</div>');
      // Show final bus stop in suggestion sheet for a short while
      setTimeout(function() {
        clearSuggestions();
      }, 1500);
      getDirections(busField, correctStop);
      getFavoriteLines(busField);
      saveBus(busField);
    }
    // Several suggestions, allow the user to see them and click them for a short while
    else if (suggestions.length > 1) {
      console.log('focusout - several suggestions, remove them');
      setTimeout(function() {
        $('div#suggestions .suggestion').fadeOut(function() {
          clearSuggestions();
          if (ls.busStopClickedAway !== null) {
            $(stop).val(ls.busStopClickedAway);
          }
        });
      }, 500);
    }
    else {
      console.log('focusout - nothing to do');
      $('div#busSuggestions').slideUp(); // Hide suggestion sheet
    }
  });

  // Stop field -> Key up

  $(stop).keyup(function(event) {

    // Do nothing if arrow key or function key is pressed
    var k = event.keyCode;
    if ((37 <= k && k <= 40) || (17 <= k && k <= 18) || k === 91) {
      console.log('keyup - arrow key or function key, do nothing');
    }

    // If anything else is clicked, get suggestions
    else {
      console.log('keyup - getting suggestions');
      // Save the id of the bus field in focus
      ls.busInFocus = $(stop).parent().attr('id');
      // Find the partial name
      var nameStart = $(stop).val();

      if (nameStart.length > 0) {
        // Suggestions
        var suggestions = Stops.partialNameToPotentialNames(nameStart);
        $('div#suggestions').html('');
        for (var i in suggestions) {
          var _text = suggestions[i];
          $('div#suggestions').append('<div class="suggestion">' + _text + '</div>');
        }

        // Only one suggestion? Inject it
        if (suggestions.length === 1) {
          var correctStop = suggestions[0];
          $(stop).val(correctStop);
          $(stop).blur();
          $('div#suggestions').html('<div class="correct">' + correctStop + '</div>');
          // Show final bus stop in suggestion sheet for a short while
          setTimeout(function() {
            clearSuggestions();
          }, 1500);
          getDirections(busField, correctStop);
          getFavoriteLines(busField);
          saveBus(busField);
        }
      }
      // All characters removed, remove suggestions
      else {
        $('div#suggestions').html(''); // Empty suggestion sheet
        // But don't remove it, because the user still focuses on the field
      }
      // After inserting new results, rebind suggestions, making them clickable
      bindSuggestions();
    }
  });

  // Direction field -> Change

  $(direction).change(function() {
    // Get new favorite lines in case they are different, and save changes ofc
    getFavoriteLines(busField);
    saveBus(busField);
  });

  // Bind favorite bus lines fields as well
  bindFavoriteBusLines(busField);
}

var bindFavoriteBusLines = function(busField) {
  var cssSelector = '#' + busField;
  // Switch status on click
  $(cssSelector + ' .lines .line').click(function() {
    // Switch status and save
    if ($(this).hasClass('active')) {
      $(this).attr('class', 'inactive');
    }
    else if ($(this).hasClass('inactive')) {
      $(this).attr('class', 'active');
    }
    else {
      console.error('Favorite bus line <span> with neither .active nor .inactive');
    }
    saveBus(busField);
  });
}

var clearSuggestions = function() {
  $('div#suggestions').html(''); // Empty suggestion sheet
  $('div#busSuggestions').slideUp(); // Hide suggestion sheet
}

var getDirections = function(busField, correctStop) {
  var cssSelector = '#' + busField;
  var stopName = $(cssSelector + ' input');
  var directionField = $(cssSelector + ' select');
  // Get and inject possible directions for correct stop
  var allDirections = Stops.nameToDirections(correctStop);
  $(directionField).html('');
  for (var i in allDirections) {
    var direction = allDirections[i];
    $(directionField).append('<option>' + direction + '</option>');
  }
}

var getFavoriteLines = function(busField) {
  var cssSelector = '#' + busField;

  // Show it
  $('#busBox .lines').slideDown();
  $('#busBox #arrowDown').fadeOut();

  // Get stopname, direction, stopid
  var stopName = $(cssSelector + ' input').val();
  var direction = $(cssSelector + ' select').val();
  // Get and inject possible lines for correct stop
  var busStopId = Stops.nameAndDirectionToId(stopName, direction);
  // Load lines for that bus stop
  var lines = Favorite.getLinesForStop(busStopId);

  // Error message? (string)
  if (typeof lines === 'string') {
    $(cssSelector + ' .lines').html('<span class="error">'+lines+'</span>');
  }
  else {
    // Add lines to bus stop
    $(cssSelector + ' .lines').html('<table border="0" cellpadding="0" cellspacing="0"><tr>');
    var counter = 0;
    for (var i in lines) {
      var line = lines[i];
      if (counter % 4 === 0) {
        $(cssSelector + ' .lines table').append('</tr><tr>');
      }
      $(cssSelector + ' .lines table tr:last').append('<td class="line active">'+line+'</td>');
      counter++;
    }
    $(cssSelector + ' .lines').append('</tr></table>');

    // Save the newly added lines
    saveBus(busField);
    // Make the bus lines clickable
    bindFavoriteBusLines(busField);
  }

  // Hide the favorite lines after a short timeout
  setTimeout(function() {
    if (!$('#busBox').hasClass('hover')) {
      $('#busBox .lines').slideUp();
      $('#busBox #arrowDown').fadeIn();
    }
  }, 2500);
}

var saveBus = function(busField) {
  var cssSelector = '#' + busField;
  // Get stopname, direction, stopid
  var stopName = $(cssSelector + ' input').val();
  var direction = $(cssSelector + ' select').val();
  var busStopId = Stops.nameAndDirectionToId(stopName, direction);
  // Get active/inactive lines
  var activeLines = [];
  $(cssSelector + ' .lines .active').each(function() {
    activeLines.push(Number($(this).text()));
  });
  var inactiveLines = [];
  $(cssSelector + ' .lines .inactive').each(function() {
    inactiveLines.push(Number($(this).text()));
  });
  // Save all to localStorage
  ls[busField] = busStopId;
  ls[busField + 'Name'] = stopName;
  ls[busField + 'Direction'] = direction;
  ls[busField + 'ActiveLines'] = JSON.stringify(activeLines);
  ls[busField + 'InactiveLines'] = JSON.stringify(inactiveLines);
  console.log('saved activeLines for '+busField, '"', activeLines, '"');
  console.log('saved inactiveLines '+busField, '"', inactiveLines, '"');
  console.log('saved for busStopId ' + busStopId);
  showSavedNotification();
  // Analytics? No, we're not running analytics on bus stops, it would have privacy implications.
}

var loadBus = function(busField) {
  var cssSelector = '#' + busField;
  var stopName = ls[busField + 'Name'];
  var direction = ls[busField + 'Direction'];
  var activeLines = ls[busField + 'ActiveLines'];
  var inactiveLines = ls[busField + 'InactiveLines'];

  // Add stopname and direction to busfields
  if (typeof stopName !== 'undefined' && typeof direction !== 'undefined') {
    $(cssSelector + ' input').val(stopName);
    $(cssSelector + ' select').val(direction);
    // console.log('loaded "' + stopName + '" to "' + busField + '"');
  }

  // Add active and inactive lines to busfields
  if (typeof activeLines !== 'undefined' && typeof inactiveLines !== 'undefined') {
    // If the page just opened and there are no favorite lines then get some
    if (activeLines === '' && inactiveLines === '') {
      getFavoriteLines(busField);
    }
    else {
      activeLines = JSON.parse(activeLines); // stringified array
      inactiveLines = JSON.parse(inactiveLines); // stringified array
      // Collect active and inactive lines to a single dict
      // with boolean values showing active or inactive
      var lines = {};
      for (var i in activeLines) {
        var line = activeLines[i]
        lines[line] = true;
      }
      for (var i in inactiveLines) {
        var line = inactiveLines[i]
        lines[line] = false;
      }
      // Sort the dict by keys (bus line numbers sorted in ascending order)
      var keys = [];
      for (var i in lines) {
        keys.push(i);
      }
      keys = keys.sort(function(a,b) {
        return a - b;
      });
      // Add lines to bus stop as a generated table
      $(cssSelector + ' .lines').html('<table border="0" cellpadding="0" cellspacing="0"><tr>');
      var counter = 0;
      for (var i in keys) {
        var i = keys[i];
        if (counter % 4 == 0) {
          $(cssSelector + ' .lines table').append('</tr><tr>');
        }
        var status = (lines[i] === true ? 'active' : 'inactive');
        $(cssSelector + ' .lines table tr:last').append('<td class="line '+status+'">'+i+'</td>');
        counter++;
      }
      $(cssSelector + ' .lines').append('</tr></table>');
    }
  }
}

var slideFavoriteBusLines = function() {
  // Hide the favorite bus line spans from the start
  setTimeout(function() {
    if (!$('#busBox').hasClass('hover')) {
      $('#busBox .lines').slideUp();
      $('#busBox #arrowDown').fadeIn();
    }
  }, 1500);
  // Show favorite bus line spans when hovering
  $('#busBox').mouseenter(function() {
    clearTimeout($(this).data('timeoutId'));
    $('#busBox .lines').slideDown();
    $('#busBox #arrowDown').fadeOut();
  });
  $('#busBox').mouseleave(function() {
    var timeoutId = setTimeout(function() {
      if ($('#busBox .lines img').length === 0) { // currently displaying loading gifs?
        $('#busBox .lines').slideUp();
        $('#busBox #arrowDown').fadeIn();
      }
    }, 500);
    // Set the timeoutId, allowing us to clear this trigger if the mouse comes back over
    $('#busBox').data('timeoutId', timeoutId);
  });
}

var bindSuggestions = function() {
  $('.suggestion').click(function() {
    if (typeof ls.busInFocus !== 'undefined') {
      var text = $(this).text();
      $('#' + ls.busInFocus + ' input').val(text);
      getDirections(ls.busInFocus, text);
      getFavoriteLines(ls.busInFocus);
      saveBus(ls.busInFocus);
      $('div#suggestions .suggestion').fadeOut(50, function() {
        clearSuggestions();
      });
    }
  });
}

var restoreChecksToBoxes = function() {
  // Restore checks to boxes from localStorage
  $('input:checkbox').each(function(index, element) {
    if (ls[element.id] === 'true') {
      element.checked = true;
    }
  });
}(); // Self executing

var linkToNotiwalls = function() {
  $('img.preview').click(function() {
    // Store it
    var name = $(this).attr('data-name');
    ls.whichScreen = name;
    // Open it
    var link = $(this).attr('data-link');
    Browser.openTab(link);
  });
}(); // Self executing

// Document ready, go!
$(document).ready(function() {
  if (DEBUG) {
    // Show the DEBUG affiliation
    $('optgroup.debugAffiliation').show();
  }

  // Remove hardware features if the affiliation does not have it
  if (!Affiliation.org[ls.affiliationKey1].hw) {
    disableHardwareFeatures();
  }

  // Apply affiliation specific features
  // favicon
  var icon = Affiliation.org[ls.affiliationKey1].icon;
  $('link[rel="shortcut icon"]').attr('href', icon);
  // news symbol
  var symbol1 = Affiliation.org[ls.affiliationKey1].symbol;
  $('#affiliation1Symbol').attr('style', 'background-image:url("'+symbol1+'");');
  var symbol2 = Affiliation.org[ls.affiliationKey2].symbol;
  $('#affiliation2Symbol').attr('style', 'background-image:url("'+symbol2+'");');
  // website
  var web1 = Affiliation.org[ls.affiliationKey1].web;
  $('#affiliation1Symbol').unbind('click');
  $('#affiliation1Symbol').click(function() {
    Browser.openTab(web1);
  });
  var web2 = Affiliation.org[ls.affiliationKey2].web;
  $('#affiliation2Symbol').unbind('click');
  $('#affiliation2Symbol').click(function() {
    Browser.openTab(web2);
  });
  // palette
  $('#palette').attr('href', Palettes.get(ls.affiliationPalette));
  // icons

  // Set focus to affiliation 1 selector
  $('#affiliationKey1').focus();

  // Allow user to change affiliation and palette
  bindAffiliationSelector('1', true);
  bindAffiliationSelector('2', false);
  bindPaletteSelector();
  if (ls.showAffiliation2 !== 'true') {
    $('#affiliationKey2').attr('disabled', 'disabled');
    $('#affiliation2Symbol').css('-webkit-filter', 'grayscale(100%)');
  }

  // Allow user to select cantinas
  bindCantinaSelector('cantina1');
  bindCantinaSelector('cantina2');

  // Give user suggestions for autocomplete of bus stops
  bindBusFields('firstBus');
  bindBusFields('secondBus');

  // Slide away favorite bus lines when not needed to conserve space
  slideFavoriteBusLines();

  // Load lists of bus stops
  Stops.load();

  // Adding a hover class to #busBox whenever the mouse is hovering over it
  $('#busBox').hover(function() {
    $(this).addClass('hover');
  }, function() {
    $(this).removeClass('hover');
  });

  // Adding a hover class to #affiliationBox whenever the mouse is hovering over it
  $('#affiliationBox').hover(function() {
    $(this).addClass('hover');
  }, function() {
    $(this).removeClass('hover');
  });

  // Catch new clicks
  $('input:checkbox').click(function() {
    // Currently, the only checkbox in options is "showAffiliation2"
    var _capitalized = this.id.charAt(0).toUpperCase() + this.id.slice(1);
    Analytics.trackEvent('click'+_capitalized, this.checked);

    ls[this.id] = this.checked;

    if (this.id === 'showAffiliation2' && this.checked === false) {
      $('#affiliationKey2').attr('disabled', 'disabled');
      $('#affiliation2Symbol').css('-webkit-filter', 'grayscale(100%)');
    }
    if (this.id === 'showAffiliation2' && this.checked === true) {
      $('#affiliationKey2').removeAttr('disabled');
      $('#affiliation2Symbol').css('-webkit-filter', 'grayscale(0%)');
    }

    showSavedNotification();
  });

});
