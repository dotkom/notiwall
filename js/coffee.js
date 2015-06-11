"use strict";

var Coffee = {

  msgNoPots: 'Ingen kanner i dag',
  msgNoCoffee: 'Kaffen har ikke blitt satt på',
  msgConnectionError: 'Frakoblet fra kaffekanna',
  msgComforting: 'Så så, det er sikkert kaffe :)',

  minuteDiff: function(then) {
    // Get now
    var now = new Date();
    var one_minute = 1000 * 60;
    // Calculate difference between the two dates, and convert to minutes
    return Math.floor(( now.getTime() - then.getTime() ) / one_minute);
  },

  prettyAgeString: function(diff, coffeeTime) {
    // Create a proper time string from all the minutes
    if (0 <= diff && diff <= 9)
      return 'Kaffen ble <b>nettopp laget</b>';
    else if (10 <= diff && diff <= 59)
      return 'Kaffen ble laget for '+diff+' min siden';
    else if (60 <= diff)
      return 'Kaffen ble laget kl '+coffeeTime[0]+':'+coffeeTime[1];
    else
      // time is negative, computer is likely in a timezone between GMT -12 and +1
      return 'God reise! Håper de har kaffe! :)';
  },

  prettyPotsString: function(pots) {
    return (pots=='0'?'Ingen kanner':pots=='1'?'1 kanne':pots+' kanner') + ' i dag';
  },

}
