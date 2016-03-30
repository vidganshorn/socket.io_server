/*
 *
 *  SERVER FOR Jodel App
 *  Team Project
 *  FSS 2016
 *
 *  University of Mannheim
 *
 *  Created by David Ganshorn on 18/03/16.
 *  Copyright © 2016 David Ganshorn. All rights reserved.
 *
 */


var app = require('express')()
, Room = require('./room.js')
, User = require('./user.js')
, uuid = require('node-uuid')
, _ = require('underscore')._;;

var http = require('http').Server(app);
var io = require('socket.io')(http);

var userList = [];
var typingUsers = {};

var users = {};

var rooms = {};
//var sockets = [];

app.get('/', function(req, res){
  res.send('<h1>AppCoda - SocketChat Server</h1>');
});


http.listen(3000, function(){
  console.log('Listening on *:3000');
});

// First Request
// Connect Device to Server
io.on('connection', function(clientSocket) {
      
  console.log('a user connected');

  // Disconnect Device from Server
  clientSocket.on('disconnect', function(){
    console.log('user disconnected');

    // Variable for User.deviceID
    var clientNickname;
    
    // Variable for Room.name
    var roomName;
                  
    for (var i=0; i<userList.length; i++) {
                  
      if (userList[i]["id"] == clientSocket.id) {
                  
        userList[i]["isConnected"] = false;
        clientNickname = userList[i]["nickname"];
        break;
      }
    }

    delete typingUsers[clientNickname];
    io.emit("userList", userList);
    io.emit("userExitUpdate", clientNickname);
    io.emit("userTypingUpdate", typingUsers);
  });


  clientSocket.on("exitUser", function(clientNickname){
    for (var i=0; i<userList.length; i++) {
      if (userList[i]["id"] == clientSocket.id) {
        userList.splice(i, 1);
        break;
      }
    }
    io.emit("userExitUpdate", clientNickname);
  });


  clientSocket.on('chatMessage', function(clientNickname, message){
    var currentDateTime = new Date().toLocaleString();
    delete typingUsers[clientNickname];
    io.emit("userTypingUpdate", typingUsers);
    io.emit('newChatMessage', clientNickname, message, currentDateTime);
  });


  clientSocket.on("connectUser", function(clientNickname) {
                  
      var message = "User " + clientNickname + " was connected.";
      console.log(message);

      var userInfo = {};
      var foundUser = false;
                  
      for (var i=0; i < userList.length; i++) {
                  
        if (userList[i]["nickname"] == clientNickname) {
                  
          userList[i]["isConnected"] = true
          userList[i]["id"] = clientSocket.id;
                  
          userInfo = userList[i];
          foundUser = true;
          break;
        }
      }
                  
      var user = new User(clientSocket.id, clientNickname);
      users[clientSocket.id] = user;

      if (!foundUser) {
                  
        userInfo["id"] = clientSocket.id;
        userInfo["nickname"] = clientNickname;
        userInfo["isConnected"] = true
                  
        userList.push(userInfo);
                  
        //sockets.push(clientSocket);
      }

      io.emit("userList", userList);
      io.emit("userConnectUpdate", userInfo)
  });
      
  /*
   *
   *    Method: Create Room
   *
   */
  clientSocket.on("createRoom", function(roomName) {
        
    console.log('Function: Room ' + roomName + ' was created.');
                  // console.log('with user1 = ' + user1);
                  // console.log('and user2 = ' + user2);
                  
    // Check if roomName already exists
    // Maybe the validation in client
    // ensure that roomName is not send twice to socket.io
    // To Be checked
            
    // Test
    console.log(clientSocket.id)
                  
    var id = uuid.v4();
    
    // NEW
    var room = new Room(id, roomName);
    // OLD
    // var room = new Room(roomName, id, clientSocket.id);
                  
                  console.log('create1');
                  
    rooms[id] = room;
    sizeRooms = _.size(rooms);
                  
                  console.log('create2');
    
    // "roomList" is a client side function
    // io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
    // io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
                  
                  console.log('create3');
                  console.log(sizeRooms);
                  
    // Check if user is already in this room
    // users[clientSocket.id].owns = id;
    // users[clientSocket.id].inroom = id;
                  
                  console.log('create4');
            
    room.addPerson(clientSocket.id);
                  
                  // TEst
                  clientSocket.join(rooms[id]);
                  
                  console.log('Test End')
        
                  // console.log(room.people[0]);
                  // console.log(room.people[1]);
                  // console.log(room.name);
                  console.log('room is ' + room);
                  
                  /*
                  for(chat in room ) {
                    console.log(chat.people)
                  }
                   */
                  
                  console.log('create5');
                  
    // client functions
    io.emit("update", "Welcome to " + room.name + ".");
    io.emit("socketRoomID", id);
                  
                  console.log(rooms[id].id)
                  
                  console.log('create6');
                  
                  console.log(rooms)
                  
    console.log('chat room with socket.io id: ' + id + ' was successfully created');
  });
      
  /*
   *
   *    Method: Join Room
   *
   */
  clientSocket.on("joinRoom", function(roomID) {

    if (typeof clientSocket.id !== "undefined") {

        var room = rooms[roomID];
                  
        // Check if user is already contained in this room
        if (_.contains((room.people), clientSocket.id)) {

            clientSocket.emit("update", "You have already joined this room.");
                  console.log('You have already joined this room.');
        }
        else {
            room.addPerson(clientSocket.id);

            clientSocket.join(rooms[roomID]);

            user = room.people[clientSocket.id];
            
            // io.sockets.in(clientSocket.room).emit("update", user.name + " has connected to " + room.name + " room.");
            console.log(clientSocket.id + ' has connected to ' + room.name + ' room.')
            
            // client function
            io.emit("update", "Welcome to " + room.name + ".");
                  console.log('Welcome to ' + room.name + '.');
            
            // client function
                  // old
            io.emit("sendRoomID", {id: roomID});
                  
                  //NEW
            // io.emit("sendRoomID", roomID);
                  
                  console.log(room);
        }
    }
    else {
 
        // client function
        io.emit("update", "Please enter a valid name first.");
                  console.log('Please enter a valid name first.');
    }

  });
      
  /*
   *
   *    Method: Send Message
   *
   */
  clientSocket.on("sendMessage", function(message, roomID, emitter) {
            
    //process.exit(1);
                  /*
    var re = /^[w]:.*:/;
    var whisper = re.test(msg);
    var whisperStr = msg.split(":");
    var found = false;
                   */
                
            
            //if (io.sockets.manager.roomClients[socket.id]['/'+socket.room] !== undefined ) {
            
            // io.clientSocket.in(clientSocket.room).emit("getChatMessage", users[clientSocket.id], message); // --> error
                  
                  //io.to(rooms[roomID]).emit("getChatMessage", message, emitter);
                  
                  // io.emit("getChatMessage", message, emitter);
                  
                  // io.to(rooms[roomID]).emit('getChatMessage', message, emitter);
                  
                  var room = rooms[roomID]
                  
                  // Funktioniert ✌🏻
                  // io.emit('getChatMessage', message, emitter);
                  
                  console.log(rooms[roomID].id)
                  
                  // 1st Ty
                  // Senden von Nachrichten funktioniert,
                  // aber das senden in einen speziellen ChatRaum geht nicht 😰
                  // Test -- Funktioniert nicht 😰
                  //io.sockets.to(rooms[roomID]).emit('getChatMessage', message, emitter);
                  
                  // 2nd Try
                  // Senden von Nachrichten funktioniert,
                  // aber das senden in einen speziellen ChatRaum geht nicht 😰
                  // Test -- Funktioniert nicht 😰
                  io.to(rooms[roomID]).emit('getChatMessage', message, emitter, roomID);
                  
                  console.log("roomID")
                  console.log(roomID)
                  
                  console.log("room.id")
                  console.log(room.id)
                  
                  // io.in(room).emit('getChatMessage', message, emitter);
                  // io.sockets.in(clientSocket.room).emit('getChatMessage', message, emitter, room.id);
                  
                  
                  
                  
                  //io.to('some room').emit('some event'):
                  
                  
                  //io.sockets.to(rooms[roomID]).emit('getChatMessage', message, emitter);
                  
                  
                  
                  //io.to(rooms[roomID]).emit('getChatMessage', message, emitter);
                  // io.to(rooms[roomID]).emit("getChatMessage", message, emitter);
                  // io.to(rooms[roomID]).emit("getChatMessage", users[clientSocket.id], message, emitter);
                    // io.in('some room').emit('some event'):
                  
                  // io.emit("isTyping", false);
                  var isTyping = "false"
                  io.emit("isTyping", isTyping, emitter, roomID);
  });


  clientSocket.on("startType", function(emitter, roomID) {
                  
    console.log("User " + clientSocket.id + " is writing a message...");

                  var isTyping = "true"
                  
                  console.log(isTyping)
                  console.log(emitter)
                  console.log(roomID)
   
    io.emit("isTyping", isTyping, emitter, roomID);
  });


  clientSocket.on("stopType", function(emitter, roomID) {
    
    console.log("User " + clientSocket.id + " has stopped writing a message...");

                  var isTyping = "false"

                  console.log(isTyping)
                  console.log(emitter)
                  console.log(roomID)
    
    io.emit("isTyping", isTyping, emitter, roomID);
  });

});
