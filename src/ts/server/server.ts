import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // Allow local host CORS stuff
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World!');
});

io.on('connection', (socket: any) => {
    console.log('a user connected');
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});
