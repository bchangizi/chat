/*jslint node: true, nomen: true*/

"use strict";
var express = require('express');
var app = express();

var server = app.listen(3000, function () {
    console.log('server started on *:3000');
});

var io = require('socket.io').listen(server);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/resources/', express.static(__dirname + "/resources/"));

var usernames = {};

var rooms = ['global'];

io.on('connection', function (socket) {

    socket.on('adduser', function (username) {
		socket.username = username;
        socket.room = 'global';
		usernames[username] = username;
        socket.join('global');
		socket.emit('updateroom', username);
        socket.emit('updatechat', 'SERVER', username + ' has connected to this chat');
	});

    socket.on('sendchat', function (data) {
        io.emit('updatechat', socket.username, data);
    });
});
