/*jslint node: true, nomen: true*/

"use strict";
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var io = require('socket.io').listen(server);

Array.prototype.indexOf = function (searchElement, fromIndex) {

	var k;
	var O = Object(this);
	var len = O.length >>> 0;
	if (len === 0) {
		return -1;
	}
	var n = +fromIndex || 0;
	if (Math.abs(n) === Infinity) {
		n = 0;
	}
	if (n >= len) {
		return -1;
	}
	k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
	while (k < len) {
		if (k in O && O[k] === searchElement) {
			return k;
		}
		k++;
	}
	return -1;
};


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/resources/', express.static(__dirname + "/resources/"));

var usernames = {};
var clients = [];

io.on('connection', function (socket) {

	socket.on('adduser', function (room, username) {
		if (typeof usernames[room] === 'undefined') {
			usernames[room] = [];
		}

		if (room === 'global') {
			if (usernames[room].indexOf(username) >= 0) {
				socket.emit('badusername');
				return false;
			} else {
				clients[username] = socket.id;
			}
		}

		usernames[room].push(username);
		socket.username = username;
		socket.room = room;
		socket.join(room);
		io.to(room).emit('updateroom', room, usernames[room]);
		io.to(room).emit('updatechat', room, 'INFO', username + ' has connected to this chat');
	});

	socket.on('inviteuser', function (room, username) {
		if (typeof clients[username] === 'undefined') {
			socket.emit('usermissing', username);
		} else {
			io.to(clients[username]).emit('invitation', room);
		}
	});

	socket.on('createRoom', function (room, username) {
		socket.username = username;
		usernames[room] = {};
		usernames[room][username] = username;
		socket.room = room;
		socket.join(room);
		io.to(room).emit('updateroom', room, username[room]);
	});

	socket.on('sendchat', function (room, data) {
		io.to(room).emit('updatechat', room, socket.username, data);
	});

	socket.on('disconnect', function () {
		for (var room in usernames) {
			var index = usernames[room].indexOf(socket.username);
			if (index >= 0) {
				usernames[room].splice(index, 1);
				io.emit('updateroom', room, usernames[room]);
				io.to(room).emit('updatechat', room, 'INFO', socket.username + ' has left the chat');
			}
		}
	});
});
