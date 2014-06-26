var socketio = require('socket.io');
var io;
var guestNumber=1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.list =sunction(server){
  io = socketio.listen(server);
  io.set('log level',1);
  io.sockets.on('connection',function (socket){
    guestNumber = assignGuestName(socket, guestNumber, nickNames, nameswUsed);
    joinRoom('Lobby');

    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket,nickNames,namesUsed);
    handleRoomJoing(socket);

    socket.on('rooms', function(){
      socket.emit('rooms', io.sockets.manager.rooms);
    });

    handleClientDisconnection(socket,nickNames,namesUsed);

  });
};

function assignGuestName(socket, guestNumber, nickNames, nameswUsed)
{
  var name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameresult', {success : true, name : name});
  namesUsed.push(name);
  return gustNumber + 1;
}

function joinRoom(socket, room){
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {room:room});
  socket.broadcast.to(room).emit('message',{ text: nickNames[socket.id] + ' has joined ' + room + ':'});

  var usersInRoom = io.sockets.clients(room);
  if(usersInRoom.length > 1){
    var usersInRoomSummary = 'Users Currently in ' + Room + ': ';
    for(var index in usersInRoom){
      var userSocketId = usersInRoom[index].id;
      if(userSocketId != socket.id){
        if(index > 0){usersInRoomSummary = usersInRoomSummary + ", ";}
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', {text: usersInRoomSummary});
  }
}

function handleNameChangeAttempts(socket,nickNames,namesUsed) {
  socket.on('nameAttempt', function(name){
    if(name.indexOf('Guest') == 0){
      socket.emit('nameResult' {success:fales, message: 'names cannot start with "Guest"'});
    } else {
      if(namesUsed.indexOf(name) == -1){
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {success:fales, name:name});
        socket.boardcast.to(currentRoom[socket.id]).emit('message', {text: previousName + ' is now known as ' + name});
      } else {
        socket.emit('nameResult' {success:fales, message: 'That name is already in use'});
      }
    }
  });
}

function handleMessageBroadcasting(socket, nickNames){
  socket.on('message', function (message){
    socket.broadcast.to(message.room).emit('message', {text: nickNames[socket.id] +': ' + message.text});
  });
}
