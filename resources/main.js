/*jslint node: true, nomen: true*/
/*global $ */
/*global io */
/*global prompt */

"use strict";
var socket = io();

socket.on('connect', function(){
      socket.emit('adduser', prompt("What's your name?"));
});

socket.on('updatechat', function (username, data) {
    $('#messages').prepend('<li data-user="' + username + '"><b>'+username + '</b>: ' + data +'</li>');
});

socket.on('updateroom', function (data) {
    $('#users').append('<li class="list-group-item">' + data + '</li>');
});

$('#chat-form').submit(function( event ){
    socket.emit('sendchat', $('#m').val());
    $('#m').val('');
    return false;
});
