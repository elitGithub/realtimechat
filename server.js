const path = require('path');
const http = require('http');
const express = require('express');
const sokcetio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const botName = 'ChatCordBot';
const app = express();
const server = http.createServer(app);
const io = sokcetio(server);

app.use(express.static(path.join(__dirname, '/public/')));

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        // Welcome to new user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!!'));

        // New user connected
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        io.to(user.room).emit('roomusers', {
            room: user.room, users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // User disconnected
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            io.to(user.room).emit('roomusers', {
                room: user.room, users: getRoomUsers(user.room)
            });
        }
    });

});

const PORT = 3000 || proceses.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
