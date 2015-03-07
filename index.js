/*jslint node: true */
"use strict";
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var usernames = {};

io.on('connection', function(socket){

  socket.on('adduser', function(username){
		socket.username = username;
		usernames[username] = username;
		socket.emit('updateroom', username);
    socket.emit('updatechat', 'SERVER', username + ' has connected to this chat');
	});

  socket.on('sendchat', function(data){
    io.emit('updatechat', socket.username, data);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
