
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const Room = require('./models/room');

const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);

var io = require('socket.io')(server);

// middle
app.use(express.json());

// Databsse
const DB = "mongodb+srv://milansinghchouhan592:milan123@cluster0.z8dnzid.mongodb.net/?retryWrites=true&w=majority";


// Socketio
io.on("connection", (Socket) => {
    console.log('connected');
    Socket.on("createRoom", async ({nickname}) => {
        console.log(nickname);
        
        try {
            // create room
            let room = new Room();
            let player = {
                socketID: Socket.id,
                nickname: nickname,
                playerType: 'X',
            };
            room.players.push(player);
            room.turn = player;

            room = await room.save();
            console.log(room);
            const roomID = room._id.toString();

            Socket.join(roomID);

            // send data to all in a room
            io.to(roomID).emit('createRoomSuccess', room);
            

        } catch (e) {
            console.log(e); 
        }
    });

    Socket.on('joinRoom', async ({nickname,roomID}) => {
        try {
            // if(roomID.match(/^[0-9a-fA-F]{24}$/)) {
            //     Socket.emit('errorOccured', 'Please enter a valid room ID');
            //     return;  
            // }

            let room = await Room.findById(roomID);

            if(room.isJoin) {
                let player = {
                    nickname,
                    socketID: Socket.id,
                    playerType: 'O',
                }
                Socket.join(roomID);
                room.players.push(player);
                room.isJoin = false;
                room = await room.save();
                io.to(roomID).emit('joinRoomSuccess', room);
                io.to(roomID).emit('updatePlayers',room.players);
                io.to(roomID).emit('updateRoom', room);

            } else {
                Socket.emit('errorOccured', 'The game is in progress, try again later');
            }

        } catch (e) {
            console.log(e);
            Socket.emit('errorOccured', 'error');
        }
    });

    Socket.on('tap', async ({index, roomId}) => {
        try {
            let room = await Room.findById(roomId);
            let choice = room.turn.playerType;

            if(room.turnIndex == 0) {
                room.turn = room.players[1];
                room.turnIndex = 1;
            } else {
                room.turn = room.players[0];
                room.turnIndex = 0;
            }
            room = await room.save();

            io.to(roomId).emit('tapped', {
                index,
                choice,
                room,
            })
        } catch (e) {
            console.log(e);
        }
    });

});

mongoose.connect(DB).then(() => {
    console.log('sucessfull');
}).catch((e) => {
    console.log(e);
    Socket.emit('errorOccured', 'Please enter a valid room ID');
});


server.listen(port, '0.0.0.0', () => {
    console.log('server port: ' + port);
});