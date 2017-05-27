"use strict";

var Clock = {

	start: function() {
		var self = this;
		setInterval(function() {
			self.updateTime();
		}, 1000);
	},

	updateTime: function() {
		var now = new Date();

		var hour = now.getHours();
		var minute = now.getMinutes();

		if (hour < 10) { hour = "0" + hour; }
		if (minute < 10) { minute = "0" + minute; }

		if($("#hours").html() != hour) {
			$("#hours").html(hour);
		}
		if($("#minutes").html() != minute) {
			$("#minutes").html(minute);
		}
	},

}.start();
