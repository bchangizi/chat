/*jslint node: true, nomen: true*/
/*global $ */
/*global io */
/*global prompt */

"use strict";
var socket = io();

var username;

socket.on('connect', function () {
    socket.emit('adduser', 'global', username=prompt("What's your name?"));
});

socket.on('updatechat', function (room, username, data) {
    $('#'+room+' .messages').prepend('<li data-user="' + username + '"><b>' + username + '</b>: ' + data + '</li>');
});

socket.on('updateroom', function (room, data) {
    $('#'+room+' .users li:not(:first)').remove();
    for (var user in data) {
        $('#'+room+' .users').append('<li class="list-group-item">' + user + '</li>');
    }
});

$('#chat-form').submit(function (event) {
    var tab = $("#chat-tabpanel .tab-content .active").attr('id');
    socket.emit('sendchat', tab, $('#m').val());
    $('#m').val('');
    return false;
});

$('#chat-tabpanel .nav-tabs a').on('click', function(e) {
    socket.emit('adduser', $(this).attr('href').replace('#', ''), username);
});
