/*jslint node: true, nomen: true*/
/*global $ */
/*global io */
/*global prompt */
/*global alert */
/*global confirm */
/*global document */

"use strict";
var socket = io();

var username;
var globalUsers = [];
var typeaheads = [];

var substringMatcher = function (strs) {
	return function findMatches(q, cb) {
		var matches, ignore, substrRegex;

		// an array that will be populated with substring matches
		matches = [];
		// an array that will be populated with substring to ignore on iteration
		ignore = [];

		// regex used to determine if a string contains the substring `q`
		substrRegex = new RegExp(q, 'i');

		// iterate through the pool of strings and for any string that
		// begins with the substring `q`, add it to the `matches` array
		$.each(strs, function (i, str) {
			if (substrRegex.test(str.substr(0, q.length))) {
				// the typeahead jQuery plugin expects suggestions to a
				// JavaScript object, refer to typeahead docs for more info
				matches.push({
					value: str
				});
				ignore.push(str);
			}
		});

		// iterate through the pool of strings and for any string that
		// contains the substring `q`, add it to the `matches` array
		$.each(strs, function (i, str) {
			if (ignore.indexOf(str) === -1) {
				if (substrRegex.test(str.substr(q.length))) {
					// the typeahead jQuery plugin expects suggestions to a
					// JavaScript object, refer to typeahead docs for more info
					matches.push({
						value: str
					});
				}
			}
		});

		cb(matches);
	};
};

socket.on('connect', function () {
	socket.emit('adduser', 'global', username = prompt("What's your name?"));
});

socket.on('badusername', function () {
	socket.emit('adduser', 'global', username = prompt("This name is already used. Please chose another one."));
});

socket.on('updatechat', function (room, username, data) {
	$('#' + room + ' .messages').prepend('<li data-user="' + username + '"><b>' + username + '</b>: ' + data + '</li>');
});

socket.on('updateroom', function (room, data) {
	if (room === 'global') {
		globalUsers = data;
		for (var i in typeaheads) {
			typeaheads[i].data('ttTypeahead').dropdown.datasets[0].source = substringMatcher(globalUsers);
		}
	}
	$('#' + room + ' .users li:not(:first)').remove();
	for (var user in data) {
		$('#' + room + ' .users').append('<li class="list-group-item">' + data[user] + '</li>');
	}
});

socket.on('invitation', function (room) {
	if (confirm('You are invited in the Room ' + room)) {
		var tab = $('#chat-tabpanel .nav-tabs li.hidden').html();
		var content = $('.tab-content #newroom').clone().html();
		$('#chat-tabpanel .nav-tabs').append('<li role="presentation">' + tab.replace('newroom', room).replace('+', 'Room ' + room) + '</li>');
		$('#chat-tabpanel .tab-content').append('<div role="tabpanel" class="tab-pane active" id="' + room + '">' + content + '</div>');

		typeaheads[room] = $('#' + room + ' .typeahead').typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'states',
			displayKey: 'value',
			source: substringMatcher(globalUsers)
		});

		$('#chat-tabpanel .nav-tabs a:last').tab('show');
		socket.emit('adduser', room, username);
	}
});

socket.on('usermissing', function (user) {
	alert('User ' + user + ' does not exist');
});

$('#chat-form').submit(function (event) {
	var tab = $("#chat-tabpanel .tab-content .active").attr('id');
	socket.emit('sendchat', tab, $('#m').val());
	$('#m').val('');
	return false;
});

$('#chat-tabpanel .nav-tabs a:first').on('click', function (e) {

	e.preventDefault();
	var d = new Date();
	var room = d.getTime() + d.getMilliseconds();

	var tab = $('#chat-tabpanel .nav-tabs li.hidden').html();
	var content = $('.tab-content #newroom').clone().html();

	$('#chat-tabpanel .nav-tabs').append('<li role="presentation">' + tab.replace('newroom', room).replace('+', 'Room ' + room) + '</li>');
	$('#chat-tabpanel .tab-content').append('<div role="tabpanel" class="tab-pane active custom-room" id="' + room + '">' + content + '</div>');

	typeaheads[room] = $('#' + room + ' .typeahead').typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	}, {
		name: 'states',
		displayKey: 'value',
		source: substringMatcher(globalUsers)
	});

	$('#chat-tabpanel .nav-tabs a:last').tab('show');
	socket.emit('adduser', room, username);

});

$('.tab-content').on('click', '.add-user button', function (e) {
	e.preventDefault();
	var tab = $("#chat-tabpanel .tab-content .active").attr('id');
	var user = $(this).parents('.add-user').find('input.username.tt-input').val();
	socket.emit('inviteuser', tab, user);
	$(this).parents('.add-user').find('input').val('');
	return false;
});

$('.add-user').submit(function (e) {
	e.preventDefault();
});
