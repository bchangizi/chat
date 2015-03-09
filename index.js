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

    socket.on('adduser', function (room, username) {
        socket.username = username;
        if(typeof usernames[room] === 'undefined') {
           usernames[room] = {};
        }
        usernames[room][username] = username;
        socket.room = room;
        socket.join(room);
        io.to(room).emit('updateroom', room, usernames[room]);
//        io.to(room).emit('updatechat', room, 'INFO', username + ' has connected to this chat');
    });

    socket.on('sendchat', function (room, data) {
        io.to(room).emit('updatechat', room, socket.username, data);
    });

    socket.on('disconnect', function () {
        delete usernames[socket.username];
        io.emit('updateroom', usernames);
    });
});
