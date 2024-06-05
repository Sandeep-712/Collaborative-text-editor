import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const allowedOrigins = ['http://localhost:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by cors'));
        }
    }
}

app.use(cors(corsOptions));

const pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456789',
    database: 'mysql',
    insecureAuth: true,
});

const roomUsers = {};

pool.query(
    `CREATE TABLE IF NOT EXISTS documents(
        room_id VARCHAR(255) PRIMARY KEY,
        content TEXT
    )`,
    (err) => {
        if (err) {
            console.log('Error creating table:', err);
        }
    }
);

const httpserver = http.createServer(app);

const io = new Server(httpserver, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

//handle socket connection
io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, username }) => {
        console.log("Socket connection start");
        socket.join(roomId);
        console.log("Connected with socket id:" + socket.id + "roomId:" + "user:" + username);


        // Initialize the room in the roomUsers object if it doesn't exist
        if (typeof roomUsers[roomId] === 'undefined') {
            console.log(`Initializing roomusers for roomid: ${roomId}`);
            roomUsers[roomId] = [];
        }

        // Check if the user is already in the room to prevent duplicate entries
        const existingUser = roomUsers[roomId].find(user => user.username === username);
        if (!existingUser) {
            console.log(`Adding new user ${username} to room ${roomId}`);
            roomUsers[roomId].push({ id: socket.id, username });

            console.log(`Notified other users in room ${roomId} of new user ${username}`);
            socket.broadcast.to(roomId).emit('user-joined', username);
        }
        else {
            console.log(`User ${username} already in room ${roomId}, not re-adding or notifying`);
        }

        console.log(JSON.stringify(roomUsers));
        //Broadcast the list of connected users to everyone in the room except him
        io.in(roomId).emit('connected-users', roomUsers[roomId].map(user => user.username));

        console.log("Query Execution");

        pool.query('SELECT content FROM documents WHERE room_id = ?', [roomId], (err, results) => {
            if (err) {
                console.error('Error retrieving document state:', err);
                socket.emit('document-error', 'Error retrieving document state');
                return;
            }
            const existingDocumentState = results.length > 0 ? JSON.parse(results[0].content) : {};
            socket.emit('initialize-document', existingDocumentState);
        });
    });


    socket.on('text-change', ({ delta, roomId, username }) => {
        pool.query(
            'INSERT INTO documents (room_id,content) VALUES (?,?) ON DUPLICATE KEY UPDATE content=?',
            [roomId, JSON.stringify(delta), JSON.stringify(delta)],
            (err) => {
                if (err) {
                    console.log('Error updating document state:', err);
                    return;
                }
                socket.to(roomId).emit('text-change', { delta, username });
            }
        );
    });


    socket.on('save-document', ({ roomId, content }) => {
        pool.query(
            'UPDATE documents SET content = ? WHERE room_id=?',
            [content, roomId],
            (err) => {
                if (err) {
                    console.log('Error saving documents', err);
                    return;
                }
            }
        );
    });


    socket.on('cursor-selection', ({ roomId, username, cursorPos }) => {
        console.log('Cursor selection updated for' + username + '' + JSON.stringify(cursorPos));
        socket.to(roomId).emit('remove-cursor-selection', { username, cursorPos });
    });

    socket.on('cursor-move', ({ roomId, username, cursorPos }) => {
        console.log("Cursor selection updated for " + username + " " + JSON.stringify(cursorPos));
        socket.to(roomId).emit('remove-cursor-selection', { username, cursorPos });
    });

    socket.on('leave-room', ({ roomId, username }) => {
        socket.leave(roomId);
        console.log(`User ${username} left from room ${roomId}`);
        roomUsers[roomId] = roomUsers[roomId].filter(user => user.username !== username);

        socket.to(roomId).emit('user-left', username);

        io.in(roomId).emit('connected-users', roomUsers[roomId].map(user => user.username));
    });

});


const PORT = 5000;
httpserver.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));