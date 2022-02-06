const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const port = 3003;
const user = {};

app.get('/', (req, res) => {
    res.send('Server started');
});

io.on("connection", (socket) => {
    const uuid = require("uuid");

    io.engine.generateId = (req) => {
        return uuid.v4(req); // must be unique across all Socket.IO servers
    }
    // console.log("ID", io.engine.generateId(1));
    //new user joined
    socket.on('new-user-connected', name => {
        const count = io.engine.clientsCount;
        user[socket.id] = name;

        console.log('JOined a new user', name);
        socket.broadcast.emit('user-joined', name);
    });
    // send message
    socket.on('send', data => {
        socket.broadcast.emit('new-message', { message: data.textMessage, name: user[socket.id], senderId: data.senderId });
    });
    // disconnect
    socket.on('disconnect', (reason) => {
        console.log('Calling disconnect', user[socket.id]);
        socket.broadcast.emit('user-disconnect', user[socket.id]);
        delete user[socket.id];
    });
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});